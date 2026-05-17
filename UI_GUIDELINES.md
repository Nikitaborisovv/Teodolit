# UI GUIDELINES

## Style

Clean, calm, slightly engineering. Think modern desktop app — not consumer fluff, not heavy sci-fi.

- Dark neutral palette
- Solid surfaces, no decorative gradients
- One accent color, used sparingly
- Glow only on key geometry helpers (sight line, current axis) — never on UI chrome
- Clean sans-serif for text, monospace for numerical readouts

## Layout

- Left: 3D canvas (fills viewport)
- Right: control panel (collapsible, ~340px)
- Top: minimal app bar (title, language, settings)
- Mobile: panel becomes a bottom sheet

## Design tokens

Defined in `styles/theme.css` before installing shadcn, so components inherit:

```css
:root {
  --surface-bg:      #0b0d10;
  --surface-panel:   #14171c;
  --surface-elevated:#1c2026;
  --border:          #262b33;

  --text-primary:    #e6e9ee;
  --text-secondary:  #8a93a0;

  --axis-x:          #ff5b6e;   /* red */
  --axis-y:          #5bff8a;   /* green */
  --axis-z:          #5b9dff;   /* blue */

  --sight-ideal:     #5bff8a;
  --sight-error:     #ffb347;

  --accent:          #7aa2ff;
}
```

## 3D look — keep it fast

The scene should feel polished without expensive tricks. Use cheap techniques that give 90% of the look at 10% of the cost.

**Do:**
- Soft directional light + low-intensity ambient (no shadow maps by default)
- Matte materials (`meshStandardMaterial`, low roughness variation)
- Subtle fog for depth (`scene.fog` with small density)
- Thin emissive lines for axes and sight (additive blending)
- One subtle vignette via CSS overlay on canvas, not post-processing

**Avoid:**
- Bloom, SSAO, depth-of-field, screen-space reflections (unless lite-mode is off and user opts in)
- Real-time shadows
- High-poly GLB (target < 30k triangles for the whole instrument)
- Anti-aliasing beyond MSAA 2x
- Particle effects of any kind

**Camera:** orthographic option in settings for a "technical drawing" feel. Perspective by default with a moderate FOV (40–50°).

## Animation

- 3D: `react-spring` driven by store changes
- DOM: Tailwind transitions, GSAP only if needed for sequenced overlays
- Camera moves: ease-in-out, 500–700ms
- No bouncy or overshoot motion
- Respect `prefers-reduced-motion` — skip transitions, jump to end state

## Accessibility

- All controls keyboard-reachable
- HA/VA adjustable via arrow keys when canvas is focused
- Contrast ≥ AA on all text
