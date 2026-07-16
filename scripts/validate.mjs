import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const files = [
  'index.html',
  'styles.css',
  'gallery.js',
  'scenes/manifest.json',
  'shared/scene-selector.js',
  'scenes/nighthawks/index.html',
  'scenes/nighthawks/styles.css',
  'scenes/nighthawks/src/app.js',
  'src/app.js',
  'src/core.js',
  'src/environment.js',
  'src/characters.js',
  'src/runtime.js'
];
const content = {};

for (const path of files) {
  content[path] = await readFile(new URL(path, root), 'utf8');
  const info = await stat(new URL(path, root));
  if (info.size === 0) throw new Error(`${path} is empty.`);
}

const manifest = JSON.parse(content['scenes/manifest.json']);
if (!Array.isArray(manifest.scenes) || manifest.scenes.length === 0) {
  throw new Error('scenes/manifest.json must contain at least one scene.');
}

for (const scene of manifest.scenes) {
  if (!scene.id || !scene.titleZh || !scene.titleEn || !scene.path || !scene.description) {
    throw new Error(`Scene manifest entry is incomplete: ${JSON.stringify(scene)}`);
  }
}

const nighthawks = manifest.scenes.find((scene) => scene.id === 'nighthawks');
if (!nighthawks || nighthawks.path !== 'scenes/nighthawks/') {
  throw new Error('The Nighthawks scene must use scenes/nighthawks/.');
}

const joined = Object.values(content).join('\n');
const required = [
  'Painted Worlds',
  'scenes/nighthawks/',
  'scene-selector',
  'three@0.166.1',
  'OrbitControls',
  'RectAreaLight',
  'touch-action: none',
  'NIGHTHAWKS',
  'createSeatedMan',
  'createWoman',
  'createServer',
  'renderer.setAnimationLoop',
  'world.scale.z = -1'
];
const missing = required.filter((token) => !joined.includes(token));
if (missing.length) throw new Error(`Missing required markers: ${missing.join(', ')}`);

for (const dependency of ['./core.js', './environment.js', './characters.js', './runtime.js']) {
  if (!content['src/app.js'].includes(dependency)) throw new Error(`src/app.js does not import ${dependency}`);
}

if (!content['scenes/nighthawks/src/app.js'].includes("../../../src/app.js")) {
  throw new Error('The Nighthawks route is not connected to the scene runtime.');
}

if (!content['index.html'].includes('./scenes/nighthawks/')) {
  throw new Error('The gallery does not provide a Nighthawks fallback link.');
}

if (!content['scenes/nighthawks/index.html'].includes('manifest="../manifest.json"')) {
  throw new Error('The Nighthawks page is missing the shared scene manifest connection.');
}

const total = (await Promise.all(files.map(async (path) => (await stat(new URL(path, root))).size))).reduce((a, b) => a + b, 0);
if (total < 50000) throw new Error(`Site source is unexpectedly small: ${total} bytes.`);

console.log(`Validated ${files.length} site files, ${manifest.scenes.length} scene manifest entry, and ${required.length} required markers (${total} bytes).`);
