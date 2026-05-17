/**
 * Elementary rotation matrices in a right-handed coordinate system.
 *
 * Convention: positive angle = counter-clockwise when viewed from the
 * positive end of the axis looking toward the origin (right-hand rule).
 *
 * The theodolite uses world-up = +Y (Three.js). Geodetic-convention sign
 * adjustments (HA increases clockwise looking down) live in `mechanics/`,
 * not here. This module is pure math.
 */
import type { Mat3 } from './matrix3';

/** Rotation around +X by `angle` radians. */
export const rotX = (angle: number): Mat3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    1, 0, 0,
    0, c, -s,
    0, s, c,
  ];
};

/** Rotation around +Y by `angle` radians. */
export const rotY = (angle: number): Mat3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, 0, s,
    0, 1, 0,
    -s, 0, c,
  ];
};

/** Rotation around +Z by `angle` radians. */
export const rotZ = (angle: number): Mat3 => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    c, -s, 0,
    s, c, 0,
    0, 0, 1,
  ];
};

/**
 * Rotation around an arbitrary unit axis by `angle` radians.
 * Rodrigues' rotation formula. Caller must pass a normalized axis.
 */
export const rotAxis = (axis: readonly [number, number, number], angle: number): Mat3 => {
  const [x, y, z] = axis;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const t = 1 - c;
  return [
    t * x * x + c,      t * x * y - s * z,  t * x * z + s * y,
    t * x * y + s * z,  t * y * y + c,      t * y * z - s * x,
    t * x * z - s * y,  t * y * z + s * x,  t * z * z + c,
  ];
};
