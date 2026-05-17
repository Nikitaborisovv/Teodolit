# TECH SPEC

## Targets

- 60 FPS on mid-range laptop (Intel Iris / M1 base)
- 30 FPS minimum on mobile in lite mode
- < 3 s initial load on 4G (lazy GLB)
- Works in Chrome, Edge, Firefox, Safari (last 2 versions)

## Build

- Vite production build, tree-shaking, code splitting
- Lazy-load GLB models and lesson MDX
- PWA via Vite-PWA — cache app shell, GLB, current lesson
- CI: lint, typecheck, vitest, build

## 3D assets

- Format: GLB
- Target: < 30k triangles for the whole instrument
- Textures ≤ 1K, KTX2 compression when feasible
- Named nodes matching the scene graph in `PROJECT_ARCHITECTURE.md`
- Movable parts pivoted correctly at source

## Performance discipline

- Detect WebGL capability on boot; offer lite mode by default on weak GPUs
- No shadow maps, no post-processing in lite mode
- MSAA 2x maximum
- Memoize geometry and materials
- One render loop, no nested Canvases
- Frustum culling enabled, but the scene is small enough that it rarely matters

## Lite mode rules

When lite mode is on:
- No fog
- Flat materials (`meshBasicMaterial`) for static parts
- Axes rendered as simple lines, not glowing tubes
- Animation durations halved

## Deployment

- Vercel, preview per PR
- Analytics: minimal, privacy-respecting (Plausible or none)
