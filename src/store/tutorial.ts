/**
 * useTutorialStore — current tour stop and progress within a tour.
 * Tours load from src/education/. Phase 7 populates this. Reference: ROADMAP.md
 */
import { create } from 'zustand';

export interface TutorialState {
  activeTourId: string | null;
  stopIndex: number;
  hintsEnabled: boolean;
}

export interface TutorialActions {
  startTour: (tourId: string) => void;
  next: () => void;
  prev: () => void;
  stop: () => void;
  setHintsEnabled: (enabled: boolean) => void;
}

export const useTutorialStore = create<TutorialState & TutorialActions>((set) => ({
  activeTourId: null,
  stopIndex: 0,
  hintsEnabled: true,
  startTour: (tourId) => set({ activeTourId: tourId, stopIndex: 0 }),
  next: () => set((s) => ({ stopIndex: s.stopIndex + 1 })),
  prev: () => set((s) => ({ stopIndex: Math.max(0, s.stopIndex - 1) })),
  stop: () => set({ activeTourId: null, stopIndex: 0 }),
  setHintsEnabled: (hintsEnabled) => set({ hintsEnabled }),
}));
