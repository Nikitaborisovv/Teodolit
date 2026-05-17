/**
 * useSettingsStore — language, units, performance prefs.
 * Reference: PROJECT_ARCHITECTURE.md
 */
import { create } from 'zustand';

export type Language = 'ru' | 'en';
export type AngleUnit = 'deg' | 'rad' | 'gon';

export interface SettingsState {
  language: Language;
  angleUnit: AngleUnit;
  performanceMode: 'auto' | 'lite' | 'full';
}

export interface SettingsActions {
  setLanguage: (lang: Language) => void;
  setAngleUnit: (unit: AngleUnit) => void;
  setPerformanceMode: (mode: SettingsState['performanceMode']) => void;
}

export const useSettingsStore = create<SettingsState & SettingsActions>((set) => ({
  language: 'ru',
  angleUnit: 'deg',
  performanceMode: 'auto',
  setLanguage: (language) => set({ language }),
  setAngleUnit: (angleUnit) => set({ angleUnit }),
  setPerformanceMode: (performanceMode) => set({ performanceMode }),
}));
