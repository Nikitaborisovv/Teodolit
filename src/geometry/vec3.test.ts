import { describe, expect, it } from 'vitest';
import {
  UNIT_X,
  UNIT_Y,
  UNIT_Z,
  ZERO,
  add,
  angleBetween,
  approxEqual,
  cross,
  dot,
  length,
  normalize,
  scale,
  sub,
  v3,
} from './vec3';

describe('geometry/vec3', () => {
  it('add/sub/scale/neg are componentwise', () => {
    expect(add([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9]);
    expect(sub([4, 5, 6], [1, 2, 3])).toEqual([3, 3, 3]);
    expect(scale([1, -2, 3], 2)).toEqual([2, -4, 6]);
  });

  it('dot product of orthonormal basis', () => {
    expect(dot(UNIT_X, UNIT_Y)).toBe(0);
    expect(dot(UNIT_Y, UNIT_Z)).toBe(0);
    expect(dot(UNIT_Z, UNIT_X)).toBe(0);
    expect(dot(UNIT_X, UNIT_X)).toBe(1);
  });

  it('cross product right-hand rule: x × y = z, y × z = x, z × x = y', () => {
    expect(cross(UNIT_X, UNIT_Y)).toEqual(UNIT_Z);
    expect(cross(UNIT_Y, UNIT_Z)).toEqual(UNIT_X);
    expect(cross(UNIT_Z, UNIT_X)).toEqual(UNIT_Y);
  });

  it('cross is anti-commutative: a × b = -(b × a)', () => {
    const a = v3(1, 2, 3);
    const b = v3(-4, 0.5, 7);
    expect(approxEqual(cross(a, b), scale(cross(b, a), -1))).toBe(true);
  });

  it('length and normalize', () => {
    expect(length([3, 4, 0])).toBe(5);
    const n = normalize([3, 4, 0]);
    expect(length(n)).toBeCloseTo(1);
    expect(approxEqual(normalize(ZERO), ZERO)).toBe(true);
  });

  it('angleBetween: orthogonal = π/2, parallel = 0, antiparallel = π', () => {
    expect(angleBetween(UNIT_X, UNIT_Y)).toBeCloseTo(Math.PI / 2);
    expect(angleBetween(UNIT_X, UNIT_X)).toBeCloseTo(0);
    expect(angleBetween(UNIT_X, scale(UNIT_X, -1))).toBeCloseTo(Math.PI);
  });
});
