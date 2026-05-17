import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import { useSceneStore } from '@/store';
import { useTheodoliteGLB } from './useTheodoliteGLB';
import { getBumpNoiseTexture, getRoughnessNoiseTexture } from './materials';

const EMISSIVE    = 0x0071e3;
const COL_BODY    = 0xfafafd;
const OUTLINE_COL = '#2a2a30';

export function Telescope() {
  const { nodes } = useTheodoliteGLB();
  const hoveredPart = useSceneStore((s) => s.hoveredPart);
  const selectedPart = useSceneStore((s) => s.selectedPart);
  const setHoveredPart = useSceneStore((s) => s.setHoveredPart);
  const setSelectedPart = useSceneStore((s) => s.setSelectedPart);

  const roughnessMap = useMemo(() => getRoughnessNoiseTexture(), []);
  const bumpMap      = useMemo(() => getBumpNoiseTexture(),      []);

  const isSelected = selectedPart === 'Telescope';
  const isHovered  = hoveredPart  === 'Telescope';
  const ei = isSelected ? 0.35 : isHovered ? 0.16 : 0;

  return (
    <mesh
      geometry={nodes.Telescope.geometry}
      castShadow
      receiveShadow
      onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Telescope'); }}
      onPointerOut={() => setHoveredPart(null)}
      onClick={(e) => { e.stopPropagation(); setSelectedPart('Telescope'); }}
    >
      <meshPhysicalMaterial
        color={COL_BODY}
        roughness={0.55}
        roughnessMap={roughnessMap}
        bumpMap={bumpMap}
        bumpScale={0.003}
        clearcoat={0.8}
        clearcoatRoughness={0.18}
        reflectivity={0.6}
        ior={1.5}
        emissive={EMISSIVE}
        emissiveIntensity={ei}
      />
      <Edges color={OUTLINE_COL} threshold={15} />
    </mesh>
  );
}
