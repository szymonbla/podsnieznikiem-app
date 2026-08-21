#!/bin/bash
# The second half of a deployment — the half that runs on the AWS machine.
#
# Do not run this by hand. `deploy.sh` invokes it through Session Manager,
# once the package has been unpacked into /tmp/package.
set -euo pipefail

PACKAGE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIRECTORY=/mnt/data/app

mkdir -p "$DIRECTORY" /mnt/data/postgres

cp "$PACKAGE/server" "$PACKAGE/compose.yml" "$DIRECTORY/"
chmod +x "$DIRECTORY/server"

# Leftovers from the layout with Caddy and the frontend on the machine. Unused,
# but while hunting a fault they look like part of a working whole.
rm -rf "$DIRECTORY/Caddyfile" "$DIRECTORY/dist" "$DIRECTORY/serwer"

cd "$DIRECTORY"

# The database password is created once, here, and never leaves the machine.
# The file sits on the data volume, so it survives a rebuild of the machine —
# and so does the tunnel token beside it.
if [ ! -f .env ]; then
  printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 24)" > .env
  chmod 600 .env
fi

# The tunnel comes up only when its token is present in .env.
if grep -q '^TUNNEL_TOKEN=.\+' .env; then
  PROFILE=(--profile public)
else
  PROFILE=()
  echo "WARNING: no TUNNEL_TOKEN in .env — the public address will not work."
fi

docker compose "${PROFILE[@]}" up -d --remove-orphans
docker compose "${PROFILE[@]}" ps
