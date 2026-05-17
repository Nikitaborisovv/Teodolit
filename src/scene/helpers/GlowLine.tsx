import { useMemo } from 'react';
import * as THREE from 'three';
import { getPencilStrokeTexture } from '@/scene/theodolite/materials';

interface GlowLineProps {
  points: [number, number, number][];
  color: string;
  lineWidth?: number;
  /** @deprecated kept for backwards-compat; ignored under pencil style. */
  glowScale?: number;
  /** @deprecated kept for backwards-compat; ignored under pencil style. */
  glowOpacity?: number;
  /** @deprecated dashed mode dropped — pencil texture provides its own gaps. */
  dashed?: boolean;
  dashSize?: number;
  gapSize?: number;
}

/**
 * "Pencil" line — every helper line (axes, arcs, sight line, error link)
 * goes through here, so a single tube + pencil texture turns the whole
 * helper layer into a hand-drawn look.
 *
 * Implementation: TubeGeometry around the polyline, MeshBasicMaterial
 * with the pencil-stroke texture as `map`. We use a tube rather than a
 * three.js Line/Line2 because:
 *   - LineMaterial from three-stdlib ignores `map` in its shader, so
 *     drei <Line> can't carry a texture even with ref hacks.
 *   - A tube has proper UVs (U along length, V around circumference),
 *     so the pencil texture flows correctly from start to finish.
 *   - Width is controllable in world units (line2 widths are pixel-based
 *     and mismatched between display scales).
 */
export function GlowLine({
  points,
  color,
  lineWidth = 2,
}: GlowLineProps) {
  const map = useMemo(() => getPencilStrokeTexture(), []);

  const geometry = useMemo(() => {
    if (points.length < 2) return new THREE.BufferGeometry();
    const vec3s = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    const curve =
      vec3s.length === 2
        ? new THREE.LineCurve3(vec3s[0]!, vec3s[1]!)
        : new THREE.CatmullRomCurve3(vec3s);
    const radius = lineWidth * 0.0032;
    const tubularSegs = Math.max(24, (vec3s.length - 1) * 16);
    return new THREE.TubeGeometry(curve, tubularSegs, radius, 6, false);
  }, [points, lineWidth]);

  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshBasicMaterial
        color={color}
        map={map}
        transparent
        opacity={0.95}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
