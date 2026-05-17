import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTutorialStore, useSceneStore } from '@/store';
import type { CameraPreset } from '@/store';
import { getTour } from '@/education';
import type { TourStopSceneToggles } from '@/education';

type ToggleKey = keyof TourStopSceneToggles;

function applyStopSceneState(sceneToggles?: TourStopSceneToggles, cameraPreset?: string) {
  if (sceneToggles) {
    const state = useSceneStore.getState();
    (Object.entries(sceneToggles) as [ToggleKey, boolean][]).forEach(([key, desired]) => {
      if ((state[key] as boolean) !== desired) {
        state.toggle(key);
      }
    });
  }
  if (cameraPreset) {
    useSceneStore.getState().setCameraPreset(cameraPreset as CameraPreset);
  }
}

export function TourOverlay() {
  const { t } = useTranslation();
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const stopIndex = useTutorialStore((s) => s.stopIndex);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.prev);
  const stop = useTutorialStore((s) => s.stop);

  const tour = activeTourId ? getTour(activeTourId) : null;
  const currentStop = tour?.stops[stopIndex] ?? null;

  useEffect(() => {
    if (!currentStop) return;
    applyStopSceneState(currentStop.sceneToggles, currentStop.cameraPreset);
  }, [activeTourId, stopIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tour || !currentStop) return null;

  const isFirst = stopIndex === 0;
  const isLast = stopIndex === tour.stops.length - 1;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center pb-8">
      <div className="pointer-events-auto mx-4 w-full max-w-md rounded-lg border border-border bg-surface-elevated p-4 shadow-xl">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{t(currentStop.titleKey)}</h3>
          <button
            type="button"
            onClick={stop}
            className="shrink-0 text-xs text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-text-secondary">{t(currentStop.bodyKey)}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tour.stops.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === stopIndex ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={prev}
                className="rounded border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-text-primary"
              >
                ←
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                onClick={next}
                className="rounded bg-accent/10 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
              >
                {t('tour.next')} →
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="rounded bg-accent/10 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
              >
                {t('tour.finish')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
