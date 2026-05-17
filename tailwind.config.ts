import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          bg: 'var(--surface-bg)',
          panel: 'var(--surface-panel)',
          elevated: 'var(--surface-elevated)',
        },
        canvas: {
          bg: 'var(--canvas-bg)',
        },
        border: 'var(--border)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        axis: {
          x: 'var(--axis-x)',
          y: 'var(--axis-y)',
          z: 'var(--axis-z)',
        },
        inst: {
          vv: 'var(--inst-vv)',
          hh: 'var(--inst-hh)',
          zz: 'var(--inst-zz)',
        },
        sight: {
          ideal: 'var(--sight-ideal)',
          error: 'var(--sight-error)',
        },
        accent: 'var(--accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
