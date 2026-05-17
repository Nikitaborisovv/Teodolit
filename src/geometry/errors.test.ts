import { describe, expect, it } from 'vitest';
import { sightDirection } from './axes';
import {
  collimationDeltaHA,
  rawHA,
  rawV,
  sightWithErrors,
  tiltDeltaHA,
  tiltMatrix,
  totalDeltaHA,
} from './errors';
import { approxEqual } from './vec3';
import { INITIAL_STATE, ZERO_ERRORS, type TheodoliteState } from '@/mechanics';

const mkState = (over: Partial<TheodoliteState> = {}): TheodoliteState => ({
  ...INITIAL_STATE,
  ...over,
  errors: { ...ZERO_ERRORS, ...(over.errors ?? {}) },
});

/** Horizontal-circle reading recovered from the actual sight direction in world. */
const measuredHA = (sight: readonly [number, number, number]): number =>
  Math.atan2(-sight[0], sight[2]);

describe('geometry/errors — sightWithErrors (geometric model)', () => {
  it('reduces to the ideal sight when all errors are zero', () => {
    for (const HA of [0, 0.4, 1.2, 2.6]) {
      for (const z of [0.3, Math.PI / 2, 1.4]) {
        const s = mkState({ HA, z });
        expect(approxEqual(sightWithErrors(s), sightDirection({ HA, z }), 1e-9)).toBe(true);
      }
    }
  });

  it('preserves invariant 5 (same sight direction on L and R) under zero errors', () => {
    const sL = mkState({ HA: 0.7, z: 1.1, face: 'L' });
    const sR = mkState({ HA: 0.7, z: 1.1, face: 'R' });
    expect(approxEqual(sightWithErrors(sL), sightWithErrors(sR), 1e-9)).toBe(true);
  });

  it('collimation: small c gives ΔHA ≈ c / sin z on face L', () => {
    const c = 0.002;
    const z = Math.PI / 3;
    const HA = 0.5;
    const sL = mkState({ HA, z, face: 'L', errors: { ...ZERO_ERRORS, c } });
    const delta = measuredHA(sightWithErrors(sL)) - HA;
    expect(delta).toBeCloseTo(c / Math.sin(z), 4);
  });

  it('collimation: 1/sin z magnification — same c gives larger ΔHA near zenith', () => {
    const c = 0.002;
    const HA = 0.5;
    const dHoriz = measuredHA(sightWithErrors(
      mkState({ HA, z: Math.PI / 2, errors: { ...ZERO_ERRORS, c } }),
    )) - HA;
    const dHigh = measuredHA(sightWithErrors(
      mkState({ HA, z: Math.PI / 6, errors: { ...ZERO_ERRORS, c } }),
    )) - HA;
    expect(Math.abs(dHigh)).toBeGreaterThan(Math.abs(dHoriz));
  });

  it('collimation flips sign on face flip (basis of two-face averaging)', () => {
    const c = 0.003;
    const z = 1.0;
    const HA = 1.4;
    const dL = measuredHA(sightWithErrors(mkState({ HA, z, face: 'L', errors: { ...ZERO_ERRORS, c } }))) - HA;
    const dR = measuredHA(sightWithErrors(mkState({ HA, z, face: 'R', errors: { ...ZERO_ERRORS, c } }))) - HA;
    expect(dL + dR).toBeCloseTo(0, 6);
  });

  it('index error does NOT perturb the sight direction', () => {
    const HA = 0.6, z = 1.1;
    const s = mkState({ HA, z, errors: { ...ZERO_ERRORS, i: 0.004 } });
    expect(approxEqual(sightWithErrors(s), sightDirection({ HA, z }), 1e-9)).toBe(true);
  });

  it('tilt matches the (tiltX sin HA − tiltY cos HA) cot z formula in the small-angle limit', () => {
    const HA = 0.6, z = 1.0, tiltX = 0.001, tiltY = 0.0008;
    const s = mkState({ HA, z, errors: { ...ZERO_ERRORS, tiltX, tiltY } });
    const measured = measuredHA(sightWithErrors(s)) - HA;
    expect(measured).toBeCloseTo(tiltDeltaHA(HA, z, tiltX, tiltY), 5);
  });
});

