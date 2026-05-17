/**
 * Theodolite — pivot hierarchy from PROJECT_ARCHITECTURE.md.
 *
 *   Theodolite
 *    ├── Base (static)
 *    └── Alidade (rotates around VV by -HA — geodetic CW)
 *         └── Trunnion offset
 *              └── Telescope (rotates around HH by z, the local +X axis)
 *
 * Phase 6 — sequential face flip animation.
 *
 * INVARIANT (Phase 6): `face` changes ONLY through the Flip button.
 * The z slider can scrub through the zenith into negative values, but
 * it never flips face. This decoupling is what fixes the "alidade jumps
 * 180° when slider crosses zero" and "tube ends up pointing the wrong
 * way after repeated flip clicks" bugs — animHA is never out of sync
 * with `face` because nothing else touches face.
 *
 * Animation is requested via `useSceneStore.requestFlipAnimation()`,
 * which bumps `animationRequestNonce`. We compare to a ref to detect
 * the new request. Plain state changes (sliders, mode picker) just
 * snap via `api.set` — they never replay a 1.5 s animation.
 *
 * Ordering (telescope first, alidade second): the user sees the sight
 * swing through the zenith to the OPPOSITE side, then watches the
 * alidade rotate 180° to bring the sight back onto the original
 * target on face R. Two INDEPENDENT springs + react-spring's `delay`
 * give a hard guarantee that stage B starts strictly after stage A.
 *
 * Animation convention:
 *   zSpring.value  — rotation-x of the telescope group, SIGNED.
 *                    Face L: +z, Face R: -z (signed values negate when face flips).
 *   haSpring.value — rotation-y of the alidade group, negated (HA is CW).
 *                    Face L: -HA, Face R: -(HA + π).
 */
import { useEffect, useRef } from 'react';
import { animated, useSpring } from '@react-spring/three';
import { useSceneStore, useTheodoliteStore } from '@/store';
import { Alidade } from './Alidade';
import { Base } from './Base';
import { Telescope } from './Telescope';

export function Theodolite() {
  const HA = useTheodoliteStore((s) => s.HA);
  const z = useTheodoliteStore((s) => s.z);
  const face = useTheodoliteStore((s) => s.face);
  const flipMode = useSceneStore((s) => s.flipMode);
  const pendingFlip = useSceneStore((s) => s.pendingFlip);
  const animationNonce = useSceneStore((s) => s.animationRequestNonce);

  const prevRef = useRef({ face, pendingFlip });
  const lastNonceRef = useRef(animationNonce);

  const [zSpring, zApi] = useSpring(() => ({ value: z }));
  const [haSpring, haApi] = useSpring(() => ({ value: -HA }));

  useEffect(() => {
    const prev = prevRef.current;
    const faceFlipped = prev.face !== face;
    const pendingBecameTrue = !prev.pendingFlip && pendingFlip;
    prevRef.current = { face, pendingFlip };

    const animationRequested = animationNonce !== lastNonceRef.current;
    lastNonceRef.current = animationNonce;

    const targetZ = face === 'L' ? z : -z;
    const targetHA = face === 'L' ? -HA : -(HA + Math.PI);

    if (animationRequested) {
      if (pendingBecameTrue) {
        // Step mode stage A — TELESCOPE swings through the zenith.
        // Face hasn't flipped yet, so we manually target the opposite z.
        const flippedZ = face === 'L' ? -z : z;
        void zApi.start({ value: flippedZ, config: { duration: 800 } });
        return;
      }
      if (faceFlipped) {
        if (flipMode === 'step') {
          // Stage B — alidade rotates. Pin animZ to target so any spring
          // slop from stage A can't drift into stage B as phantom HH motion.
          zApi.set({ value: targetZ });
          void haApi.start({ value: targetHA, config: { duration: 800 } });
          return;
        }
        // Auto / slow — sequential via explicit `delay`. Stage B waits.
        const durA = flipMode === 'slow' ? 1600 : 800;
        const durB = flipMode === 'slow' ? 1600 : 800;
        void zApi.start({ value: targetZ, config: { duration: durA } });
        void haApi.start({
          value: targetHA,
          config: { duration: durB },
          delay: durA,
        });
        return;
      }
    }

    // Non-animated update — slider, mode change, etc. face is never
    // touched by sliders (Phase 6 invariant), so animHA can always
    // safely snap to its target without surprising the user.
    zApi.set({ value: targetZ });
    haApi.set({ value: targetHA });
  }, [face, z, HA, flipMode, pendingFlip, animationNonce]);

  return (
    <group>
      <Base />
      <animated.group rotation-y={haSpring.value}>
        <Alidade>
          <animated.group rotation-x={zSpring.value}>
            <Telescope />
          </animated.group>
        </Alidade>
      </animated.group>
    </group>
  );
}
