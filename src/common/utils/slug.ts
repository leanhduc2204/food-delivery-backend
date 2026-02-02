/**
 * Derives a URL-safe slug from a name: lowercase, replace spaces/special with hyphen, collapse multiple hyphens.
 */
export function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}
