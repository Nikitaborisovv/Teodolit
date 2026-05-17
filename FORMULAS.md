# FORMULAS

All angles in radians. `z` = zenith distance, `v` = elevation = `π/2 − z`.

---

## Horizontal angle between two directions

$$\alpha = \theta_2 - \theta_1 \pmod{2\pi}$$

---

## Collimation error (horizontal)

Effect on a single horizontal reading at zenith distance `z`:

$$\Delta\text{HA} = \frac{c}{\sin z}$$

The effect grows as the telescope approaches the zenith (`sin z → 0`).
This is the central educational point.

Two-face averaging cancels `c`:

$$2c = L - (R \pm \pi), \qquad c = \frac{L - (R \pm \pi)}{2}$$

$$\text{HA}_\text{true} = \frac{L + (R \pm \pi)}{2}$$

---

## Vertical index error (place of zenith)

For a zenith-distance reading `V`:

$$z_\text{true} = V - i \quad \text{(face L)}, \qquad z_\text{true} = (2\pi - V) - i \quad \text{(face R)}$$

Two-face form:

$$i = \frac{L + R - 2\pi}{2}, \qquad z_\text{true} = \frac{L - R + 2\pi}{2}$$

---

## Zenith transition

When the telescope is flipped through the zenith and face changes:

$$c \to -c, \qquad \text{HA} \to \text{HA} \pm \pi$$

The error reverses sign — this is why two-face measurement works.

---

## Vertical-axis tilt

If VV deviates from true vertical by small `(tiltX, tiltY)`:

$$\Delta\text{HA} \approx (\text{tiltX} \sin\text{HA} - \text{tiltY} \cos\text{HA}) \cot z$$

Unlike collimation, this error is **not** removed by two-face averaging.

---

## Direction vector from two points

$$\vec{d} = \frac{\vec{p_2} - \vec{p_1}}{\lVert \vec{p_2} - \vec{p_1} \rVert}$$

---

## Rotation matrix (instrument frame)

$$R = R_z(\text{HA}) \cdot R_x(z)$$
