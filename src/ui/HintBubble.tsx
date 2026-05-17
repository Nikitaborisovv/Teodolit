import { useState } from 'react';

interface HintBubbleProps {
  text: string;
}

export function HintBubble({ text }: HintBubbleProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] leading-none text-text-secondary transition-colors hover:border-accent hover:text-accent focus:border-accent focus:text-accent focus:outline-none"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Hint"
      >
        ?
      </button>
      {open && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded border border-border bg-surface-elevated p-2 text-[11px] leading-snug text-text-secondary shadow-lg">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
