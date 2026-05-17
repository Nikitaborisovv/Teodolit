# DOMAIN MODEL

Formal definition of theodolite state. Read this before writing geometry or mechanics code.

---

## Conventions

- **Angle units (internal):** radians. Convert at UI boundary only.
- **World up:** Y axis (Three.js convention).
- **Horizontal angle (HA):** rotation around VV, range `[0, 2π)`, increases clockwise looking down (geodetic convention).
- **Vertical angle (VA):** stored as **zenith distance** `z ∈ [-π, π]` (Phase 6 — signed).
  Classical geodetic range is `[0, π]`; negative values let the user manually flip
  the telescope through the zenith via the z slider without rotating the alidade.
  Horizon = π/2, zenith = 0, "telescope flipped through the zenith" = negative z.
  Elevation angle for display: `v = π/2 − z`.
- **Face:** `'L'` (circle left) or `'R'` (circle right).

Pick one VA representation and never mix. Zenith distance is preferred because most geodetic formulas use it directly.

---

## Axes

Three instrument axes, all unit vectors in world space:

- **VV — vertical axis.** Main rotation axis of the instrument.
- **HH — trunnion axis.** Telescope rotation axis. Ideally perpendicular to VV.
- **ZZ — sight axis.** Line of sight. Ideally perpendicular to HH.

Ideal: `VV ⟂ HH ⟂ ZZ`.

---

## State type

```ts
type Face = 'L' | 'R';

interface TheodoliteErrors {
  c: number;        // collimation error (rad)
  i: number;        // vertical index error / "place of zenith" (rad)
  tiltX: number;    // vertical-axis tilt, X component (rad)
  tiltY: number;    // vertical-axis tilt, Y component (rad)
}

interface TheodoliteState {
  HA: number;                 // horizontal angle (rad)
  z:  number;                 // zenith distance (rad)
  face: Face;
  errors: TheodoliteErrors;
}

interface InstrumentAxes {
  VV: Vec3;
  HH: Vec3;
  ZZ: Vec3;
}
```

---

## Derived quantities

Computed in `geometry/`, never stored:

- `axes(state) → InstrumentAxes`
- `sightDirection(state) → Vec3`
- `correctedHA(state) → number`
- `correctedVA(state) → number`

---

## Invariants (verified by tests)

1. With zero errors, `VV · HH = 0`, `HH · ZZ = 0`.
2. Two-face measurement averages out `c` and `i`.
3. Flipping face inverts the sign of `c` in its effect on HA.
4. Rotating HA by `2π` returns identical axes.
5. Sight direction is continuous across face flip.
