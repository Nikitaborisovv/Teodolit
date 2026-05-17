# PROJECT ARCHITECTURE

## Layers

| Layer | Responsibility | Imports Three.js? |
|---|---|---|
| `geometry/` | Pure math: vectors, rotations, errors, angle calc | No |
| `mechanics/` | Theodolite kinematics (HA, VA, face, constraints) | No |
| `scene/` | R3F components, lights, camera | Yes |
| `ui/` | Panels, controls, overlays | No |
| `education/` | Tour stops, hints | No |
| `store/` | Zustand stores | No |

Rule: a layer may import from layers above it in this list, never below.
`geometry/` and `mechanics/` are framework-free and unit-testable.

---

## Folders

```
src/
 ├── app/             # entry, providers
 ├── geometry/        # pure math (no three)
 ├── mechanics/       # theodolite kinematics (no three)
 ├── scene/           # R3F components
 │    ├── theodolite/
 │    ├── helpers/    # axes, arcs, labels
 │    └── targets/
 ├── ui/              # panels, controls, overlays
 ├── education/       # tour data (mdx), hint definitions
 ├── store/           # zustand stores
 ├── hooks/
 ├── i18n/
 ├── assets/          # glb, textures
 └── styles/          # theme.css, tailwind
```

---

## Scene hierarchy

```
Scene
 ├── Camera (CameraControls)
 ├── Lights
 ├── Ground
 ├── Theodolite
 │    ├── Base
 │    ├── Alidade        (rotates around VV — HA)
 │    │    ├── Trunnion
 │    │    │    └── Telescope (rotates around HH — VA)
 │    │    │         └── SightLine (offset by collimation)
 │    │    └── HorizontalCircle
 │    └── VerticalCircle
 ├── AxisHelpers
 ├── Targets
 └── Overlays
```

Pivot order matters: VV → HH → sight offset. Fix it once in `mechanics/`.

---

## Stores

- `useTheodoliteStore` — domain state only (angles, errors, face).
- `useSceneStore` — visual toggles (helpers visible, lite mode).
- `useTutorialStore` — current tour stop.
- `useSettingsStore` — language, units, performance prefs.

For 60-FPS-critical reads, use `store.subscribe(selector, fn)` with refs instead of hook subscriptions.

---

## Rendering discipline

- Memoize geometries and materials.
- `useFrame` only in leaf scene components.
- No global state writes inside `useFrame`.

---

## 3D Visual Language

**Lighting**: High ambient (1.1), soft directional, no shadows by default.

**Materials**: 
- Light bg → `meshPhysicalMaterial` preferred (supports sheen, clearcoat)
- Theodolite body: white `#fafafd` + `sheen=1.0` (sea-green `#38d4c2`) for Fresnel edge glow
- Helpers (axes, arcs, sight): use `GlowLine` component — transparent halo (opacity 0.12–0.18) + crisp core, no post-processing bloom

**Colors** (light bg optimized):
- Axes: X `#e63025`, Y `#1aab30`, Z `#007aff`
- Instruments: VV `#9e35d8`, HH `#d27000`, ZZ `#00a0cc`
- Sight (ideal/error): `#1aab30` / `#d27000`
