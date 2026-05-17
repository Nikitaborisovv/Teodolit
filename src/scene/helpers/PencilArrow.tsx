import { GlowLine } from './GlowLine';

interface Props {
  /** Tip of the arrow (where the axis ends). */
  tip: [number, number, number];
  /** Unit vector pointing in the direction the arrow is "flying". */
  direction: [number, number, number];
  color: string;
  /** Length of each feather. */
  size?: number;
  lineWidth?: number;
}

/**
 * 3D arrowhead drawn as 3 pencil feathers from `tip` going back-and-out
 * at 120° around the axis. Reads as a sketchy arrow from any viewing
 * angle (a single 2D chevron disappears edge-on).
 */
export function PencilArrow({
  tip,
  direction,
  color,
  size = 0.1,
  lineWidth = 1.8,
}: Props) {
  // Normalise direction.
  const [dx, dy, dz] = direction;
  const len = Math.hypot(dx, dy, dz) || 1;
  const fx = dx / len, fy = dy / len, fz = dz / len;

  // Pick a helper vector not collinear with `direction`, then build an
  // orthonormal basis (perpA, perpB) in the plane perpendicular to it.
  const helper: [number, number, number] = Math.abs(fy) < 0.95 ? [0, 1, 0] : [1, 0, 0];
  // perpA = cross(direction, helper), normalised
  let ax = fy * helper[2] - fz * helper[1];
  let ay = fz * helper[0] - fx * helper[2];
  let az = fx * helper[1] - fy * helper[0];
  const aLen = Math.hypot(ax, ay, az) || 1;
  ax /= aLen; ay /= aLen; az /= aLen;
  // perpB = cross(direction, perpA)
  const bx = fy * az - fz * ay;
  const by = fz * ax - fx * az;
  const bz = fx * ay - fy * ax;

  const back = size;          // how far back along the axis the feather base sits
  const splay = size * 0.55;  // how far out from the axis

  // Three feathers at 0°, 120°, 240° around the axis.
  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

  return (
    <>
      {angles.map((theta, i) => {
        const cx = Math.cos(theta), sx = Math.sin(theta);
        const ox = ax * cx + bx * sx;
        const oy = ay * cx + by * sx;
        const oz = az * cx + bz * sx;
        const tail: [number, number, number] = [
          tip[0] - fx * back + ox * splay,
          tip[1] - fy * back + oy * splay,
          tip[2] - fz * back + oz * splay,
        ];
        return (
          <GlowLine
            key={i}
            points={[tip, tail]}
            color={color}
            lineWidth={lineWidth}
          />
        );
      })}
    </>
  );
}
