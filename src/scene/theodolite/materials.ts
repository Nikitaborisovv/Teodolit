/**
 * Procedural noise textures for the theodolite body materials.
 *
 *   roughnessNoise — high-frequency white noise → matte plastic micro-roughness
 *   bumpNoise      — low-frequency "dimples" → faint surface relief
 *
 * Both textures are module-level singletons so all three parts of the
 * instrument share the same GPU upload (cheaper, and identical surface
 * variance everywhere reads as one cohesive material).
 *
 * Lazy creation via getters keeps the module SSR-safe — nothing touches
 * `document` until React actually calls into a component.
 */

import * as THREE from 'three';

function createRoughnessCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    // Centred around 128 so the map modulates (not biases) the base roughness.
    const v = 128 + (Math.random() - 0.5) * 130;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function createBumpCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  // Mid-grey base — zero bump.
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  // Stamp ~500 soft radial blobs at random positions, alternating
  // brighter/darker than mid-grey. Result is a smooth low-frequency
  // noise field that reads as injected-plastic micro-relief once
  // bumpScale is tiny.
  const count = Math.floor((size * size) / 500);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 3 + Math.random() * 11;
    const dark = Math.random() < 0.5;
    const v = dark ? 70 : 190;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${v},${v},${v},0.45)`);
    grad.addColorStop(1, 'rgba(128,128,128,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return canvas;
}

function makeTexture(canvas: HTMLCanvasElement, repeat: number): THREE.Texture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

let _roughness: THREE.Texture | null = null;
let _bump: THREE.Texture | null = null;
let _pencil: THREE.Texture | null = null;

export function getRoughnessNoiseTexture(): THREE.Texture {
  if (!_roughness) _roughness = makeTexture(createRoughnessCanvas(512), 4);
  return _roughness;
}

export function getBumpNoiseTexture(): THREE.Texture {
  if (!_bump) _bump = makeTexture(createBumpCanvas(512), 3);
  return _bump;
}

/**
 * Pencil-stroke alpha map for line helpers. 1024×32 long strip: a few
 * jittered overlapping strokes + grainy noise on the alpha channel.
 * Line2 / drei <Line> maps U along the polyline length, V across width,
 * so this looks like a real pencil mark drawn from start to end.
 *
 * The texture is greyscale-on-transparent — when multiplied by the
 * line's `color` prop, the colour stays (red axis stays red) and the
 * shape just gains pencil texture.
 */
function createPencilStrokeCanvas(): HTMLCanvasElement {
  const w = 1024;
  const h = 32;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context unavailable');

  ctx.clearRect(0, 0, w, h);

  // 3 overlapping jittered strokes — looks like one pencil pass that
  // wasn't quite straight. Strokes are WHITE so MeshBasicMaterial's
  // color * texture multiply leaves the line's tint intact — all the
  // pencil character lives in the alpha channel.
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    let y = h / 2 + (Math.random() - 0.5) * 5;
    ctx.moveTo(0, y);
    for (let x = 8; x < w; x += 6) {
      y += (Math.random() - 0.5) * 1.2;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + Math.random() * 0.40})`;
    ctx.lineWidth = 6 + Math.random() * 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Grainy noise — random alpha drops give the pencil its "skip" feel.
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  for (let i = 3; i < data.length; i += 4) {
    const grain = 0.55 + Math.random() * 0.45;
    const a = data[i] ?? 0;
    data[i] = Math.min(255, a * grain);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function getPencilStrokeTexture(): THREE.Texture {
  if (_pencil) return _pencil;
  const tex = new THREE.CanvasTexture(createPencilStrokeCanvas());
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  // Repeat a few times along the line so longer segments don't smear
  // the texture into a featureless smudge.
  tex.repeat.set(3, 1);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  _pencil = tex;
  return _pencil;
}
