/**
 * CameraRig — orbital camera with three view presets.
 *
 * Reads the active preset from useSceneStore. Each time the preset (or its
 * nonce) changes, CameraControls eases to the new position via setLookAt.
 *
 * The instrument sits centered around (0, 0.6, 0). All target points use
 * this height so the camera always frames the trunnion.
 */
import { CameraControls } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useSceneStore } from '@/store';
import type { CameraPreset } from '@/store';

const INSTRUMENT_CENTER: [number, number, number] = [0, 0.6, 0];

const PRESETS: Record<CameraPreset, [number, number, number]> = {
  perspective: [2.6, 1.8, 3.4],
  front: [0, 0.6, 3.6],
  top: [0, 4, 0.001],
};

export function CameraRig() {
  const ref = useRef<CameraControls | null>(null);
  const preset = useSceneStore((s) => s.cameraPreset);
  const nonce = useSceneStore((s) => s.cameraPresetNonce);

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    const [px, py, pz] = PRESETS[preset];
    const [tx, ty, tz] = INSTRUMENT_CENTER;
    void controls.setLookAt(px, py, pz, tx, ty, tz, true);
  }, [preset, nonce]);

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={1}
      maxDistance={15}
      minPolarAngle={0.05}
      maxPolarAngle={Math.PI - 0.05}
    />
  );
}
