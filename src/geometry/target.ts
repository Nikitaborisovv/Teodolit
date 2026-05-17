/**
 * Angles from a direction vector to theodolite HA and z.
 *
 * Convention (matches axes.ts):
 *   HA=0, z=π/2 → sight along +Z
 *   HA increases clockwise from above (geodetic).
 *   z=0 → zenith (+Y);  z=π/2 → horizon;  z=π → nadir.
 *
 * Derivation: ZZ = [-sin(z)·sin(HA), cos(z), sin(z)·cos(HA)]
 *   → z = acos(dy)
 *   → HA = atan2(-dx, dz)
 */
export function directionToAngles(
  dx: number,
  dy: number,
  dz: number,
): { HA: number; z: number } {
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 1e-9) return { HA: 0, z: Math.PI / 2 };
  const ndx = dx / len;
  const ndy = dy / len;
  const ndz = dz / len;
  const z = Math.acos(Math.max(-1, Math.min(1, ndy)));
  const HA = Math.atan2(-ndx, ndz);
  return { HA, z };
}