describe('geometry/errors — analytical formulas', () => {
  it('collimationDeltaHA: ±c / sin z by face', () => {
    expect(collimationDeltaHA(0.002, Math.PI / 4, 'L'))
      .toBeCloseTo(0.002 / Math.sin(Math.PI / 4));
    expect(collimationDeltaHA(0.002, Math.PI / 4, 'R'))
      .toBeCloseTo(-0.002 / Math.sin(Math.PI / 4));
  });

  it('collimationDeltaHA returns 0 at exact zenith / nadir to stay finite', () => {
    expect(collimationDeltaHA(0.01, 0, 'L')).toBe(0);
    expect(collimationDeltaHA(0.01, Math.PI, 'L')).toBe(0);
  });

  it('tiltDeltaHA matches its closed form for arbitrary inputs', () => {
    const HA = 0.9, z = 1.1, tx = 0.002, ty = 0.0015;
    const expected = (tx * Math.sin(HA) - ty * Math.cos(HA)) * (Math.cos(z) / Math.sin(z));
    expect(tiltDeltaHA(HA, z, tx, ty)).toBeCloseTo(expected, 12);
  });

  it('rawV: face L = z + i, face R = 2π − z − i', () => {
    const sL = mkState({ z: 1.2, face: 'L', errors: { ...ZERO_ERRORS, i: 0.003 } });
    const sR = mkState({ z: 1.2, face: 'R', errors: { ...ZERO_ERRORS, i: 0.003 } });
    expect(rawV(sL)).toBeCloseTo(1.2 + 0.003);
    expect(rawV(sR)).toBeCloseTo(2 * Math.PI - 1.2 - 0.003);
  });

  it('rawHA composes collimation and tilt contributions', () => {
    const HA = 1.2, z = 0.9;
    const errs = { ...ZERO_ERRORS, c: 0.002, tiltX: 0.001, tiltY: -0.0005 };
    const s = mkState({ HA, z, face: 'L', errors: errs });
    const expected =
      HA +
      collimationDeltaHA(errs.c, z, 'L') +
      tiltDeltaHA(HA, z, errs.tiltX, errs.tiltY);
    expect(rawHA(s)).toBeCloseTo(expected);
  });
});

describe('geometry/errors — two-face averaging (DOMAIN_MODEL invariant 2)', () => {
  it('cancels collimation: (ΔHA_L + ΔHA_R) / 2 = 0', () => {
    const c = 0.004, z = 1.0;
    expect((collimationDeltaHA(c, z, 'L') + collimationDeltaHA(c, z, 'R')) / 2).toBeCloseTo(0);
  });

  it('cancels index error: (V_L + V_R) / 2 − π = 0', () => {
    const z = 1.2, i = 0.005;
    const sL = mkState({ z, face: 'L', errors: { ...ZERO_ERRORS, i } });
    const sR = mkState({ z, face: 'R', errors: { ...ZERO_ERRORS, i } });
    expect((rawV(sL) + rawV(sR)) / 2 - Math.PI).toBeCloseTo(0);
  });

  it('does NOT cancel tilt: average of ΔHA_L and ΔHA_R equals the tilt term itself', () => {
    const HA = 0.7, z = 1.1, tiltX = 0.002, tiltY = 0.001;
    const sL = mkState({ HA, z, face: 'L', errors: { ...ZERO_ERRORS, tiltX, tiltY } });
    const sR = mkState({ HA, z, face: 'R', errors: { ...ZERO_ERRORS, tiltX, tiltY } });
    const avg = (totalDeltaHA(sL) + totalDeltaHA(sR)) / 2;
    expect(avg).toBeCloseTo(tiltDeltaHA(HA, z, tiltX, tiltY));
    expect(Math.abs(avg)).toBeGreaterThan(1e-6);
  });
});

describe('geometry/errors — tiltMatrix', () => {
  it('is the identity when both tilts are zero', () => {
    const m = tiltMatrix(0, 0);
    expect(approxEqual([m[1], m[4], m[7]], [0, 1, 0])).toBe(true);
    expect(approxEqual([m[0], m[3], m[6]], [1, 0, 0])).toBe(true);
    expect(approxEqual([m[2], m[5], m[8]], [0, 0, 1])).toBe(true);
  });

  it('post-tilt VV ≈ (tiltY, 1, −tiltX) for small angles', () => {
    const tx = 0.003, ty = 0.002;
    const m = tiltMatrix(tx, ty);
    const vv: [number, number, number] = [m[1], m[4], m[7]];
    expect(vv[0]).toBeCloseTo(ty, 5);   // X-component linear in tilt
    expect(vv[1]).toBeCloseTo(1, 4);    // Y is second-order in tilt (cos·cos)
    expect(vv[2]).toBeCloseTo(-tx, 5);
  });
});
