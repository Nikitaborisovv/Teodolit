# ROADMAP

Interactive 3D web sandbox for a theodolite. Browser-only, no install.
A "playground with explanations" — rotate, tweak, see what happens. Not a graded course.

---

## Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Zustand (state)
- TailwindCSS + shadcn/ui
- react-spring (3D animation), GSAP optional (DOM only)
- Vitest (math tests only — invariants, not UX)
- Vite-PWA (offline)

Lean by default. Add libraries only when a phase needs them.

---

## Phases

### Phase 1 — Foundation
- Vite + React + TS + ESLint + Prettier
- Tailwind + `theme.css` tokens before shadcn
- Folder structure
- Stub stores, empty math module, Vitest running
- App shell: left = 3D canvas, right = panel

### Phase 2 — Skeletal theodolite (math first)
- Theodolite from primitives with correct pivot hierarchy
- `mechanics/` rotations (HA, VA, face L/R)
- Unit tests for math invariants
- CameraControls with presets

### Phase 3 — GLB skin
- Import a simple, light GLB, map parts to existing hierarchy
- Replace primitive meshes; math untouched
- Hover and selection states

### Phase 4 — Axes & geometry visualization
- VV, HH, ZZ instrument axes
- World frame (X red, Y green, Z blue)
- Angle arcs, labels, toggles

### Phase 5 — Collimation error
- Sliders: `c`, `i`, `tiltX`, `tiltY`
- Live sight offset and angle deviation
- Side-by-side: ideal vs erroneous sight line
- Brief explanation card with the formula

### Phase 6 — Zenith transition
- Telescope flip animation
- Sign-inversion demo with both faces visible
- Auto / step / slow modes

### Phase 7 — Guided explanations
- Lightweight tour: 4–6 narrated stops, each highlighting one feature
- Hint popovers tied to controls
- No grading, no progression locks — user roams freely
- Lessons as MDX/JSON data

### Phase 8 — Measurement playground
- Place targets in scene
- Sight at a target, log the reading
- Show the math live (formula + values)
- Free-form, no validation

### Design refinement — Apple light + 3D polish
- Light, minimalist UI: white panels on light gray, thin borders, soft shadows
- Light 3D canvas with subtle grid floor
- Theodolite: pure white with sea-green fresnel sheen (physical material)
- All 3D helpers: glow effect (halo + crisp core) without bloom post-processing
- Colors optimized for light background
- Lighting: high ambient, soft directionals

### Phase 9 — Production
- WebGL capability detection + lite mode
- PWA, lazy loading, code splitting
- i18n (ru/en)
- Deploy to Vercel

---

## Non-negotiables

- All internal angles in radians. Degrees only at UI boundary.
- World up = Y (Three.js convention).
- `geometry/` never imports Three.js. Pure math, unit-testable.
- Performance first: if an effect costs more than 2ms/frame on mid-range hardware, drop it.
