/**
 * Phase 5 — ideal vs erroneous sight line.
 *
 * Solid green: where the sight WOULD point with zero errors (current HA, z).
 * Dashed amber: where the sight actually points given c, i, tiltX, tiltY.
 * With zero errors the two coincide.
 */
import { useTheodoliteStore } from '@/store';
import { sightDirection } from '@/geometry/axes';
import { sightWithErrors } from '@/geometry/errors';
import { TRUNNION_Y } from '../theodolite/Alidade';
import { GlowLine } from './GlowLine';

const RAY_LEN = 1.7;

const COLOR_IDEAL = '#1aab30'; // vivid green — readable on light bg
const COLOR_ERROR = '#d27000'; // amber — readable on light bg

function tip(
  origin: readonly [number, number, number],
  dir: readonly [number, number, number],
  len: number,
): [number, number, number] {
  return [origin[0] + dir[0] * len, origin[1] + dir[1] * len, origin[2] + dir[2] * len];
}

export function SightLine() {
  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);
  const face = useTheodoliteStore((s) => s.face);
  const errors = useTheodoliteStore((s) => s.errors);

  const ideal = sightDirection({ HA, z });
  const actual = sightWithErrors({ HA, z, face, errors });

  const origin: [number, number, number] = [0, TRUNNION_Y, 0];
  const idealEnd = tip(origin, ideal, RAY_LEN);
  const actualEnd = tip(origin, actual, RAY_LEN);

  return (
    <group>
      <GlowLine points={[origin, idealEnd]} color={COLOR_IDEAL} lineWidth={2} glowOpacity={0.18} glowScale={5} />
      <GlowLine
        points={[origin, actualEnd]}
        color={COLOR_ERROR}
        lineWidth={2}
        glowOpacity={0.18}
        glowScale={5}
        dashed
        dashSize={0.06}
        gapSize={0.04}
      />
    </group>
  );
}
