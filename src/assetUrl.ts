/** Resolve a file in `public/` against Vite's `base` (required on GitHub Pages). */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
