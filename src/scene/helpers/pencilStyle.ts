/**
 * Shared constants for the "pencil sketch" helper layer.
 *
 * PENCIL_FONT — handwritten font URL used by every <Text> in the scene.
 * Caveat from @fontsource via jsdelivr (a stable npm-mirror CDN that
 * serves the raw .woff). troika-three-text accepts woff/ttf URLs.
 * If the CDN fails, troika falls back to its built-in font silently.
 *
 * PENCIL_GRAPHITE — neutral dark grey used when a label has no
 * semantic colour of its own (target names, generic labels).
 */
export const PENCIL_FONT =
  'https://cdn.jsdelivr.net/npm/@fontsource/caveat@5.1.0/files/caveat-latin-400-normal.woff';

export const PENCIL_GRAPHITE = '#2a2a30';
