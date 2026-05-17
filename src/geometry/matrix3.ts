/**
 * Mat3 — immutable 3x3 matrix operations, row-major.
 *
 * Layout: [m00, m01, m02, m10, m11, m12, m20, m21, m22]
 * i.e. matrix
 *   | m00 m01 m02 |
 *   | m10 m11 m12 |
 *   | m20 m21 m22 |
 *
 * When handing a Mat3 to three.js we transpose (three uses column-major).
 */
import type { Vec3 } from './index';

export type Mat3 = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

export const m3 = (
  m00: number, m01: number, m02: number,
  m10: number, m11: number, m12: number,
  m20: number, m21: number, m22: number,
): Mat3 => [m00, m01, m02, m10, m11, m12, m20, m21, m22];

export const IDENTITY: Mat3 = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
] as const;

/** Multiply: (A · B)[i,j] = Σ A[i,k] · B[k,j] */
export const mul = (a: Mat3, b: Mat3): Mat3 => {
  const r = (i: number, j: number): number =>
    a[i * 3 + 0]! * b[0 * 3 + j]! +
    a[i * 3 + 1]! * b[1 * 3 + j]! +
    a[i * 3 + 2]! * b[2 * 3 + j]!;
  return [
    r(0, 0), r(0, 1), r(0, 2),
    r(1, 0), r(1, 1), r(1, 2),
    r(2, 0), r(2, 1), r(2, 2),
  ];
};

/** Apply matrix to vector: m * v (column vector). */
export const mulVec = (m: Mat3, v: Vec3): Vec3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
];

export const transpose = (m: Mat3): Mat3 => [
  m[0], m[3], m[6],
  m[1], m[4], m[7],
  m[2], m[5], m[8],
];

export const determinant = (m: Mat3): number =>
  m[0] * (m[4] * m[8] - m[5] * m[7]) -
  m[1] * (m[3] * m[8] - m[5] * m[6]) +
  m[2] * (m[3] * m[7] - m[4] * m[6]);

/** Matrices equal within tolerance. For tests. */
export const approxEqualMat = (a: Mat3, b: Mat3, eps = 1e-10): boolean => {
  for (let i = 0; i < 9; i++) {
    if (Math.abs(a[i]! - b[i]!) >= eps) return false;
  }
  return true;
};

/** Flat row-major → column-major for three.js Matrix4.elements compatibility. */
export const toColumnMajor = (m: Mat3): readonly number[] => [
  m[0], m[3], m[6],
  m[1], m[4], m[7],
  m[2], m[5], m[8],
];
