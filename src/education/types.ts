import type { CameraPreset } from '@/store';

export interface TourStopSceneToggles {
  showWorldAxes?: boolean;
  showInstrumentAxes?: boolean;
  showAngleArcs?: boolean;
  showLabels?: boolean;
  showSightLine?: boolean;
}

export interface TourStopDef {
  id: string;
  titleKey: string;
  bodyKey: string;
  sceneToggles?: TourStopSceneToggles;
  cameraPreset?: CameraPreset;
}

export interface TourDef {
  id: string;
  titleKey: string;
  stops: TourStopDef[];
}
