/**
 * useSceneStore — visual toggles only (helpers visibility, lite mode).
 * No domain state. Reference: PROJECT_ARCHITECTURE.md
 */
import { create } from 'zustand';
import type { Vec3 } from '@/geometry';

export type CameraPreset = 'perspective' | 'front' | 'top';

/** Phase 6: how the telescope flip animation plays. */
export type FlipMode = 'auto' | 'slow' | 'step';

/** Selectable parts of the theodolite model. */
export type TheodolitePart = 'Base' | 'Alidade' | 'Telescope';

export interface SceneState {
  showWorldAxes: boolean;
  showInstrumentAxes: boolean;
  showAngleArcs: boolean;
  showLabels: boolean;
  /** Phase 5: draw ideal vs erroneous sight rays. Coincide when all errors = 0. */
  showSightLine: boolean;
  liteMode: boolean;
  orthographic: boolean;
  cameraPreset: CameraPreset;
  /** Bumped each time a preset is re-selected; CameraRig keys off this. */
  cameraPresetNonce: number;
  hoveredPart: TheodolitePart | null;
  selectedPart: TheodolitePart | null;
  /** Phase 6: flip animation speed. */
  flipMode: FlipMode;
  /** Phase 6: step-mode — telescope flipped, waiting for user to rotate alidade. */
  pendingFlip: boolean;
  /**
   * Phase 6: monotonic counter incremented whenever the user explicitly
   * REQUESTS an animated flip (Flip button click). Theodolite.tsx watches
   * this nonce to distinguish "intentional animated flip" from "state
   * changed because user dragged the z slider through zero" — the latter
   * should NOT replay a 1.5 s animation on every slider tick.
   */
  animationRequestNonce: number;
  /**
   * Phase 6: snapshots of the actual sight endpoint (with errors applied)
   * before and after a face flip. Used to draw the "ошибка удваивается"
   * comparison in 3D — two markers + connecting line + displacement readout.
   */
  errorBefore: Vec3 | null;
  errorAfter: Vec3 | null;
}

type BooleanKeys = {
  [K in keyof SceneState]: SceneState[K] extends boolean ? K : never;
}[keyof SceneState];

export interface SceneActions {
  toggle: (key: BooleanKeys) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  setHoveredPart: (part: TheodolitePart | null) => void;
  setSelectedPart: (part: TheodolitePart | null) => void;
  setFlipMode: (mode: FlipMode) => void;
  setPendingFlip: (v: boolean) => void;
  setErrorMarkers: (before: Vec3, after: Vec3) => void;
  setErrorBefore: (v: Vec3 | null) => void;
  setErrorAfter: (v: Vec3 | null) => void;
  clearErrorMarkers: () => void;
  requestFlipAnimation: () => void;
}

export const useSceneStore = create<SceneState & SceneActions>((set) => ({
  showWorldAxes: true,
  showInstrumentAxes: true,
  showAngleArcs: false,
  showLabels: true,
  showSightLine: true,
  liteMode: false,
  orthographic: false,
  cameraPreset: 'perspective',
  cameraPresetNonce: 0,
  hoveredPart: null,
  selectedPart: null,
  flipMode: 'auto',
  pendingFlip: false,
  animationRequestNonce: 0,
  errorBefore: null,
  errorAfter: null,
  toggle: (key) => set((s) => ({ [key]: !s[key] }) as Partial<SceneState>),
  setCameraPreset: (preset) =>
    set((s) => ({ cameraPreset: preset, cameraPresetNonce: s.cameraPresetNonce + 1 })),
  setHoveredPart: (part) => set({ hoveredPart: part }),
  setSelectedPart: (part) =>
    set((s) => ({ selectedPart: s.selectedPart === part ? null : part })),
  setFlipMode: (mode) => set({ flipMode: mode }),
  setPendingFlip: (v) => set({ pendingFlip: v }),
  setErrorMarkers: (before, after) => set({ errorBefore: before, errorAfter: after }),
  setErrorBefore: (v) => set({ errorBefore: v }),
  setErrorAfter: (v) => set({ errorAfter: v }),
  clearErrorMarkers: () => set({ errorBefore: null, errorAfter: null }),
  requestFlipAnimation: () =>
    set((s) => ({ animationRequestNonce: s.animationRequestNonce + 1 })),
}));
