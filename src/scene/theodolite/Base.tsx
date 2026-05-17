import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import { useSceneStore } from '@/store';
import { useTheodoliteGLB } from './useTheodoliteGLB';
import { getBumpNoiseTexture, getRoughnessNoiseTexture } from './materials';

const EMISSIVE     = 0x0071e3;
const COL_ACCENT   = 0x48484e;
const OUTLINE_COL  = '#2a2a30';
const BASE_Y       = 0.10;

export function Base() {
  const { nodes } = useTheodoliteGLB();
  const hoveredPart = useSceneStore((s) => s.hoveredPart);
  const selectedPart = useSceneStore((s) => s.selectedPart);
  const setHoveredPart = useSceneStore((s) => s.setHoveredPart);
  const setSelectedPart = useSceneStore((s) => s.setSelectedPart);

  const roughnessMap = useMemo(() => getRoughnessNoiseTexture(), []);
  const bumpMap      = useMemo(() => getBumpNoiseTexture(),      []);

  const isSelected = selectedPart === 'Base';
  const isHovered  = hoveredPart  === 'Base';
  const ei = isSelected ? 0.35 : isHovered ? 0.16 : 0;

  return (
    <mesh
      geometry={nodes.Base.geometry}
      position={[0, BASE_Y, 0]}
      castShadow
      receiveShadow
      onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Base'); }}
      onPointerOut={() => setHoveredPart(null)}
      onClick={(e) => { e.stopPropagation(); setSelectedPart('Base'); }}
    >
      <meshPhysicalMaterial
        color={COL_ACCENT}
        roughness={0.65}
        roughnessMap={roughnessMap}
        bumpMap={bumpMap}
        bumpScale={0.004}
        clearcoat={0.65}
        clearcoatRoughness={0.22}
        reflectivity={0.55}
        ior={1.5}
        emissive={EMISSIVE}
        emissiveIntensity={ei}
      />
      <Edges color={OUTLINE_COL} threshold={15} />
    </mesh>
  );
}
