import { Billboard, Text } from '@react-three/drei';
import { useTargetsStore } from '@/store';
import type { TargetDef } from '@/store';
import { PENCIL_FONT, PENCIL_GRAPHITE } from '@/scene/helpers/pencilStyle';

const COLORS = ['#0a84ff', '#32d74b', '#ff453a', '#bf5af2', '#ff9f0a', '#5ac8fa', '#ff375f', '#34c759'];

const POLE_H = 0.28;
const SPHERE_R_DEFAULT = 0.045;
const SPHERE_R_SELECTED = 0.065;

interface Props {
  target: TargetDef;
  colorIndex: number;
}

export function Target({ target, colorIndex }: Props) {
  const selectedId = useTargetsStore((s) => s.selectedTargetId);
  const selectTarget = useTargetsStore((s) => s.selectTarget);

  const isSelected = selectedId === target.id;
  const color = COLORS[colorIndex % COLORS.length];
  const [tx, , tz] = target.position;

  return (
    <group
      position={[tx, 0, tz]}
      onClick={(e) => {
        e.stopPropagation();
        selectTarget(isSelected ? null : target.id);
      }}
    >
      {/* Pole */}
      <mesh position={[0, POLE_H / 2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, POLE_H, 6]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>

      {/* Top marker sphere */}
      <mesh position={[0, POLE_H + (isSelected ? SPHERE_R_SELECTED : SPHERE_R_DEFAULT), 0]}>
        <sphereGeometry args={[isSelected ? SPHERE_R_SELECTED : SPHERE_R_DEFAULT, 10, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.15}
        />
      </mesh>

      {/* Ground ring when selected */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <ringGeometry args={[0.1, 0.14, 24]} />
          <meshStandardMaterial color={color} transparent opacity={0.65} depthWrite={false} />
        </mesh>
      )}

      {/* Label */}
      <Billboard position={[0, POLE_H + 0.18, 0]}>
        <Text
          color={isSelected ? color : PENCIL_GRAPHITE}
          fontSize={isSelected ? 0.13 : 0.105}
          anchorX="center"
          anchorY="middle"
          font={PENCIL_FONT}
        >
          {target.label}
        </Text>
      </Billboard>
    </group>
  );
}
