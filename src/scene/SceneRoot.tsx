import { Canvas } from '@react-three/fiber';
import { Environment, Grid } from '@react-three/drei';
import { useSceneStore } from '@/store';
import { CameraRig } from './CameraRig';
import { WorldAxes } from './helpers/WorldAxes';
import { InstrumentAxes } from './helpers/InstrumentAxes';
import { AngleArcs } from './helpers/AngleArcs';
import { SightLine } from './helpers/SightLine';
import { ErrorMarkers } from './helpers/ErrorMarkers';
import { Theodolite } from './theodolite/Theodolite';
import { useTheodoliteGLB } from './theodolite/useTheodoliteGLB';
import { TargetLayer } from './targets/TargetLayer';

// Kick off GLB download before the canvas mounts.
useTheodoliteGLB.preload();

function SceneContents() {
  const showWorldAxes = useSceneStore((s) => s.showWorldAxes);
  const showInstrumentAxes = useSceneStore((s) => s.showInstrumentAxes);
  const showAngleArcs = useSceneStore((s) => s.showAngleArcs);
  const showLabels = useSceneStore((s) => s.showLabels);
  const showSightLine = useSceneStore((s) => s.showSightLine);

  return (
    <>
      {/* Low ambient so the directional light can sculpt form & cast tight shadows. */}
      <ambientLight intensity={0.35} />

      {/* Main key light — top-front-right, casts shadow. */}
      <directionalLight
        position={[4, 6, 3]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={4}
        shadow-camera-bottom={-1}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Fill from opposite side so the shadow side doesn't go dead black. */}
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />

      {/* PBR environment — gives the clearcoat real reflections and a visible
          Fresnel edge highlight without a manually authored cube map. */}
      <Environment preset="city" />

      {/* Invisible ground that catches the shadow — Grid itself can't. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.0001, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.28} />
      </mesh>

      {/* Ground grid — same tone as canvas bg, subtle grid lines */}
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#c8c8d2"
        sectionSize={2.5}
        sectionThickness={0.8}
        sectionColor="#b8b8c4"
        fadeDistance={22}
        fadeStrength={1.4}
        infiniteGrid={false}
      />

      {showWorldAxes && <WorldAxes />}
      {showInstrumentAxes && <InstrumentAxes showLabels={showLabels} />}
      {showAngleArcs && <AngleArcs showLabels={showLabels} />}
      {showSightLine && <SightLine />}
      <ErrorMarkers />

      <Theodolite />
      <TargetLayer />
      <CameraRig />
    </>
  );
}

export function SceneRoot() {
  return (
    <Canvas
      shadows
      camera={{ position: [2.6, 1.8, 3.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ background: 'var(--canvas-bg)' }}
    >
      <SceneContents />
    </Canvas>
  );
}
