/**
 * Convert any string to a URL-safe kebab-case slug.
 * - Lowercase
 * - Replace any run of non-alphanumeric chars with a single hyphen
 * - Strip leading/trailing hyphens
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
