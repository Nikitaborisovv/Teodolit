/**
 * One-shot converter: takes the C4D-exported .gltf (with base64-embedded
 * buffers) from a source path and writes a compact .glb to src/assets/.
 *
 * Run: node --max-old-space-size=8192 scripts/import-c4d.mjs <input.gltf>
 *
 * Why a custom script and not gltf-pipeline:
 *   - no new dependency,
 *   - we can sanity-check node names and bounding boxes up front so
 *     React-side code (useTheodoliteGLB, Theodolite.tsx) can rely on them.
 *
 * The C4D scene already has the correct hierarchy and pivots:
 *   Base (root) -> Alidada (child) -> Telescope (grandchild)
 * We do NOT touch transforms here — they encode the VV pivot (alidade Y
 * axis) and HH pivot (telescope X axis). React applies its rotations
 * around those node positions.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

// Browser globals that GLTFLoader/Exporter expect.
globalThis.ProgressEvent = class ProgressEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.lengthComputable = !!init.lengthComputable;
    this.loaded = init.loaded ?? 0;
    this.total  = init.total  ?? 0;
  }
};

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
const INPUT  = resolve(process.argv[2] ?? 'C:/Users/Content_XO/Desktop/Teodolit_NEW.gltf');
const OUTPUT = join(__dirname, '../src/assets/theodolite.glb');

console.log(`→ Reading ${INPUT}`);
const text = readFileSync(INPUT, 'utf8');
const json = JSON.parse(text);
console.log(`  parsed JSON (${(text.length / 1024 / 1024).toFixed(1)} MB)`);

// GLTFLoader.parse expects either a JSON string or an ArrayBuffer.
const loader = new GLTFLoader();

const gltf = await new Promise((resolveP, rejectP) => {
  // base path '' means data: URIs are resolved by GLTFLoader itself.
  loader.parse(text, '', resolveP, rejectP);
});

console.log('→ Scene graph:');
const expected = new Set(['Base', 'Alidada', 'Telescope']);
const found = new Set();
gltf.scene.traverse((obj) => {
  if (obj.name) {
    const tag = expected.has(obj.name) ? '✓' : ' ';
    const pos = obj.position;
    console.log(`  ${tag} ${obj.type.padEnd(12)} "${obj.name}"  pos=(${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);
    if (expected.has(obj.name)) found.add(obj.name);
  }
});
for (const name of expected) {
  if (!found.has(name)) {
    console.warn(`  ! Expected node "${name}" not found in the scene.`);
  }
}

// Report bounding boxes (helpful for tuning camera framing later).
for (const name of ['Base', 'Alidada', 'Telescope']) {
  const obj = gltf.scene.getObjectByName(name);
  if (!obj) continue;
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  console.log(`  bbox(${name}) world: min=(${box.min.x.toFixed(3)}, ${box.min.y.toFixed(3)}, ${box.min.z.toFixed(3)})  size=(${size.x.toFixed(3)}, ${size.y.toFixed(3)}, ${size.z.toFixed(3)})`);
}

console.log('→ Exporting binary GLB');
const exporter = new GLTFExporter();
const glb = await exporter.parseAsync(gltf.scene, { binary: true });
writeFileSync(OUTPUT, Buffer.from(glb));
const mb = (glb.byteLength / 1024 / 1024).toFixed(2);
console.log(`✓ ${OUTPUT}  (${mb} MB)`);
