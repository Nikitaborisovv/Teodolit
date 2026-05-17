/**
 * TheodoliteState — domain state types, defined in the framework-free
 * mechanics/ layer so geometry/ stays untouched and store/ + scene/ + ui/
 * can all import without circular concerns.
 *
 * Single source of truth — store/theodolite.ts re-exports these.
 *
 * Reference: DOMAIN_MODEL.md
 */

export type Face = 'L' | 'R';

export interface TheodoliteErrors {
  /** Collimation error (rad). Effect on HA grows as 1/sin z. */
  c: number;
  /** Vertical index error / place of zenith MZ (rad). */
  i: number;
  /** Vertical-axis tilt, X component (rad). Not removed by two-face averaging. */
  tiltX: number;
  /** Vertical-axis tilt, Y component (rad). */
  tiltY: number;
}

export interface TheodoliteState {
  /** Horizontal angle (rad). Stored wrapped into [0, 2π). */
  HA: number;
  /**
   * Zenith distance (rad), clamped to [-π, π]. Horizon = π/2, zenith = 0.
   * The classical range is [0, π]; negative values are allowed so the user
   * can manually flip the telescope through the zenith via the slider
   * without rotating the alidade (Phase 6).
   */
  z: number;
  /** Current face ("circle left" / "circle right"). */
  face: Face;
  errors: TheodoliteErrors;
}

export const ZERO_ERRORS: TheodoliteErrors = {
  c: 0,
  i: 0,
  tiltX: 0,
  tiltY: 0,
};

export const INITIAL_STATE: TheodoliteState = {
  HA: 0,
  z: Math.PI / 2, // horizon — most useful default for a survey instrument
  face: 'L',
  errors: ZERO_ERRORS,
};
