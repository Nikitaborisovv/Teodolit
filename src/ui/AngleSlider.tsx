/**
 * AngleSlider — degree-based input that round-trips to radians at the boundary.
 * The store always speaks radians; this component is the single place the
 * conversion happens for the instrument-control panel.
 */
import { deg, rad } from '@/geometry';
import { HintBubble } from './HintBubble';

interface AngleSliderProps {
  label: string;
  /** Current value in radians (the store's representation). */
  valueRad: number;
  /** Slider range, in degrees. */
  minDeg: number;
  maxDeg: number;
  /** Step in degrees. */
  stepDeg?: number;
  /** Decimal places for the readout (default 1). Phase 5 errors use 2. */
  precisionDeg?: number;
  onChange: (rad: number) => void;
  /** Optional hint text shown in a popover on the ? icon. */
  hint?: string;
}

export function AngleSlider({
  label,
  valueRad,
  minDeg,
  maxDeg,
  stepDeg = 0.5,
  precisionDeg = 1,
  onChange,
  hint,
}: AngleSliderProps) {
  const valueDeg = deg(valueRad);
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="flex items-center gap-1 text-text-secondary">
          {label}
          {hint && <HintBubble text={hint} />}
        </span>
        <span className="font-mono text-text-primary">{valueDeg.toFixed(precisionDeg)}°</span>
      </div>
      <input
        type="range"
        min={minDeg}
        max={maxDeg}
        step={stepDeg}
        value={valueDeg}
        onChange={(e) => onChange(rad(Number(e.target.value)))}
        className="h-1 cursor-pointer appearance-none rounded bg-surface-elevated accent-accent"
      />
    </label>
  );
}
