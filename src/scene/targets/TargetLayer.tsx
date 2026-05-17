import type { ThreeEvent } from '@react-three/fiber';
import { useTargetsStore } from '@/store';
import { Target } from './Target';

const GROUND_SIZE = 30;

export function TargetLayer() {
  const targets = useTargetsStore((s) => s.targets);
  const placingMode = useTargetsStore((s) => s.placingMode);
  const addTarget = useTargetsStore((s) => s.addTarget);
  const selectTarget = useTargetsStore((s) => s.selectTarget);

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (placingMode) {
      e.stopPropagation();
      addTarget([e.point.x, 0, e.point.z]);
    } else {
      selectTarget(null);
    }
  };

  return (
    <group>
      {/* Transparent click plane just above the visual ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
        onClick={handleGroundClick}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {targets.map((t, i) => (
        <Target key={t.id} target={t} colorIndex={i} />
      ))}
    </group>
  );
}
