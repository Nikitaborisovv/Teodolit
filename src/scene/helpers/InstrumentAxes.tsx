import { Billboard, Text } from '@react-three/drei';
import { useTheodoliteStore } from '@/store';
import { computeAxes } from '@/geometry/axes';
import { GlowLine } from './GlowLine';
import { PENCIL_FONT } from './pencilStyle';

/** Y-coordinate of the trunnion pivot (must match Alidade.tsx TRUNNION_Y). */
const TRUNNION_Y = 0.92;

const VV_COLOR = '#9e35d8';
const HH_COLOR = '#d27000';
const ZZ_COLOR = '#00a0cc';

const LINE_W = 2;

export function InstrumentAxes({ showLabels }: { showLabels: boolean }) {
  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);
  const { VV, HH, ZZ } = computeAxes({ HA, z });

  const trunnion: [number, number, number] = [0, TRUNNION_Y, 0];

  // VV — vertical axis through the instrument center, from base to above
  const vvBot: [number, number, number] = [VV[0] * -0.15, VV[1] * -0.15, VV[2] * -0.15];
  const vvTop: [number, number, number] = [VV[0] * 1.45, VV[1] * 1.45, VV[2] * 1.45];

  // HH — trunnion axis, symmetric around trunnion
  const hhA: [number, number, number] = [
    trunnion[0] + HH[0] * 0.7,
    trunnion[1] + HH[1] * 0.7,
    trunnion[2] + HH[2] * 0.7,
  ];
  const hhB: [number, number, number] = [
    trunnion[0] - HH[0] * 0.7,
    trunnion[1] - HH[1] * 0.7,
    trunnion[2] - HH[2] * 0.7,
  ];

  // ZZ — sight axis from trunnion in sight direction
  const zzTip: [number, number, number] = [
    trunnion[0] + ZZ[0] * 1.4,
    trunnion[1] + ZZ[1] * 1.4,
    trunnion[2] + ZZ[2] * 1.4,
  ];

  return (
    <group>
      {/* VV */}
      <GlowLine points={[vvBot, vvTop]} color={VV_COLOR} lineWidth={LINE_W} glowOpacity={0.13} />
      {showLabels && (
        <Billboard position={[vvTop[0] + 0.05, vvTop[1] + 0.09, vvTop[2]]}>
          <Text color={VV_COLOR} fontSize={0.11} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
            VV
          </Text>
        </Billboard>
      )}

      {/* HH */}
      <GlowLine points={[hhA, hhB]} color={HH_COLOR} lineWidth={LINE_W} glowOpacity={0.13} />
      {showLabels && (
        <Billboard position={[hhA[0] + 0.09, hhA[1] + 0.05, hhA[2]]}>
          <Text color={HH_COLOR} fontSize={0.11} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
            HH
          </Text>
        </Billboard>
      )}

      {/* ZZ */}
      <GlowLine points={[trunnion, zzTip]} color={ZZ_COLOR} lineWidth={LINE_W} glowOpacity={0.13} />
      {showLabels && (
        <Billboard position={[zzTip[0], zzTip[1] + 0.08, zzTip[2]]}>
          <Text color={ZZ_COLOR} fontSize={0.11} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
            ZZ
          </Text>
        </Billboard>
      )}
    </group>
  );
}
