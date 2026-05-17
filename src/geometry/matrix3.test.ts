import { describe, expect, it } from 'vitest';
import {
  IDENTITY,
  approxEqualMat,
  determinant,
  m3,
  mul,
  mulVec,
  transpose,
} from './matrix3';
import { UNIT_X, UNIT_Y, UNIT_Z, approxEqual } from './vec3';

describe('geometry/matrix3', () => {
  it('identity is multiplicative neutral', () => {
    const a = m3(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(approxEqualMat(mul(IDENTITY, a), a)).toBe(true);
    expect(approxEqualMat(mul(a, IDENTITY), a)).toBe(true);
  });

  it('identity maps basis vectors to themselves', () => {
    expect(approxEqual(mulVec(IDENTITY, UNIT_X), UNIT_X)).toBe(true);
    expect(approxEqual(mulVec(IDENTITY, UNIT_Y), UNIT_Y)).toBe(true);
    expect(approxEqual(mulVec(IDENTITY, UNIT_Z), UNIT_Z)).toBe(true);
  });

  it('matrix multiplication is associative', () => {
    const a = m3(1, 2, 3, 0, 1, 4, 5, 6, 0);
    const b = m3(0, -1, 1, 2, 0, 3, 1, 1, 0);
    const c = m3(1, 0, 2, 3, 1, 0, 0, 2, 1);
    expect(approxEqualMat(mul(mul(a, b), c), mul(a, mul(b, c)))).toBe(true);
  });

  it('transpose is involutive', () => {
    const a = m3(1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(approxEqualMat(transpose(transpose(a)), a)).toBe(true);
  });

  it('determinant of identity is 1', () => {
    expect(determinant(IDENTITY)).toBe(1);
  });

  it('determinant of singular matrix is 0', () => {
    const s = m3(1, 2, 3, 2, 4, 6, 1, 1, 1);
    expect(determinant(s)).toBe(0);
  });

  it('mulVec respects linearity', () => {
    const m = m3(1, 2, 0, 0, 1, 3, 4, 0, 1);
    const a = mulVec(m, UNIT_X);
    expect(a).toEqual([1, 0, 4]);
  });
});
