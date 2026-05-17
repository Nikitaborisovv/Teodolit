import type { TourDef } from '../types';

export const AXES_TOUR: TourDef = {
  id: 'axes',
  titleKey: 'tour.axes.title',
  stops: [
    {
      id: 'welcome',
      titleKey: 'tour.axes.stop0.title',
      bodyKey: 'tour.axes.stop0.body',
      sceneToggles: {
        showWorldAxes: true,
        showInstrumentAxes: true,
        showAngleArcs: false,
        showSightLine: false,
        showLabels: true,
      },
      cameraPreset: 'perspective',
    },
    {
      id: 'vv',
      titleKey: 'tour.axes.stop1.title',
      bodyKey: 'tour.axes.stop1.body',
      sceneToggles: {
        showWorldAxes: false,
        showInstrumentAxes: true,
        showAngleArcs: false,
        showSightLine: false,
        showLabels: true,
      },
      cameraPreset: 'perspective',
    },
    {
      id: 'hh',
      titleKey: 'tour.axes.stop2.title',
      bodyKey: 'tour.axes.stop2.body',
      sceneToggles: {
        showWorldAxes: false,
        showInstrumentAxes: true,
        showAngleArcs: false,
        showSightLine: false,
        showLabels: true,
      },
      cameraPreset: 'front',
    },
    {
      id: 'zz',
      titleKey: 'tour.axes.stop3.title',
      bodyKey: 'tour.axes.stop3.body',
      sceneToggles: {
        showWorldAxes: false,
        showInstrumentAxes: true,
        showAngleArcs: false,
        showSightLine: true,
        showLabels: true,
      },
      cameraPreset: 'front',
    },
    {
      id: 'readings',
      titleKey: 'tour.axes.stop4.title',
      bodyKey: 'tour.axes.stop4.body',
      sceneToggles: {
        showWorldAxes: false,
        showInstrumentAxes: true,
        showAngleArcs: true,
        showSightLine: false,
        showLabels: true,
      },
      cameraPreset: 'perspective',
    },
  ],
};
