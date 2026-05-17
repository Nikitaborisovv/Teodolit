# AGENTS

Ownership map for multi-agent development. Each agent owns specific folders and may read others without writing.

---

## GeometryAgent

- **owns:** `src/geometry/`
- **reads:** `DOMAIN_MODEL.md`, `FORMULAS.md`, `GLOSSARY.md`
- **forbidden:** scene, UI, stores, three.js imports
- **interface:** pure functions on `TheodoliteState` returning vectors, angles, corrections
- **done when:** Vitest covers all invariants in `DOMAIN_MODEL.md`

## MechanicsAgent

- **owns:** `src/mechanics/`
- **reads:** `geometry/`, `DOMAIN_MODEL.md`
- **forbidden:** three.js, UI, scene
- **interface:** kinematics — given state and input (rotate HA by `Δ`), produce next state respecting constraints
- **done when:** state transitions are pure, tested, framework-free

## SceneAgent

- **owns:** `src/scene/`
- **reads:** `geometry/`, `mechanics/`, `useTheodoliteStore`, `useSceneStore`
- **forbidden:** writing math, writing to domain store from `useFrame`
- **interface:** R3F components that render state
- **done when:** scene renders state correctly at 60 FPS, no math duplicated

## UIAgent

- **owns:** `src/ui/`
- **reads:** all stores, `UI_GUIDELINES.md`
- **forbidden:** three.js, direct scene manipulation
- **interface:** panels and controls that dispatch actions to stores
- **done when:** all controls dispatch via store, accessible, i18n-keyed

## EducationAgent

- **owns:** `src/education/`, lesson MDX files
- **reads:** all stores, `DOMAIN_MODEL.md`, `FORMULAS.md`
- **forbidden:** modifying math or scene internals
- **interface:** tour stops and hint definitions as data
- **done when:** tour data loads from files, hint popovers wire to controls

## StoreAgent

- **owns:** `src/store/`
- **reads:** `DOMAIN_MODEL.md`
- **forbidden:** math logic (delegate to `geometry/`), rendering
- **interface:** Zustand stores with typed actions
- **done when:** stores expose minimal, typed actions

---

## Dependency graph

```
geometry  ←  mechanics  ←  store  ←  scene
                                  ←  ui
                                  ←  education
```

Arrow = "is imported by". Reversing an arrow is a layering violation.

---

## Orchestration

- Start with GeometryAgent and MechanicsAgent in parallel.
- StoreAgent after MechanicsAgent stabilizes.
- SceneAgent and UIAgent in parallel once stores exist.
- EducationAgent last — depends on everything else being interactive.

When in doubt, an agent stops and asks rather than crossing a boundary.
