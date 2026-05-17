import { useTranslation } from 'react-i18next';
import { useSceneStore, useSettingsStore, useTheodoliteStore, useTutorialStore, useTargetsStore } from '@/store';
import type { CameraPreset, TheodoliteState } from '@/store';
import { deg, wrap2Pi } from '@/geometry';
import {
  collimationDeltaHA,
  rawHA,
  rawV,
  tiltDeltaHA,
} from '@/geometry/errors';
import { AXES_TOUR } from '@/education';
import { directionToAngles } from '@/geometry/target';
import { AngleSlider } from './AngleSlider';
import { ReadoutLine } from './ReadoutLine';
import { Section } from './Section';

const PRESETS: readonly CameraPreset[] = ['perspective', 'front', 'top'] as const;

/** ±3° is enough range to dramatize the c/sin z magnification without leaving the small-angle regime. */
const ERROR_RANGE_DEG = 3;
const ERROR_STEP_DEG = 0.05;

export function Panel() {
  const { t, i18n } = useTranslation();
  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);
  const face = useTheodoliteStore((s) => s.face);
  const errors = useTheodoliteStore((s) => s.errors);
  const setHA = useTheodoliteStore((s) => s.setHA);
  const setZ = useTheodoliteStore((s) => s.setZ);
  const setError = useTheodoliteStore((s) => s.setError);
  const resetErrors = useTheodoliteStore((s) => s.resetErrors);
  const reset = useTheodoliteStore((s) => s.reset);

  const showWorldAxes = useSceneStore((s) => s.showWorldAxes);
  const showInstrumentAxes = useSceneStore((s) => s.showInstrumentAxes);
  const showAngleArcs = useSceneStore((s) => s.showAngleArcs);
  const showLabels = useSceneStore((s) => s.showLabels);
  const showSightLine = useSceneStore((s) => s.showSightLine);
  const toggle = useSceneStore((s) => s.toggle);

  const cameraPreset = useSceneStore((s) => s.cameraPreset);
  const setCameraPreset = useSceneStore((s) => s.setCameraPreset);

  const targets = useTargetsStore((s) => s.targets);
  const selectedTargetId = useTargetsStore((s) => s.selectedTargetId);
  const placingMode = useTargetsStore((s) => s.placingMode);
  const observations = useTargetsStore((s) => s.observations);
  const setPlacingMode = useTargetsStore((s) => s.setPlacingMode);
  const removeTarget = useTargetsStore((s) => s.removeTarget);
  const clearTargets = useTargetsStore((s) => s.clearTargets);
  const logObservation = useTargetsStore((s) => s.logObservation);
  const clearObservations = useTargetsStore((s) => s.clearObservations);

  const selectedTarget = targets.find((t) => t.id === selectedTargetId) ?? null;

  // Direction from trunnion to selected target (trunnion at y=0.92)
  const TRUNNION_Y = 0.92;
  const targetAngles = selectedTarget
    ? directionToAngles(
        selectedTarget.position[0],
        selectedTarget.position[1] - TRUNNION_Y,
        selectedTarget.position[2],
      )
    : null;

  const startTour = useTutorialStore((s) => s.startTour);
  const activeTourId = useTutorialStore((s) => s.activeTourId);
  const hintsEnabled = useTutorialStore((s) => s.hintsEnabled);
  const setHintsEnabled = useTutorialStore((s) => s.setHintsEnabled);

  const switchLang = (lng: 'ru' | 'en') => {
    setLanguage(lng);
    void i18n.changeLanguage(lng);
  };

  const state: TheodoliteState = { HA, z, face, errors };
  const dColl = collimationDeltaHA(errors.c, z, face);
  const dTilt = tiltDeltaHA(HA, z, errors.tiltX, errors.tiltY);
  const dIndex = face === 'L' ? errors.i : -errors.i;
  const rawHARad = wrap2Pi(rawHA(state));
  const rawVRad = wrap2Pi(rawV(state));

  /**
   * Signed-z slider — just writes to `z` (now signed in mechanics).
   * Does NOT touch `face`. Dragging past 0 manually flips the telescope
   * through the zenith; the alidade only rotates when the user explicitly
   * clicks the Flip button on the left panel.
   */

  return (
    <aside className="flex h-full w-[340px] flex-col gap-4 overflow-y-auto border-l border-border/60 bg-surface-panel p-4 text-sm shadow-[-1px_0_0_0_rgba(0,0,0,0.04)]">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-base font-semibold text-text-primary">{t('app.title')}</h1>
          <p className="text-xs text-text-secondary">{t('app.subtitle')}</p>
        </div>
        <div className="flex gap-1 text-xs">
          {(['ru', 'en'] as const).map((lng) => (
            <button
              key={lng}
              onClick={() => switchLang(lng)}
              className={
                'rounded px-2 py-1 transition-colors ' +
                (language === lng
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-secondary hover:text-text-primary')
              }
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <Section title={t('panel.scene')}>
        <div className="flex flex-col gap-2">
          {(
            [
              ['showWorldAxes', 'scene.worldAxes', showWorldAxes],
              ['showInstrumentAxes', 'scene.instrumentAxes', showInstrumentAxes],
              ['showAngleArcs', 'scene.angleArcs', showAngleArcs],
              ['showSightLine', 'scene.sightLine', showSightLine],
              ['showLabels', 'scene.labels', showLabels],
            ] as const
          ).map(([key, tKey, checked]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(key)}
                className="accent-[var(--accent)] h-3.5 w-3.5"
              />
              <span className="text-text-secondary">{t(tKey)}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title={t('panel.camera')}>
        <div className="grid grid-cols-3 gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setCameraPreset(p)}
              className={
                'rounded border px-2 py-1.5 text-xs transition-colors ' +
                (cameraPreset === p
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border bg-surface-elevated text-text-secondary hover:text-text-primary')
              }
            >
              {t(`camera.${p}`)}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('panel.instrument')}>
        <AngleSlider
          label={t('angles.HA')}
          valueRad={HA}
          minDeg={0}
          maxDeg={360}
          onChange={setHA}
        />
        <AngleSlider
          label={t('angles.zSigned')}
          valueRad={z}
          minDeg={-180}
          maxDeg={180}
          onChange={setZ}
        />
        <p className="text-[11px] leading-snug text-text-secondary/70">
          {t('angles.zSignedHint')}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-text-secondary">{t('angles.face')}</span>
          <span className="rounded border border-border bg-surface-elevated px-3 py-1 font-mono text-text-primary">
            {face === 'L' ? t('angles.faceL') : t('angles.faceR')}
          </span>
        </div>

        <button
          onClick={reset}
          className="mt-1 self-start text-xs text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
        >
          {t('angles.reset')}
        </button>
      </Section>

      <Section title={t('panel.tutorial')}>
        <button
          onClick={() => startTour(AXES_TOUR.id)}
          disabled={activeTourId !== null}
          className="w-full rounded border border-border bg-surface-elevated py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
        >
          {activeTourId === AXES_TOUR.id ? t('tour.active') : t('tour.start')} — {t(AXES_TOUR.titleKey)}
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={hintsEnabled}
            onChange={(e) => setHintsEnabled(e.target.checked)}
            className="accent-[var(--accent)] h-3.5 w-3.5"
          />
          <span className="text-text-secondary">{t('tour.hintsEnabled')}</span>
        </label>
      </Section>

      <Section title={t('panel.errors')}>
        <AngleSlider
          label={t('errors.c')}
          valueRad={errors.c}
          minDeg={-ERROR_RANGE_DEG}
          maxDeg={ERROR_RANGE_DEG}
          stepDeg={ERROR_STEP_DEG}
          precisionDeg={2}
          onChange={(rad) => setError('c', rad)}
          hint={hintsEnabled ? t('hints.c') : undefined}
        />
        <AngleSlider
          label={t('errors.i')}
          valueRad={errors.i}
          minDeg={-ERROR_RANGE_DEG}
          maxDeg={ERROR_RANGE_DEG}
          stepDeg={ERROR_STEP_DEG}
          precisionDeg={2}
          onChange={(rad) => setError('i', rad)}
          hint={hintsEnabled ? t('hints.i') : undefined}
        />
        <AngleSlider
          label={t('errors.tiltX')}
          valueRad={errors.tiltX}
          minDeg={-ERROR_RANGE_DEG}
          maxDeg={ERROR_RANGE_DEG}
          stepDeg={ERROR_STEP_DEG}
          precisionDeg={2}
          onChange={(rad) => setError('tiltX', rad)}
          hint={hintsEnabled ? t('hints.tiltX') : undefined}
        />
        <AngleSlider
          label={t('errors.tiltY')}
          valueRad={errors.tiltY}
          minDeg={-ERROR_RANGE_DEG}
          maxDeg={ERROR_RANGE_DEG}
          stepDeg={ERROR_STEP_DEG}
          precisionDeg={2}
          onChange={(rad) => setError('tiltY', rad)}
          hint={hintsEnabled ? t('hints.tiltY') : undefined}
        />
        <button
          onClick={resetErrors}
          className="mt-1 self-start text-xs text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
        >
          {t('errors.reset')}
        </button>
      </Section>

      <Section title={t('panel.readout')}>
        <ReadoutLine label={t('readout.rawHA')} valueDeg={deg(rawHARad)} precision={3} dim />
        <ReadoutLine label={t('readout.correctedHA')} valueDeg={deg(HA)} precision={3} accent />
        <ReadoutLine label={t('readout.dCollimation')} valueDeg={deg(dColl)} precision={3} signed />
        <ReadoutLine label={t('readout.dTilt')} valueDeg={deg(dTilt)} precision={3} signed />
        <div className="my-1 border-t border-border/60" />
        <ReadoutLine label={t('readout.rawV')} valueDeg={deg(rawVRad)} precision={3} dim />
        <ReadoutLine label={t('readout.correctedZ')} valueDeg={deg(z)} precision={3} accent />
        <ReadoutLine label={t('readout.dIndex')} valueDeg={deg(dIndex)} precision={3} signed />
      </Section>

      <Section title={t('panel.formulas')}>
        <p className="text-xs leading-relaxed text-text-secondary">{t('formulas.collimation')}</p>
        <p className="text-xs leading-relaxed text-text-secondary">{t('formulas.index')}</p>
        <p className="text-xs leading-relaxed text-text-secondary">{t('formulas.tilt')}</p>
      </Section>

      <Section title={t('panel.targets')}>
        <button
          onClick={() => setPlacingMode(!placingMode)}
          className={
            'w-full rounded border py-1.5 text-xs font-medium transition-colors ' +
            (placingMode
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-border bg-surface-elevated text-text-secondary hover:border-accent/50 hover:text-accent')
          }
        >
          {placingMode ? t('measure.placing') : t('measure.place')}
        </button>

        {targets.length === 0 ? (
          <p className="text-[11px] text-text-secondary/70">{t('measure.noTargets')}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {targets.map((tgt) => (
              <div
                key={tgt.id}
                className={
                  'flex cursor-pointer items-center justify-between rounded border px-2 py-1 text-xs transition-colors ' +
                  (tgt.id === selectedTargetId
                    ? 'border-accent/50 bg-accent/8 text-accent'
                    : 'border-border bg-surface-elevated text-text-secondary hover:text-text-primary')
                }
                onClick={() =>
                  useTargetsStore.getState().selectTarget(
                    tgt.id === selectedTargetId ? null : tgt.id,
                  )
                }
              >
                <span className="font-mono font-semibold">{tgt.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTarget(tgt.id);
                  }}
                  className="ml-2 text-text-secondary/60 hover:text-text-primary"
                  aria-label={`Remove ${tgt.label}`}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={clearTargets}
              className="self-start text-[11px] text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
            >
              {t('measure.clearTargets')}
            </button>
          </div>
        )}

        {targetAngles && selectedTarget && (
          <div className="flex flex-col gap-1 border-t border-border/40 pt-2">
            <p className="text-[11px] font-medium text-text-secondary">
              {t('measure.dirTo', { label: selectedTarget.label })}
            </p>
            <ReadoutLine label="HA" valueDeg={deg(wrap2Pi(targetAngles.HA))} precision={3} accent />
            <ReadoutLine label="z" valueDeg={deg(targetAngles.z)} precision={3} />
            <ReadoutLine
              label="Δ HA"
              valueDeg={deg(targetAngles.HA - HA)}
              precision={2}
              signed
            />
            <ReadoutLine
              label="Δ z"
              valueDeg={deg(targetAngles.z - z)}
              precision={2}
              signed
            />
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setHA(wrap2Pi(targetAngles.HA));
                  setZ(targetAngles.z);
                }}
                className="flex-1 rounded border border-border bg-surface-elevated py-1 text-[11px] text-text-secondary transition-colors hover:border-accent/50 hover:text-accent"
              >
                {t('measure.aim')}
              </button>
              <button
                onClick={() =>
                  logObservation({
                    targetId: selectedTarget.id,
                    targetLabel: selectedTarget.label,
                    HA,
                    z,
                    face,
                  })
                }
                className="flex-1 rounded border border-accent/50 bg-accent/10 py-1 text-[11px] text-accent transition-colors hover:bg-accent/20"
              >
                {t('measure.log')}
              </button>
            </div>
          </div>
        )}
      </Section>

      {observations.length > 0 && (
        <Section title={t('panel.observations')}>
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
            {[...observations].reverse().map((obs) => (
              <div key={obs.id} className="flex items-baseline justify-between gap-1 text-[11px]">
                <span className="font-mono font-semibold text-text-primary">{obs.targetLabel}</span>
                <span className="text-text-secondary">
                  {face === obs.face ? '' : obs.face + ' '}
                  HA {deg(wrap2Pi(obs.HA)).toFixed(2)}°
                </span>
                <span className="text-text-secondary">z {deg(obs.z).toFixed(2)}°</span>
              </div>
            ))}
          </div>
          <button
            onClick={clearObservations}
            className="self-start text-[11px] text-text-secondary underline-offset-2 hover:text-text-primary hover:underline"
          >
            {t('measure.clearObs')}
          </button>
        </Section>
      )}
    </aside>
  );
}
