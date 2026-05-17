/**
 * geometry/ — pure math layer.
 *
 * Rules (CLAUDE.md, AGENTS.md):
 *  - No three.js imports (enforced by ESLint).
 *  - All angles in radians.
 *  - Pure functions on TheodoliteState → vectors / angles / corrections.
 *
 * Phase 2 will populate this with axes(), sightDirection(), correctedHA(), etc.
 */

export type Vec3 = readonly [number, number, number];

export const TAU = Math.PI * 2;

export const deg = (rad: number): number => (rad * 180) / Math.PI;
export const rad = (deg: number): number => (deg * Math.PI) / 180;

export const wrap2Pi = (a: number): number => {
  const r = a % TAU;
  return r < 0 ? r + TAU : r;
};
