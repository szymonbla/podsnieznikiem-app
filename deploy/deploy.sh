#!/usr/bin/env bash
# Deploy the server onto the AWS machine.
#
#     ./deploy/deploy.sh
#
# GitHub Actions runs this same script after a merge into `main`
# (.github/workflows/ci.yml). By hand it is useful for the first deployment and
# whenever the automation has to be bypassed.
#
# There is no frontend here. Cloudflare Pages builds and serves the static
# files straight from the repository.
#
# The build happens on whatever machine runs this script. The target machine has
# 1 GiB of memory — building there would be the most brittle step of the lot.
#
# The machine has no port open to the network, so nothing can be sent to it
# directly. The package travels the long way round:
#
#     here  ->  S3  ->  machine
#           (upload)   (pulls it on a Session Manager command)
#
# Requires: the machine running, valid AWS credentials.
set -euo pipefail

# An empty profile is valid: in GitHub Actions the credentials come from the
# environment and no profile exists.
AWS_PROFILE_NAME="${AWS_PROFILE_NAME-homebase}"
REGION="${REGION:-eu-north-1}"
BUCKET="${BUCKET:-podsnieznikiem-deployments-962453725229}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ -n "$AWS_PROFILE_NAME" ]; then
  aws() { command aws --profile "$AWS_PROFILE_NAME" --region "$REGION" "$@"; }
else
  aws() { command aws --region "$REGION" "$@"; }
fi

echo "== 1/4 Server -> Linux ARM executable"
# A single file with the runtime built in. The machine has neither bun nor a
# node_modules directory.
bun build --compile --target=bun-linux-arm64 \
  apps/server/src/core/server.ts --outfile deploy/server

echo "== 2/4 Package -> S3"
# COPYFILE_DISABLE — without it macOS adds its own `._*` metadata files to the
# archive. On Linux they are litter that misleads a fault hunt.
COPYFILE_DISABLE=1 tar -czf /tmp/podsnieznikiem-package.tar.gz -C deploy \
  server compose.yml on-machine.sh
aws s3 cp /tmp/podsnieznikiem-package.tar.gz "s3://$BUCKET/package.tar.gz"

echo "== 3/4 Command for the machine"
MACHINE="$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=podsnieznikiem-app" "Name=instance-state-name,Values=running" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)"

if [ "$MACHINE" = "None" ] || [ -z "$MACHINE" ]; then
  echo "The machine is not running. Start it and try again." >&2
  exit 1
fi
echo "   machine: $MACHINE"

COMMANDS=$(python3 - "$BUCKET" "$REGION" <<'PY'
import json, sys
bucket, region = sys.argv[1], sys.argv[2]
print(json.dumps({"commands": [
    "set -euo pipefail",
    f"aws s3 cp s3://{bucket}/package.tar.gz /tmp/package.tar.gz --region {region}",
    "rm -rf /tmp/package && mkdir -p /tmp/package",
    "tar -xzf /tmp/package.tar.gz -C /tmp/package",
    "bash /tmp/package/on-machine.sh",
]}))
PY
)

COMMAND_ID="$(aws ssm send-command --instance-ids "$MACHINE" \
  --document-name AWS-RunShellScript \
  --parameters "$COMMANDS" \
  --timeout-seconds 1800 \
  --query 'Command.CommandId' --output text)"

echo "== 4/4 Waiting for the result ($COMMAND_ID)"
# Deliberately not `ssm wait command-executed`: it gives up after about a
# hundred seconds. A first deployment onto a fresh machine pulls container
# images and takes longer — and an abandoned wait looks like a failure even
# though the deployment finishes well in the background.
for _ in $(seq 1 120); do
  STATE="$(aws ssm get-command-invocation --command-id "$COMMAND_ID" \
    --instance-id "$MACHINE" --query 'Status' --output text 2>/dev/null || echo Pending)"
  case "$STATE" in
    Pending | InProgress | Delayed) sleep 10 ;;
    *) break ;;
  esac
done

RESULT="$(aws ssm get-command-invocation --command-id "$COMMAND_ID" --instance-id "$MACHINE" \
  --query '{s:Status,o:StandardOutputContent,e:StandardErrorContent}' --output json)"

python3 - "$RESULT" <<'PY'
import json, sys
d = json.loads(sys.argv[1])
print(d["o"].rstrip())
if d["e"].strip():
    print("--- errors ---", file=sys.stderr)
    print(d["e"].rstrip(), file=sys.stderr)
print(f"\nStatus: {d['s']}")
sys.exit(0 if d["s"] == "Success" else 1)
PY
