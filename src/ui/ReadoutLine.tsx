interface ReadoutLineProps {
  label: string;
  valueDeg: number;
  precision: number;
  /** Always show ± sign — useful for delta readouts that swing through zero. */
  signed?: boolean;
  /** Highlight the "truth" rows (corrected HA / z). */
  accent?: boolean;
  /** Dim the "raw" rows so the corrected ones read as the answer. */
  dim?: boolean;
}

export function ReadoutLine({ label, valueDeg, precision, signed, accent, dim }: ReadoutLineProps) {
  const sign = signed && valueDeg >= 0 ? '+' : '';
  const text = `${sign}${valueDeg.toFixed(precision)}°`;
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className={dim ? 'text-text-secondary/70' : 'text-text-secondary'}>{label}</span>
      <span
        className={
          'font-mono ' +
          (accent ? 'text-accent' : dim ? 'text-text-secondary' : 'text-text-primary')
        }
      >
        {text}
      </span>
    </div>
  );
}
