import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * The class merge shadcn/ui components expect. `twMerge` resolves conflicts in
 * favour of the class given later — so a `className` passed in from outside
 * overrides the variant instead of fighting it over specificity.
 */
export const cn = (...inputs: ReadonlyArray<ClassValue>): string => twMerge(clsx(inputs))
