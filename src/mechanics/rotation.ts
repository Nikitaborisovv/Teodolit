/**
 * Pure state transitions for the theodolite kinematics.
 *
 * Each function takes a TheodoliteState and returns a new one with the
 * appropriate field updated, enforcing the invariants from DOMAIN_MODEL:
 *   HA ∈ [0, 2π),  z ∈ [0, π].
 *
 * No three.js, no React, no store imports. Reference: AGENTS.md.
 */
import { wrap2Pi } from '@/geometry';
import type { Face, TheodoliteState } from './state';

/**
 * Clamp `z` (zenith distance) into [-π, π].
 *
 * The classical geodetic range is [0, π], but the slider lets the user
 * scrub past the zenith into negative values to manually visualize the
 * telescope flip without rotating the alidade. The sight math handles
 * signed z naturally (sin/cos work in either direction); only the slider
 * range and the readout interpretation change.
 */
export const clampZ = (z: number): number => Math.max(-Math.PI, Math.min(Math.PI, z));

/** Wrap a horizontal angle into [0, 2π). */
export const wrapHA = (ha: number): number => wrap2Pi(ha);

/** Set HA to an absolute value (wrapped). */
export const setHA = (s: TheodoliteState, ha: number): TheodoliteState => ({
  ...s,
  HA: wrapHA(ha),
});

/** Rotate the alidade by `delta` radians around VV. */
export const rotateHA = (s: TheodoliteState, delta: number): TheodoliteState =>
  setHA(s, s.HA + delta);

/** Set z to an absolute value (clamped). */
export const setZ = (s: TheodoliteState, z: number): TheodoliteState => ({
  ...s,
  z: clampZ(z),
});

/** Tilt the telescope by `delta` radians around HH (clamped at the poles). */
export const tiltZ = (s: TheodoliteState, delta: number): TheodoliteState =>
  setZ(s, s.z + delta);

/**
 * Flip face L ↔ R.
 *
 * `HA` and `z` represent the SKY position (the actual target), not the
 * circle reading — flipping face keeps the sight direction fixed (DOMAIN_MODEL
 * invariant 5). Only the physical alidade pose changes, and the scene layer
 * is responsible for reflecting that when it renders face R.
 *
 * In Phase 5 the collimation effect inverts on flip (c → -c); that lives in
 * the error-projection code, not here.
 */
export const flipFace = (s: TheodoliteState): TheodoliteState => ({
  ...s,
  face: s.face === 'L' ? 'R' : 'L',
});

export const setFace = (s: TheodoliteState, face: Face): TheodoliteState => ({
  ...s,
  face,
});

/**
 * Convert a face-L state to the circle reading you would record on face R
 * for the SAME sky direction: (HA + π mod 2π, 2π − z) and swapped face.
 *
 * This is the canonical face-flip transformation from FORMULAS.md, used by
 * two-face averaging logic in later phases. Pure helper — does not mutate.
 */
export const toFaceRReading = (s: TheodoliteState): { HA: number; z: number; face: Face } => ({
  HA: wrapHA(s.HA + Math.PI),
  z: 2 * Math.PI - s.z, // may fall outside [0, π]; circle readings span [0, 2π)
  face: s.face === 'L' ? 'R' : 'L',
});
