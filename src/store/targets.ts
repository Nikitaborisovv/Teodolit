/**
 * useTargetsStore — scene targets and observation log.
 * Phase 8. Session-only, no persistence.
 */
import { create } from 'zustand';

export interface TargetDef {
  id: string;
  label: string;
  position: [number, number, number];
}

export interface ObservationEntry {
  id: string;
  targetId: string;
  targetLabel: string;
  /** Instrument HA at time of logging, radians. */
  HA: number;
  /** Instrument z at time of logging, radians. */
  z: number;
  face: 'L' | 'R';
  timestamp: number;
}

export interface TargetsState {
  targets: TargetDef[];
  selectedTargetId: string | null;
  placingMode: boolean;
  observations: ObservationEntry[];
}

export interface TargetsActions {
  addTarget: (position: [number, number, number]) => void;
  removeTarget: (id: string) => void;
  selectTarget: (id: string | null) => void;
  setPlacingMode: (v: boolean) => void;
  clearTargets: () => void;
  logObservation: (entry: Omit<ObservationEntry, 'id' | 'timestamp'>) => void;
  clearObservations: () => void;
}

const TARGET_LABELS = 'ABCDEFGH';
const MAX_TARGETS = 8;

let _counter = 0;
const uid = () => `t_${Date.now()}_${++_counter}`;

export const useTargetsStore = create<TargetsState & TargetsActions>((set) => ({
  targets: [],
  selectedTargetId: null,
  placingMode: false,
  observations: [],

  addTarget: (position) =>
    set((s) => {
      if (s.targets.length >= MAX_TARGETS) return s;
      const index = s.targets.length;
      const label = TARGET_LABELS[index] ?? `P${index + 1}`;
      return { targets: [...s.targets, { id: uid(), label, position }] };
    }),

  removeTarget: (id) =>
    set((s) => ({
      targets: s.targets.filter((t) => t.id !== id),
      selectedTargetId: s.selectedTargetId === id ? null : s.selectedTargetId,
    })),

  selectTarget: (id) => set({ selectedTargetId: id }),

  setPlacingMode: (v) => set({ placingMode: v }),

  clearTargets: () => set({ targets: [], selectedTargetId: null, placingMode: false }),

  logObservation: (entry) =>
    set((s) => ({
      observations: [
        ...s.observations,
        { ...entry, id: `obs_${Date.now()}_${s.observations.length}`, timestamp: Date.now() },
      ],
    })),

  clearObservations: () => set({ observations: [] }),
}));
