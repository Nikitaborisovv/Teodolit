import { describe, expect, it } from 'vitest';
import { TAU } from '@/geometry';
import { computeAxes } from '@/geometry/axes';
import { approxEqual } from '@/geometry/vec3';
import { INITIAL_STATE } from './state';
import {
  clampZ,
  flipFace,
  rotateHA,
  setHA,
  setZ,
  tiltZ,
  toFaceRReading,
  wrapHA,
} from './rotation';

describe('mechanics/rotation — state transitions', () => {
  it('clampZ keeps z in [-π, π] (signed for manual telescope flip)', () => {
    expect(clampZ(-Math.PI - 0.5)).toBe(-Math.PI);
    expect(clampZ(Math.PI + 1)).toBe(Math.PI);
    expect(clampZ(1.2)).toBe(1.2);
    expect(clampZ(-1.2)).toBe(-1.2);
    expect(clampZ(0)).toBe(0);
  });

  it('wrapHA wraps into [0, 2π)', () => {
    expect(wrapHA(0)).toBe(0);
    expect(wrapHA(TAU)).toBeCloseTo(0);
    expect(wrapHA(-0.1)).toBeCloseTo(TAU - 0.1);
    expect(wrapHA(3 * TAU + 0.5)).toBeCloseTo(0.5);
  });

  it('rotateHA + 2π is the identity (HA-wise)', () => {
    const s1 = setHA(INITIAL_STATE, 1.3);
    const s2 = rotateHA(s1, TAU);
    expect(s2.HA).toBeCloseTo(s1.HA);
  });

  it('rotateHA composes additively (mod 2π)', () => {
    const s = rotateHA(rotateHA(setHA(INITIAL_STATE, 0), 1.0), 0.5);
    expect(s.HA).toBeCloseTo(1.5);
  });

  it('tiltZ clamps at ±π (signed range for manual flip)', () => {
    const sNearLow = setZ(INITIAL_STATE, -Math.PI + 0.1);
    expect(tiltZ(sNearLow, -1).z).toBe(-Math.PI);
    expect(tiltZ(setZ(INITIAL_STATE, Math.PI - 0.1), 1).z).toBe(Math.PI);
  });

  it('flipFace toggles L ↔ R and is involutive', () => {
    const sL = INITIAL_STATE;
    expect(sL.face).toBe('L');
    const sR = flipFace(sL);
    expect(sR.face).toBe('R');
    const sLL = flipFace(sR);
    expect(sLL.face).toBe('L');
    expect(sLL).toEqual(sL);
  });

  it('flipFace leaves (HA, z) unchanged — sky position is preserved', () => {
    const s = { ...INITIAL_STATE, HA: 1.4, z: 0.8 };
    const flipped = flipFace(s);
    expect(flipped.HA).toBe(s.HA);
    expect(flipped.z).toBe(s.z);
  });

  // Cross-layer check: the face-R "circle reading" must produce the same
  // sight direction as face-L. This is invariant 5 from DOMAIN_MODEL —
  // it sanity-checks that mechanics and geometry agree on the convention.
  it('toFaceRReading yields the same sight direction as the face-L state', () => {
    const states = [
      { HA: 0.2, z: 0.3 },
      { HA: 1.1, z: Math.PI / 2 },
      { HA: 2.9, z: 1.8 },
    ];
    for (const s of states) {
      const r = toFaceRReading({ ...INITIAL_STATE, ...s });
      const zzL = computeAxes(s).ZZ;
      const zzR = computeAxes({ HA: r.HA, z: r.z }).ZZ;
      expect(approxEqual(zzL, zzR, 1e-9)).toBe(true);
    }
  });
});
