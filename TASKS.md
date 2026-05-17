# TASKS

Mirrors `ROADMAP.md`. One source of truth.

---

## Phase 1 — Foundation
- [x] Vite + React + TypeScript
- [x] ESLint + Prettier + Vitest
- [x] Tailwind + `theme.css` tokens (axis colors, surfaces)
- [x] Folder structure
- [x] Stub stores: `theodolite`, `scene`, `tutorial`, `settings`
- [x] App shell (canvas + side panel)
- [x] `react-i18next` with ru/en stubs

## Phase 2 — Skeletal theodolite
- [x] Primitive theodolite with correct pivot hierarchy
- [x] `mechanics/rotation.ts` (HA, VA, face)
- [x] `geometry/axes.ts` (VV, HH, ZZ as pure vectors)
- [x] Tests: rotation idempotence, ortho invariants, two-face averaging
- [x] `CameraControls` with 3 presets

## Phase 3 — GLB skin
- [x] Import GLB, validate part names
- [x] Map GLB nodes onto skeleton hierarchy
- [x] Hover and selection states

## Phase 4 — Axes & geometry
- [x] World X / Y / Z axes
- [x] Instrument VV / HH / ZZ axes
- [x] Angle arcs (HA, VA)
- [x] Labels with billboarding
- [x] Toggle panel

## Phase 5 — Collimation error
- [x] Sliders: `c`, `i`, `tiltX`, `tiltY`
- [x] Visual sight offset (ideal vs erroneous)
- [x] Readout: corrected vs raw angle
- [x] Explanation card with formula

## Phase 6 — Zenith transition
- [x] Telescope flip animation (react-spring) — sequential telescope-then-alidade, two independent springs, `delay`-based chaining
- [x] Face L → R workflow — `requestFlipAnimation()` nonce gates animation; slider scrubs never animate
- [x] Averaging readout — two-face HA columns + 2c spread in the left panel
- [x] Slow / step modes
- [x] Signed z (`[-π, π]`) — slider scrubs telescope through zenith without touching face
- [x] 3D error markers — captured sight tip before/after, dashed segment = 2c/sin z
- [x] Manual mark button — three-state cycle (point 1 → point 2 → restart)
- [x] Dedicated left ZenithPanel — moved off the main right panel

Files of note for next phase: `src/ui/ZenithPanel.tsx`, `src/scene/helpers/ErrorMarkers.tsx`, `src/scene/theodolite/Theodolite.tsx` (spring choreography), `src/store/scene.ts` (`animationRequestNonce`).

## Phase 7 — Guided explanations
- [x] Tour data format (`src/education/types.ts`, `src/education/index.ts`)
- [x] Tour overlay (5 stops, `src/ui/TourOverlay.tsx`)
- [x] Hint popovers on controls (`src/ui/HintBubble.tsx`, wired into `AngleSlider`)
- [x] First tour: "axes of a theodolite" (`src/education/tours/axes-tour.ts`)
- [x] Tutorial section in Panel with start button + hints toggle

## Phase 8 — Measurement playground
- [x] Targets in scene (`src/scene/targets/`, `src/store/targets.ts`)
- [x] Sighting interaction — ground click to place, click target to select, Aim button
- [x] Live formula readout — direction HA/z + Δ live in panel (`geometry/target.ts`)
- [x] Observation log (session only, no persistence)

## Design refinement — Apple light + 3D polish
- [x] UI panels — light gray surfaces (`#f2f2f7`), thin borders, Apple-style shadows
- [x] Canvas background — light (`#f0f0f5`), matches panel family
- [x] Ground — light gray with subtle grid (`Grid` from drei)
- [x] Theodolite — white (`#fafafd`) with teal fresnel sheen (`meshPhysicalMaterial`, `sheen=1.0`, `sheenRoughness=0.08`)
- [x] 3D helpers — all use `GlowLine` component (halo + crisp core) with low opacity
- [x] Axis colors — updated for light bg (red `#e63025`, green `#1aab30`, blue `#007aff`, etc.)
- [x] Lighting — adjusted for light scene (ambient 1.1, softer directionals)

Files of note: `src/styles/theme.css`, `src/scene/helpers/GlowLine.tsx`, `src/scene/theodolite/{Base,Alidade,Telescope}.tsx`, `src/scene/SceneRoot.tsx`.

## Phase 9 — Production
- [ ] WebGL detection + lite mode
- [ ] PWA via Vite-PWA
- [ ] Lazy loading of GLB and lessons
- [ ] Deploy to Vercel
