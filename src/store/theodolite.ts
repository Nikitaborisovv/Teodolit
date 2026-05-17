/**
 * useTheodoliteStore — domain state. Delegates all kinematic math to
 * mechanics/, keeps only React-facing wiring (zustand glue).
 *
 * No math here. If you find yourself doing arithmetic on state, move it to
 * mechanics/ and call the function from here.
 */
import { create } from 'zustand';
import {
  INITIAL_STATE,
  ZERO_ERRORS,
  flipFace as flipFaceM,
  rotateHA as rotateHAM,
  setFace as setFaceM,
  setHA as setHAM,
  setZ as setZM,
  tiltZ as tiltZM,
  type Face,
  type TheodoliteErrors,
  type TheodoliteState,
} from '@/mechanics';

export type { Face, TheodoliteErrors, TheodoliteState };

export interface TheodoliteActions {
  setHA: (ha: number) => void;
  rotateHA: (delta: number) => void;
  setZ: (z: number) => void;
  tiltZ: (delta: number) => void;
  setFace: (face: Face) => void;
  flipFace: () => void;
  setError: <K extends keyof TheodoliteErrors>(key: K, value: number) => void;
  resetErrors: () => void;
  reset: () => void;
}

export const useTheodoliteStore = create<TheodoliteState & TheodoliteActions>((set) => ({
  ...INITIAL_STATE,
  setHA: (ha) => set((s) => setHAM(s, ha)),
  rotateHA: (delta) => set((s) => rotateHAM(s, delta)),
  setZ: (z) => set((s) => setZM(s, z)),
  tiltZ: (delta) => set((s) => tiltZM(s, delta)),
  setFace: (face) => set((s) => setFaceM(s, face)),
  flipFace: () => set((s) => flipFaceM(s)),
  setError: (key, value) =>
    set((s) => ({ errors: { ...s.errors, [key]: value } })),
  resetErrors: () => set({ errors: ZERO_ERRORS }),
  reset: () => set(INITIAL_STATE),
}));
