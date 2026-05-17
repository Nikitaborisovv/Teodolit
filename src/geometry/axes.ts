/**
 * computeAxes — derive instrument axes (VV, HH, ZZ) from theodolite state.
 *
 * **Conventions (this project):**
 * - World up = +Y (Three.js).
 * - HA = 0: trunnion HH points along +X; horizontal sight (z=π/2) points along +Z.
 * - HA increases clockwise when viewed from above (geodetic). In our right-handed
 *   coord system that maps to a NEGATIVE rotation around +Y, i.e. `rotY(-HA)`.
 * - z (zenith distance) = 0 means telescope at zenith (+Y). z = π/2 = horizon.
 *
 * For Phase 2 we treat the IDEAL instrument only:
 *   VV ⟂ HH ⟂ ZZ, no collimation / index / tilt errors.
 * Error terms are wired in Phase 5; they will perturb HH and ZZ but VV stays +Y
 * unless tilt is non-zero.
 *
 * Reference matrix (FORMULAS.md, adapted to our axis labeling):
 *   M = R_y(-HA) · R_x(z)
 * with ZZ = M · UNIT_Y and HH = R_y(-HA) · UNIT_X.
 */
import type { Vec3 } from './index';
import { mul, mulVec } from './matrix3';
import { rotX, rotY } from './rotations';
import { UNIT_X, UNIT_Y } from './vec3';

export interface InstrumentAxes {
  readonly VV: Vec3;
  readonly HH: Vec3;
  readonly ZZ: Vec3;
}

export interface IdealAxesInput {
  readonly HA: number;
  readonly z: number;
}

export const computeAxes = (state: IdealAxesInput): InstrumentAxes => {
  const alidade = rotY(-state.HA);
  const telescope = mul(alidade, rotX(state.z));
  return {
    VV: UNIT_Y,
    HH: mulVec(alidade, UNIT_X),
    ZZ: mulVec(telescope, UNIT_Y),
  };
};

/** Sight direction = ZZ in the ideal case (collimation error c will perturb it in Phase 5). */
export const sightDirection = (state: IdealAxesInput): Vec3 => computeAxes(state).ZZ;
