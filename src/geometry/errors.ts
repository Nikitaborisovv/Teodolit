/**
 * Phase 5 — instrument error projection.
 *
 * Two parallel models share the same conventions (FORMULAS.md):
 *  • Geometric (exact): the sight direction in world space is computed as a
 *    chain of rotations — tilt → alidade → telescope → collimation — applied
 *    to the body-frame sight vector +Y. Used by the scene to draw the
 *    actual sight line.
 *  • Analytical (small-angle): closed-form deltas on horizontal and vertical
 *    circle readings. Used for the UI readout and to illustrate two-face
 *    averaging. Both agree in the small-angle limit (tests pin this down).
 *
 * Semantics: (HA, z) is the instrument's dial pose. With zero errors, the
 * ideal sight direction equals computeAxes({HA, z}).ZZ. Errors perturb the
 * actual sight away from that direction.
 *
 * Sign convention chosen so the geometric model matches FORMULAS.md exactly:
 *   ΔHA_collimation = ±c / sin z          (+ on face L, − on face R)
 *   ΔHA_tilt        = (tiltX sin HA − tiltY cos HA) cot z   (face-independent)
 *   V_L = z + i,  V_R = 2π − z − i
 *
 * Two-face averaging cancels c and i; tilt survives (DOMAIN_MODEL invariant 2).
 *
 * No three.js. Reference: AGENTS.md (GeometryAgent).
 */
import type { Face, TheodoliteState } from '@/mechanics';
import type { Vec3 } from './index';
import type { Mat3 } from './matrix3';
import { mul, mulVec } from './matrix3';
import { rotX, rotY, rotZ } from './rotations';
import { UNIT_Y } from './vec3';

/** Below this |sin z| we treat the formulas as singular and clip the readout. */
const SIN_Z_EPS = 1e-9;

const faceSign = (face: Face): 1 | -1 => (face === 'L' ? 1 : -1);

/**
 * Tilt rotation matrix for the instrument base.
 *
 * R_tilt = R_x(−tiltX) · R_z(−tiltY)
 *
 * The sign choice is what makes the geometric model agree with the FORMULAS.md
 * expression ΔHA ≈ (tiltX sin HA − tiltY cos HA) cot z in the small-angle limit.
 * Equivalently, the post-tilt VV ≈ (tiltY, 1, −tiltX) for small angles —
 * counter-intuitive naming but it lets us quote the textbook formula verbatim.
 */
export const tiltMatrix = (tiltX: number, tiltY: number): Mat3 =>
  mul(rotX(-tiltX), rotZ(-tiltY));

/**
 * Exact sight direction including all errors.
 *
 * Face R uses the same physical pose as the rendered scene
 * (haPhys = HA + π, zPhys = 2π − z); the c-effect comes out negated
 * automatically because the additional rotY(−π) folds into the collimation.
 */
export const sightWithErrors = (state: TheodoliteState): Vec3 => {
  const { HA, z, face, errors } = state;
  const haPhys = face === 'L' ? HA : HA + Math.PI;
  const zPhys = face === 'L' ? z : Math.PI * 2 - z;
  // Collimation rotates the body-frame sight around +Z (the in-trunnion
  // perpendicular). Using rotY here would be a no-op since the sight IS +Y.
  const chain = mul(mul(rotY(-haPhys), rotX(zPhys)), rotZ(errors.c));
  return mulVec(mul(tiltMatrix(errors.tiltX, errors.tiltY), chain), UNIT_Y);
};

/* ---------- Analytical (small-angle) formulas, per FORMULAS.md ---------- */

/**
 * ΔHA from collimation: +c / sin z on face L, −c / sin z on face R.
 *
 * Singular at zenith / nadir — the magnification 1/sin z is the central
 * educational point. We return 0 at the exact singular points to keep the
 * UI readout finite; the geometric model gives the correct (sub-linear in c)
 * answer there anyway.
 */
export const collimationDeltaHA = (c: number, z: number, face: Face): number => {
  const s = Math.sin(z);
  if (Math.abs(s) < SIN_Z_EPS) return 0;
  return (faceSign(face) * c) / s;
};

/** ΔHA from vertical-axis tilt. Face-independent → not cancelled by two-face averaging. */
export const tiltDeltaHA = (
  HA: number,
  z: number,
  tiltX: number,
  tiltY: number,
): number => {
  const s = Math.sin(z);
  if (Math.abs(s) < SIN_Z_EPS) return 0;
  const cot = Math.cos(z) / s;
  return (tiltX * Math.sin(HA) - tiltY * Math.cos(HA)) * cot;
};

/** Total horizontal-reading offset (raw − sky), small-angle. */
export const totalDeltaHA = (state: TheodoliteState): number => {
  const { HA, z, face, errors } = state;
  return (
    collimationDeltaHA(errors.c, z, face) +
    tiltDeltaHA(HA, z, errors.tiltX, errors.tiltY)
  );
};

/**
 * Vertical-circle reading V (raw):
 *   face L: V = z + i      (so z_true = V − i)
 *   face R: V = 2π − z − i (so z_true = (2π − V) − i)
 */
export const rawV = (state: TheodoliteState): number => {
  const { z, face, errors } = state;
  return face === 'L' ? z + errors.i : Math.PI * 2 - z - errors.i;
};

/** Raw horizontal-circle reading. Caller wraps into [0, 2π) if needed. */
export const rawHA = (state: TheodoliteState): number => state.HA + totalDeltaHA(state);
