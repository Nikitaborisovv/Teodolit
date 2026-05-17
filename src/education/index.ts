import { AXES_TOUR } from './tours/axes-tour';
import type { TourDef } from './types';

export type { TourDef, TourStopDef, TourStopSceneToggles } from './types';
export { AXES_TOUR };

const TOURS: Record<string, TourDef> = {
  [AXES_TOUR.id]: AXES_TOUR,
};

export function getTour(id: string): TourDef | undefined {
  return TOURS[id];
}

export const ALL_TOURS: TourDef[] = Object.values(TOURS);
