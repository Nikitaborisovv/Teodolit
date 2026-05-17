import { describe, it, expect } from 'vitest';
import { directionToAngles } from './target';

const π = Math.PI;

describe('directionToAngles', () => {
  it('HA=0, z=π/2 — sight along +Z', () => {
    const { HA, z } = directionToAngles(0, 0, 1);
    expect(HA).toBeCloseTo(0);
    expect(z).toBeCloseTo(π / 2);
  });

  it('z=0 — straight up (+Y)', () => {
    const { z } = directionToAngles(0, 1, 0);
    expect(z).toBeCloseTo(0);
  });

  it('z=π — straight down (-Y)', () => {
    const { z } = directionToAngles(0, -1, 0);
    expect(z).toBeCloseTo(π);
  });

  it('HA=π/2 — sight along -X', () => {
    const { HA, z } = directionToAngles(-1, 0, 0);
    expect(HA).toBeCloseTo(π / 2);
    expect(z).toBeCloseTo(π / 2);
  });

  it('HA=π — sight along -Z', () => {
    const { HA, z } = directionToAngles(0, 0, -1);
    expect(Math.abs(HA)).toBeCloseTo(π);
    expect(z).toBeCloseTo(π / 2);
  });

  it('HA=-π/2 — sight along +X', () => {
    const { HA, z } = directionToAngles(1, 0, 0);
    expect(HA).toBeCloseTo(-π / 2);
    expect(z).toBeCloseTo(π / 2);
  });

  it('unnormalized vector gives same angles as normalized', () => {
    const a = directionToAngles(2, 0, 2);
    const b = directionToAngles(1, 0, 1);
    expect(a.HA).toBeCloseTo(b.HA);
    expect(a.z).toBeCloseTo(b.z);
  });

  it('zero vector returns finite safe fallback', () => {
    const { HA, z } = directionToAngles(0, 0, 0);
    expect(isFinite(HA)).toBe(true);
    expect(isFinite(z)).toBe(true);
  });
});
