import { Billboard, Text } from '@react-three/drei';
import { GlowLine } from './GlowLine';
import { PencilArrow } from './PencilArrow';
import { PENCIL_FONT } from './pencilStyle';

const LEN = 1.5;
const LABEL_GAP = 0.13;
const LINE_W = 1.8;

interface AxisProps {
  end: [number, number, number];
  direction: [number, number, number];
  color: string;
  label: string;
}

function Axis({ end, direction, color, label }: AxisProps) {
  const [ex, ey, ez] = end;
  const labelPos: [number, number, number] = [
    ex + (ex !== 0 ? LABEL_GAP : 0),
    ey + (ey !== 0 ? LABEL_GAP : 0),
    ez + (ez !== 0 ? LABEL_GAP : 0),
  ];
  return (
    <>
      <GlowLine points={[[0, 0, 0], end]} color={color} lineWidth={LINE_W} />
      <PencilArrow tip={end} direction={direction} color={color} size={0.1} />
      <Billboard position={labelPos}>
        <Text color={color} fontSize={0.11} anchorX="center" anchorY="middle" font={PENCIL_FONT}>
          {label}
        </Text>
      </Billboard>
    </>
  );
}

export function WorldAxes() {
  return (
    <group>
      <Axis end={[LEN, 0, 0]} direction={[1, 0, 0]} color="#e63025" label="X" />
      <Axis end={[0, LEN, 0]} direction={[0, 1, 0]} color="#1aab30" label="Y" />
      <Axis end={[0, 0, LEN]} direction={[0, 0, 1]} color="#007aff" label="Z" />
    </group>
  );
}
