import { describe, expect, it } from 'vitest';
import { TAU } from './index';
import { computeAxes, sightDirection } from './axes';
import { UNIT_X, UNIT_Y, UNIT_Z, approxEqual, dot, length, neg } from './vec3';

const EPS = 1e-10;

describe('geometry/axes — ideal instrument (Phase 2)', () => {
  it('VV is always +Y in the ideal case', () => {
    for (const HA of [0, 0.5, Math.PI, 1.7]) {
      for (const z of [0, Math.PI / 4, Math.PI / 2, Math.PI]) {
        const ax = computeAxes({ HA, z });
        expect(approxEqual(ax.VV, UNIT_Y)).toBe(true);
      }
    }
  });

  it('All three axes are unit vectors', () => {
    const ax = computeAxes({ HA: 1.2, z: 0.7 });
    expect(length(ax.VV)).toBeCloseTo(1);
    expect(length(ax.HH)).toBeCloseTo(1);
    expect(length(ax.ZZ)).toBeCloseTo(1);
  });

  // Invariant 1 from DOMAIN_MODEL: with zero errors, VV·HH = 0, HH·ZZ = 0.
  it('VV ⟂ HH and HH ⟂ ZZ across the state space', () => {
    for (const HA of [0, 0.3, 1.0, 2.5, -0.4]) {
      for (const z of [0.0, 0.5, Math.PI / 2, 1.6, Math.PI]) {
        const { VV, HH, ZZ } = computeAxes({ HA, z });
        expect(Math.abs(dot(VV, HH))).toBeLessThan(EPS);
        expect(Math.abs(dot(HH, ZZ))).toBeLessThan(EPS);
      }
    }
  });

  // Invariant 4: rotating HA by 2π returns identical axes.
  it('HA + 2π returns identical axes', () => {
    const a = computeAxes({ HA: 0.4, z: 1.1 });
    const b = computeAxes({ HA: 0.4 + TAU, z: 1.1 });
    expect(approxEqual(a.VV, b.VV, 1e-9)).toBe(true);
    expect(approxEqual(a.HH, b.HH, 1e-9)).toBe(true);
    expect(approxEqual(a.ZZ, b.ZZ, 1e-9)).toBe(true);
  });

  // Anchor cases that pin down the sign convention. If any of these flip,
  // the scene will render mirrored or upside-down — review before "fixing".
  describe('reference orientations', () => {
    it('HA=0, z=0: ZZ points to zenith (+Y)', () => {
      expect(approxEqual(computeAxes({ HA: 0, z: 0 }).ZZ, UNIT_Y)).toBe(true);
    });

    it('HA=0, z=π/2: HH=+X, ZZ=+Z', () => {
      const ax = computeAxes({ HA: 0, z: Math.PI / 2 });
      expect(approxEqual(ax.HH, UNIT_X, 1e-9)).toBe(true);
      expect(approxEqual(ax.ZZ, UNIT_Z, 1e-9)).toBe(true);
    });

    it('HA=π/2 (geodetic CW), z=π/2: HH rotates to +Z, ZZ to -X', () => {
      const ax = computeAxes({ HA: Math.PI / 2, z: Math.PI / 2 });
      expect(approxEqual(ax.HH, UNIT_Z, 1e-9)).toBe(true);
      expect(approxEqual(ax.ZZ, neg(UNIT_X), 1e-9)).toBe(true);
    });

    it('HA=π, z=π/2: ZZ flips to -Z (telescope looks "back")', () => {
      const ax = computeAxes({ HA: Math.PI, z: Math.PI / 2 });
      expect(approxEqual(ax.ZZ, neg(UNIT_Z), 1e-9)).toBe(true);
    });
  });

  // Invariant 5: sight direction is continuous across face flip.
  // Face R = (HA + π, 2π − z) describes the same physical sight as face L (HA, z).
  it('two-face sight: ZZ(HA, z) = ZZ(HA + π, 2π − z)', () => {
    for (const HA of [0.0, 0.3, 1.2]) {
      for (const z of [0.1, Math.PI / 3, Math.PI / 2, 2.0]) {
        const zzL = sightDirection({ HA, z });
        const zzR = sightDirection({ HA: HA + Math.PI, z: TAU - z });
        expect(approxEqual(zzL, zzR, 1e-9)).toBe(true);
      }
    }
  });

  it('sightDirection equals computeAxes(state).ZZ in the ideal case', () => {
    const s = { HA: 0.9, z: 0.6 };
    expect(approxEqual(sightDirection(s), computeAxes(s).ZZ)).toBe(true);
  });
});
