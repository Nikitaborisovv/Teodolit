import { useMemo, type ReactNode } from 'react';
import { Edges } from '@react-three/drei';
import { useSceneStore } from '@/store';
import { useTheodoliteGLB } from './useTheodoliteGLB';
import { getBumpNoiseTexture, getRoughnessNoiseTexture } from './materials';

/** Trunnion height (HH axis) above world origin. Must match scripts/generate-glb.mjs. */
export const TRUNNION_Y = 0.92;

const EMISSIVE    = 0x0071e3;
const COL_BODY    = 0xfafafd;
const OUTLINE_COL = '#2a2a30';
const ALIDADE_Y   = 0.625;

interface AlidadeProps {
  children?: ReactNode;
}

export function Alidade({ children }: AlidadeProps) {
  const { nodes } = useTheodoliteGLB();
  const hoveredPart = useSceneStore((s) => s.hoveredPart);
  const selectedPart = useSceneStore((s) => s.selectedPart);
  const setHoveredPart = useSceneStore((s) => s.setHoveredPart);
  const setSelectedPart = useSceneStore((s) => s.setSelectedPart);

  const roughnessMap = useMemo(() => getRoughnessNoiseTexture(), []);
  const bumpMap      = useMemo(() => getBumpNoiseTexture(),      []);

  const isSelected = selectedPart === 'Alidade';
  const isHovered  = hoveredPart  === 'Alidade';
  const ei = isSelected ? 0.35 : isHovered ? 0.16 : 0;

  return (
    <group>
      <mesh
        geometry={nodes.Alidada.geometry}
        position={[0, ALIDADE_Y, 0]}
        castShadow
        receiveShadow
        onPointerOver={(e) => { e.stopPropagation(); setHoveredPart('Alidade'); }}
        onPointerOut={() => setHoveredPart(null)}
        onClick={(e) => { e.stopPropagation(); setSelectedPart('Alidade'); }}
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

      <group position={[0, TRUNNION_Y, 0]}>{children}</group>
    </group>
  );
}
