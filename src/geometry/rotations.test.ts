import { describe, expect, it } from 'vitest';
import { TAU } from './index';
import { IDENTITY, approxEqualMat, determinant, mul, mulVec, transpose } from './matrix3';
import { rotAxis, rotX, rotY, rotZ } from './rotations';
import { UNIT_X, UNIT_Y, UNIT_Z, approxEqual, neg } from './vec3';

describe('geometry/rotations', () => {
  it('rot(0) is identity for all axes', () => {
    expect(approxEqualMat(rotX(0), IDENTITY)).toBe(true);
    expect(approxEqualMat(rotY(0), IDENTITY)).toBe(true);
    expect(approxEqualMat(rotZ(0), IDENTITY)).toBe(true);
  });

  it('rot(2π) is identity (within tolerance)', () => {
    expect(approxEqualMat(rotX(TAU), IDENTITY, 1e-9)).toBe(true);
    expect(approxEqualMat(rotY(TAU), IDENTITY, 1e-9)).toBe(true);
    expect(approxEqualMat(rotZ(TAU), IDENTITY, 1e-9)).toBe(true);
  });

  it('rotation preserves its axis', () => {
    expect(approxEqual(mulVec(rotX(1.234), UNIT_X), UNIT_X)).toBe(true);
    expect(approxEqual(mulVec(rotY(1.234), UNIT_Y), UNIT_Y)).toBe(true);
    expect(approxEqual(mulVec(rotZ(1.234), UNIT_Z), UNIT_Z)).toBe(true);
  });

  it('determinant of rotation = 1 (proper rotation, no reflection)', () => {
    expect(determinant(rotX(0.7))).toBeCloseTo(1);
    expect(determinant(rotY(-2.1))).toBeCloseTo(1);
    expect(determinant(rotZ(3.14))).toBeCloseTo(1);
  });

  it('rotation is orthogonal: R · Rᵀ = I', () => {
    const r = rotX(1.1);
    expect(approxEqualMat(mul(r, transpose(r)), IDENTITY)).toBe(true);
  });

  it('R(π) flips the perpendicular axes', () => {
    expect(approxEqual(mulVec(rotX(Math.PI), UNIT_Y), neg(UNIT_Y))).toBe(true);
    expect(approxEqual(mulVec(rotY(Math.PI), UNIT_X), neg(UNIT_X))).toBe(true);
    expect(approxEqual(mulVec(rotZ(Math.PI), UNIT_X), neg(UNIT_X))).toBe(true);
  });

  it('R(-θ) = R(θ)ᵀ (inverse of rotation = transpose)', () => {
    const a = 0.7;
    expect(approxEqualMat(rotY(-a), transpose(rotY(a)))).toBe(true);
  });

  it('rotAxis matches rotX/rotY/rotZ for canonical axes', () => {
    expect(approxEqualMat(rotAxis(UNIT_X, 0.5), rotX(0.5))).toBe(true);
    expect(approxEqualMat(rotAxis(UNIT_Y, 0.5), rotY(0.5))).toBe(true);
    expect(approxEqualMat(rotAxis(UNIT_Z, 0.5), rotZ(0.5))).toBe(true);
  });
});
