/**
 * ZenithPanel — left-side overlay dedicated to the face-flip workflow.
 *
 * Kept OFF the main right panel so the user can study the collimation
 * doubling in 3D without the readout fighting for screen real estate.
 *
 * What lives here:
 *   • Animation mode picker (auto / slow / step)
 *   • Flip button — triggers the sequential animation via
 *     `requestFlipAnimation()` (a nonce bump that Theodolite watches)
 *   • Manual marker controls — the user pins the sight tip BEFORE,
 *     scrubs the z slider through the zenith, then pins it AFTER.
 *     The two markers + the segment between them visualize 2c/sin z.
 *   • Two-face HA averaging readout
 *   • Marker readout: angular and linear spread, plus "1/2" progress
 *
 * NOTE: `MARKER_RAY_LEN` and `endpointWithErrors` are duplicated in
 * Panel.tsx — same constants/helper. If you change one, change both.
 */
import { useTranslation } from 'react-i18next';
import { useSceneStore, useTheodoliteStore } from '@/store';
import type { FlipMode } from '@/store';
import { deg } from '@/geometry';
import type { Vec3 } from '@/geometry';
import { rawHA, sightWithErrors } from '@/geometry/errors';
import { length as vLength, sub as vSub } from '@/geometry/vec3';
import { TRUNNION_Y } from '@/scene/theodolite/Alidade';
import { ReadoutLine } from './ReadoutLine';
import { Section } from './Section';

const FLIP_MODES: readonly FlipMode[] = ['auto', 'slow', 'step'] as const;
const MARKER_RAY_LEN = 1.7;

function endpointWithErrors(
  HA: number,
  z: number,
  face: 'L' | 'R',
  errors: { c: number; i: number; tiltX: number; tiltY: number },
): Vec3 {
  const s = sightWithErrors({ HA, z, face, errors });
  return [
    s[0] * MARKER_RAY_LEN,
    TRUNNION_Y + s[1] * MARKER_RAY_LEN,
    s[2] * MARKER_RAY_LEN,
  ];
}

