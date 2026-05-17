import { describe, expect, it } from 'vitest';
import { TAU, deg, rad, wrap2Pi } from './index';

describe('geometry: angle helpers (Phase 1 smoke)', () => {
  it('deg/rad round-trip', () => {
    expect(deg(Math.PI)).toBeCloseTo(180);
    expect(rad(180)).toBeCloseTo(Math.PI);
  });

  it('wrap2Pi keeps angle in [0, 2π)', () => {
    expect(wrap2Pi(0)).toBe(0);
    expect(wrap2Pi(TAU)).toBeCloseTo(0);
    expect(wrap2Pi(-Math.PI)).toBeCloseTo(Math.PI);
    expect(wrap2Pi(3 * TAU + 1)).toBeCloseTo(1);
  });
});
