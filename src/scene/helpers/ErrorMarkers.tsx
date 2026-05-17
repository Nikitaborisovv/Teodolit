/**
 * Phase 6 — error doubling visualization.
 *
 * After a face flip, two markers persist at the tip of the (erroneous) sight line:
 *   • "before" — where the sight pointed on the OLD face
 *   • "after"  — where the sight points on the NEW face
 *
 * The dashed line between them is the 3D embodiment of 2c/sin z:
 * the collimation error reverses sign across the zenith, so the displacement
 * between the two markers is roughly twice the single-face offset from the
 * ideal sight. Two-face averaging picks the midpoint of this segment.
 *
 * Coordinates are world-space, captured in Panel.handleFlip when the user
 * triggers a flip. Cleared via clearErrorMarkers (Panel button).
 */
import { Billboard, Text } from '@react-three/drei';
import { GlowLine } from './GlowLine';
import { PENCIL_FONT } from './pencilStyle';
import { useSceneStore } from '@/store';
import { length, sub } from '@/geometry/vec3';
import { deg } from '@/geometry';

const SPHERE_R = 0.035;
const COLOR_BEFORE = '#d27000'; // matches the dashed error sight on face L
const COLOR_AFTER = '#e0254a';
const COLOR_LINK = '#b38200';

export function ErrorMarkers() {
  const before = useSceneStore((s) => s.errorBefore);
  const after = useSceneStore((s) => s.errorAfter);
  const showLabels = useSceneStore((s) => s.showLabels);

  if (!before || !after) return null;

  const delta = sub(after, before);
  const linearDist = length(delta);
  // Angular displacement seen from the trunnion (where the sight line begins).
  // RAY_LEN = 1.7 is the marker radius from origin (TRUNNION_Y ≈ 0.92). For
  // small displacements: angle ≈ linearDist / RAY_LEN. Good enough for a readout.
  const angularDeg = deg(linearDist / 1.7);

  const mid: [number, number, number] = [
    (before[0] + after[0]) / 2,
    (before[1] + after[1]) / 2 + 0.08,
    (before[2] + after[2]) / 2,
  ];

  return (
    <group>
      <mesh position={before as [number, number, number]}>
        <sphereGeometry args={[SPHERE_R, 16, 16]} />
        <meshStandardMaterial color={COLOR_BEFORE} roughness={0.2} emissive={COLOR_BEFORE} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={after as [number, number, number]}>
        <sphereGeometry args={[SPHERE_R, 16, 16]} />
        <meshStandardMaterial color={COLOR_AFTER} roughness={0.2} emissive={COLOR_AFTER} emissiveIntensity={0.5} />
      </mesh>
      <GlowLine
        points={[before as [number, number, number], after as [number, number, number]]}
        color={COLOR_LINK}
        lineWidth={2}
        glowOpacity={0.15}
        dashed
        dashSize={0.04}
        gapSize={0.025}
      />
      {showLabels && (
        <Billboard position={mid}>
          <Text color={COLOR_LINK} fontSize={0.105} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
            {`2c ≈ ${angularDeg.toFixed(3)}°`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