export function ZenithPanel() {
  const { t } = useTranslation();

  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);
  const face = useTheodoliteStore((s) => s.face);
  const errors = useTheodoliteStore((s) => s.errors);
  const flipFace = useTheodoliteStore((s) => s.flipFace);

  const flipMode = useSceneStore((s) => s.flipMode);
  const setFlipMode = useSceneStore((s) => s.setFlipMode);
  const pendingFlip = useSceneStore((s) => s.pendingFlip);
  const setPendingFlip = useSceneStore((s) => s.setPendingFlip);
  const errorBefore = useSceneStore((s) => s.errorBefore);
  const errorAfter = useSceneStore((s) => s.errorAfter);
  const setErrorBefore = useSceneStore((s) => s.setErrorBefore);
  const setErrorAfter = useSceneStore((s) => s.setErrorAfter);
  const clearErrorMarkers = useSceneStore((s) => s.clearErrorMarkers);
  const requestFlipAnimation = useSceneStore((s) => s.requestFlipAnimation);

  const haL = rawHA({ HA, z, face: 'L', errors });
  const haR = rawHA({ HA, z, face: 'R', errors });
  const haAvg = (haL + haR) / 2;

  const captureCurrentSight = () => endpointWithErrors(HA, z, face, errors);

  const handleFlip = () => {
    if (flipMode === 'step') {
      if (pendingFlip) {
        // Stage B — finish the flip. Alidade animates 180°.
        setPendingFlip(false);
        requestFlipAnimation();
        flipFace();
      } else {
        // Stage A — telescope flips. Mark sight BEFORE so the user sees
        // both endpoints from the very first click.
        setErrorBefore(captureCurrentSight());
        setErrorAfter(endpointWithErrors(HA, z, face === 'L' ? 'R' : 'L', errors));
        requestFlipAnimation();
        setPendingFlip(true);
      }
    } else {
      // Auto / slow — single click, full sequential animation.
      setErrorBefore(captureCurrentSight());
      setErrorAfter(endpointWithErrors(HA, z, face === 'L' ? 'R' : 'L', errors));
      requestFlipAnimation();
      flipFace();
    }
  };

  /**
   * Manual mark button. Three-state cycle:
   *   none      → fill errorBefore
   *   before    → fill errorAfter
   *   both      → start over: clear errorAfter and re-fill errorBefore
   */
  const handleMark = () => {
    const sight = captureCurrentSight();
    if (!errorBefore) {
      setErrorBefore(sight);
      setErrorAfter(null);
    } else if (!errorAfter) {
      setErrorAfter(sight);
    } else {
      setErrorBefore(sight);
      setErrorAfter(null);
    }
  };

  const markCount = (errorBefore ? 1 : 0) + (errorAfter ? 1 : 0);
  const nextMarkLabel = markCount === 0
    ? t('zenith.markFirst')
    : markCount === 1
      ? t('zenith.markSecond')
      : t('zenith.markRestart');

  const markerDelta = errorBefore && errorAfter ? vLength(vSub(errorAfter, errorBefore)) : 0;
  const markerAngularDeg = (markerDelta / MARKER_RAY_LEN) * (180 / Math.PI);

  return (
    <aside className="flex h-full w-[300px] flex-col gap-3 overflow-y-auto border-r border-border/60 bg-surface-panel p-3 text-sm shadow-[1px_0_0_0_rgba(0,0,0,0.04)]">
      <header>
        <h1 className="text-sm font-semibold text-text-primary">{t('panel.zenith')}</h1>
        <p className="text-[11px] text-text-secondary">{t('zenith.intro')}</p>
      </header>

      <Section title={t('zenith.animMode')}>
        <div className="grid grid-cols-3 gap-1">
          {FLIP_MODES.map((m) => (
            <button
              key={m}
              onClick={() => setFlipMode(m)}
              className={
                'rounded border px-2 py-1.5 text-xs transition-colors ' +
                (flipMode === m
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-border bg-surface-elevated text-text-secondary hover:text-text-primary')
              }
            >
              {t(`zenith.mode_${m}`)}
            </button>
          ))}
        </div>

        <button
          onClick={handleFlip}
          className={
            'rounded border px-3 py-2 text-xs font-medium transition-colors ' +
            (pendingFlip
              ? 'border-accent bg-accent/20 text-accent'
              : 'border-border bg-surface-elevated text-text-primary hover:border-accent hover:text-accent')
          }
        >
          {pendingFlip ? t('angles.continue') : t('angles.flipFace')}
        </button>
      </Section>

      <Section title={t('zenith.markers')}>
        <button
          onClick={handleMark}
          className="rounded border border-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
        >
          {nextMarkLabel}
        </button>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-text-secondary">{t('zenith.markCount')}</span>
          <span className="font-mono text-text-primary">{markCount} / 2</span>
        </div>
        <button
          onClick={clearErrorMarkers}
          disabled={markCount === 0}
          className="self-start text-[11px] text-text-secondary underline-offset-2 hover:text-text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
        >
          {t('zenith.clear')}
        </button>

        {errorBefore && errorAfter && (
          <div className="mt-1 flex flex-col gap-1 border-t border-border/40 pt-2">
            <ReadoutLine
              label={t('zenith.markerAngular')}
              valueDeg={markerAngularDeg}
              precision={4}
              accent
            />
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-text-secondary">{t('zenith.markerLinear')}</span>
              <span className="font-mono text-text-primary">
                {markerDelta.toFixed(4)} {t('zenith.units')}
              </span>
            </div>
          </div>
        )}

        <p className="text-[11px] leading-snug text-text-secondary/80">
          {markCount === 0
            ? t('zenith.markerEmpty')
            : markCount === 1
              ? t('zenith.markerHalf')
              : t('zenith.markerHint')}
        </p>
      </Section>

      <Section title={t('zenith.averaging')}>
        <ReadoutLine label={t('zenith.haL')} valueDeg={deg(haL)} precision={3} />
        <ReadoutLine label={t('zenith.haR')} valueDeg={deg(haR)} precision={3} />
        <div className="my-0.5 border-t border-border/40" />
        <ReadoutLine label={t('zenith.haAvg')} valueDeg={deg(haAvg)} precision={3} accent />
        <ReadoutLine label="ΔHA (КЛ)" valueDeg={deg(haL - haAvg)} precision={3} signed />
        <ReadoutLine label="ΔHA (КП)" valueDeg={deg(haR - haAvg)} precision={3} signed />
        <p className="mt-1 text-[11px] leading-snug text-text-secondary/80">
          {t('zenith.explanation')}
        </p>
      </Section>
    </aside>
  );
}
