/**
 * Generates src/assets/theodolite.glb from three primitives — the
 * "до абсурда упрощённая" diagnostic model:
 *
 *   Base      → BoxGeometry
 *   Alidada   → BoxGeometry
 *   Telescope → CylinderGeometry (long axis along local +Y)
 *
 * Why so simple: we want to debug pivots and rotations without being
 * distracted by mesh detail. Node names match what the C4D export uses,
 * so swapping in the real model later is just a file replace.
 *
 * Pivot rules (must hold — see Theodolite.tsx):
 *   Alidade pivots at world origin — rotates around Y by HA.
 *   Trunnion at (0, TRUNNION_Y, 0) in alidade space — rotates around X by z.
 *
 * Geometry is centred at the origin; positions live in the React mesh
 * wrappers so a single source of truth controls placement.
 */

import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// FileReader polyfill — GLTFExporter needs it for binary packing.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = ab;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = `data:application/octet-stream;base64,${Buffer.from(ab).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, '../src/assets/theodolite.glb');

export const TRUNNION_Y = 0.92;

const mat = (color) =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.5 });

const base = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.2, 0.5),
  mat(0x48484e),
);
base.name = 'Base';

const alidada = new THREE.Mesh(
  new THREE.BoxGeometry(0.4, 0.85, 0.4),
  mat(0xfafafd),
);
alidada.name = 'Alidada';

const telescope = new THREE.Mesh(
  new THREE.CylinderGeometry(0.06, 0.06, 0.6, 24),
  mat(0xfafafd),
);
telescope.name = 'Telescope';

const root = new THREE.Group();
root.name = 'Theodolite';
root.add(base, alidada, telescope);

const scene = new THREE.Scene();
scene.add(root);

const exporter = new GLTFExporter();
try {
  const glb = await exporter.parseAsync(scene, { binary: true });
  writeFileSync(OUT_PATH, Buffer.from(glb));
  const kb = (glb.byteLength / 1024).toFixed(1);
  console.log(`✓  ${OUT_PATH}  (${kb} KB)`);
} catch (err) {
  console.error('GLTFExporter failed:', err);
  process.exit(1);
}
