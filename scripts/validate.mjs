import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const files = [
  'index.html',
  'styles.css',
  'gallery.js',
  'README.md',
  'scenes/README.md',
  'scenes/manifest.json',
  'shared/scene-selector.js',
  'scenes/nighthawks/index.html',
  'scenes/nighthawks/styles.css',
  'scenes/nighthawks/src/app.js',
  'src/app.js',
  'src/core.js',
  'src/environment.js',
  'src/characters.js',
  'src/runtime.js',
  'scenes/rooms-by-the-sea/index.html',
  'scenes/rooms-by-the-sea/styles.css',
  'scenes/rooms-by-the-sea/src/app.js',
  'scenes/last-supper/index.html',
  'scenes/last-supper/styles.css',
  'scenes/last-supper/src/app.js',
  'scenes/the-subway/index.html',
  'scenes/the-subway/styles.css',
  'scenes/the-subway/src/app.js',
  'vendor/three/three.module.min.js',
  'vendor/three/addons/controls/OrbitControls.js',
  'vendor/three/addons/lights/RectAreaLightUniformsLib.js'
];

const content = {};
for (const path of files) {
  content[path] = await readFile(new URL(path, root), 'utf8');
  const info = await stat(new URL(path, root));
  if (info.size === 0) throw new Error(`${path} is empty.`);
}

const manifest = JSON.parse(content['scenes/manifest.json']);
if (!Array.isArray(manifest.scenes) || manifest.scenes.length < 4) {
  throw new Error('scenes/manifest.json must contain all four available scenes.');
}

const requiredScenes = new Map([
  ['nighthawks', 'scenes/nighthawks/'],
  ['rooms-by-the-sea', 'scenes/rooms-by-the-sea/'],
  ['last-supper', 'scenes/last-supper/'],
  ['the-subway', 'scenes/the-subway/']
]);

for (const scene of manifest.scenes) {
  if (!scene.id || !scene.titleZh || !scene.titleEn || !scene.path || !scene.description) {
    throw new Error(`Scene manifest entry is incomplete: ${JSON.stringify(scene)}`);
  }
}

for (const [id, path] of requiredScenes) {
  const scene = manifest.scenes.find((entry) => entry.id === id);
  if (!scene || scene.path !== path || scene.status !== 'available') {
    throw new Error(`Scene ${id} must be available at ${path}.`);
  }
}

const joined = Object.values(content).join('\n');
const requiredMarkers = [
  'Painted Worlds',
  'scenes/nighthawks/',
  'scenes/rooms-by-the-sea/',
  'scenes/last-supper/',
  'scenes/the-subway/',
  'scene-selector',
  '../../vendor/three/three.module.min.js',
  '../../vendor/three/addons/',
  'OrbitControls',
  'RectAreaLight',
  'touch-action:none',
  'NIGHTHAWKS',
  'ROOMS BY THE SEA',
  'THE LAST SUPPER',
  'THE SUBWAY',
  'multiTouchGesture',
  'THREE.TOUCH.DOLLY_PAN',
  'renderer.setAnimationLoop',
  'glassCurve',
  'oppositeBlock',
  'oceanUniforms',
  'wallSun',
  'createDisciple',
  'windowCenters',
  'createPassage',
  'createGate',
  'centralWoman',
  'loading-error-message'
];

const missing = requiredMarkers.filter((token) => !joined.includes(token));
if (missing.length) throw new Error(`Missing required markers: ${missing.join(', ')}`);

for (const dependency of ['./core.js', './environment.js', './characters.js', './runtime.js']) {
  if (!content['src/app.js'].includes(dependency)) throw new Error(`src/app.js does not import ${dependency}`);
}

if (!content['scenes/nighthawks/src/app.js'].includes("../../../src/app.js")) {
  throw new Error('The Nighthawks route is not connected to the rebuilt scene runtime.');
}

for (const path of requiredScenes.values()) {
  if (!content['index.html'].includes(`./${path}`)) throw new Error(`The gallery fallback must link to ${path}.`);
}

for (const [path, current] of [
  ['scenes/nighthawks/index.html', 'current="nighthawks"'],
  ['scenes/rooms-by-the-sea/index.html', 'current="rooms-by-the-sea"'],
  ['scenes/last-supper/index.html', 'current="last-supper"'],
  ['scenes/the-subway/index.html', 'current="the-subway"']
]) {
  if (!content[path].includes(current) || !content[path].includes('manifest="../manifest.json"')) {
    throw new Error(`${path} is missing the shared scene selector connection.`);
  }
  if (content[path].includes('cdn.jsdelivr.net')) throw new Error(`${path} must not depend on a runtime CDN.`);
}

for (const token of ['海边的房间', 'rooms-by-the-sea', '最后的晚餐', 'last-supper', '乔治·图克', 'the-subway']) {
  if (!content['README.md'].includes(token)) throw new Error(`README is missing ${token}.`);
}

const total = (await Promise.all(files.map(async (path) => (await stat(new URL(path, root))).size))).reduce((a, b) => a + b, 0);
if (total < 600000) throw new Error(`Site source is unexpectedly small: ${total} bytes.`);

console.log(`Validated ${files.length} files, ${manifest.scenes.length} scenes, ${requiredMarkers.length} required markers, and ${total} bytes.`);
