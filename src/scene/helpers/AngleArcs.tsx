import { Billboard, Text } from '@react-three/drei';
import { useTheodoliteStore } from '@/store';
import { mul, mulVec } from '@/geometry/matrix3';
import { rotX, rotY } from '@/geometry/rotations';
import { deg } from '@/geometry';
import { GlowLine } from './GlowLine';
import { PENCIL_FONT } from './pencilStyle';

const TRUNNION_Y = 0.92;
const SEGMENTS = 48;

const COLOR_HA = '#c89000'; // golden amber — readable on light bg
const COLOR_Z  = '#c03080'; // deep magenta

/** Generate points for the HA arc — horizontal sweep in XZ plane. */
function haArcPoints(HA: number, radius: number, y: number): [number, number, number][] {
  const n = Math.max(4, Math.round(Math.abs(HA) / (Math.PI * 2) * SEGMENTS));
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const angle = HA * (i / n);
    pts.push([-Math.sin(angle) * radius, y, Math.cos(angle) * radius]);
  }
  return pts;
}

/** Generate points for the z (zenith-distance) arc in the telescope vertical plane. */
function zArcPoints(HA: number, z: number, radius: number): [number, number, number][] {
  const n = Math.max(4, Math.round(Math.abs(z) / (Math.PI * 2) * SEGMENTS));
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const dir = mulVec(mul(rotY(-HA), rotX(z * (i / n))), [0, 1, 0]);
    pts.push([dir[0] * radius, TRUNNION_Y + dir[1] * radius, dir[2] * radius]);
  }
  return pts;
}

function arcMid<T extends [number, number, number]>(pts: T[]): T {
  return pts[Math.floor(pts.length / 2)]!;
}

export function AngleArcs({ showLabels }: { showLabels: boolean }) {
  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);

  const haR = 0.72;
  const haY = 0.04;
  const zR  = 0.52;

  const haPts = haArcPoints(HA, haR, haY);
  const zPts  = zArcPoints(HA, z, zR);

  const haMid = arcMid(haPts);
  const zMid  = arcMid(zPts);

  const haLabel = `HA ${deg(HA).toFixed(1)}°`;
  const zLabel  = `z ${deg(z).toFixed(1)}°`;

  return (
    <group>
      {/* HA arc */}
      {haPts.length >= 2 && (
        <>
          <GlowLine points={haPts} color={COLOR_HA} lineWidth={1.6} glowOpacity={0.15} />
          {/* Tick at start (+Z) */}
          <GlowLine
            points={[[0, haY, haR * 0.86], [0, haY, haR * 1.14]]}
            color={COLOR_HA}
            lineWidth={1.2}
            glowOpacity={0.1}
          />
          {showLabels && (
            <Billboard position={[haMid[0] * 1.30, haY + 0.12, haMid[2] * 1.30]}>
              <Text color={COLOR_HA} fontSize={0.1} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
                {haLabel}
              </Text>
            </Billboard>
          )}
        </>
      )}

      {/* z arc */}
      {zPts.length >= 2 && (
        <>
          <GlowLine points={zPts} color={COLOR_Z} lineWidth={1.6} glowOpacity={0.15} />
          {/* Tick at start (zenith) */}
          <GlowLine
            points={[[0, TRUNNION_Y + zR * 0.86, 0], [0, TRUNNION_Y + zR * 1.14, 0]]}
            color={COLOR_Z}
            lineWidth={1.2}
            glowOpacity={0.1}
          />
          {showLabels && (
            <Billboard position={[zMid[0] + 0.1, zMid[1] + 0.08, zMid[2] + 0.1]}>
              <Text color={COLOR_Z} fontSize={0.1} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
                {zLabel}
              </Text>
            </Billboard>
          )}
        </>
      )}
    </group>
  );
}
