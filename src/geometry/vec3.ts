/**
 * Vec3 — immutable 3D vector operations.
 * Pure math. No three.js. All angles in radians.
 */
import type { Vec3 } from './index';

export const v3 = (x: number, y: number, z: number): Vec3 => [x, y, z] as const;

export const ZERO: Vec3 = [0, 0, 0] as const;
export const UNIT_X: Vec3 = [1, 0, 0] as const;
export const UNIT_Y: Vec3 = [0, 1, 0] as const;
export const UNIT_Z: Vec3 = [0, 0, 1] as const;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const neg = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
export const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

export const dot = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const lengthSq = (a: Vec3): number => dot(a, a);
export const length = (a: Vec3): number => Math.sqrt(lengthSq(a));

export const normalize = (a: Vec3): Vec3 => {
  const len = length(a);
  if (len === 0) return ZERO;
  const inv = 1 / len;
  return [a[0] * inv, a[1] * inv, a[2] * inv];
};

/** Are two vectors equal within tolerance? Useful for tests. */
export const approxEqual = (a: Vec3, b: Vec3, eps = 1e-10): boolean =>
  Math.abs(a[0] - b[0]) < eps && Math.abs(a[1] - b[1]) < eps && Math.abs(a[2] - b[2]) < eps;

/** Angle between two vectors in radians, range [0, π]. */
export const angleBetween = (a: Vec3, b: Vec3): number => {
  const denom = length(a) * length(b);
  if (denom === 0) return 0;
  const c = Math.min(1, Math.max(-1, dot(a, b) / denom));
  return Math.acos(c);
};
