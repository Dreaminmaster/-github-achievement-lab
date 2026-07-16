import { readFile, stat } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const files = ['index.html', 'styles.css', 'src/app.js', 'src/core.js', 'src/environment.js', 'src/characters.js', 'src/runtime.js'];
const content = {};

for (const path of files) {
  content[path] = await readFile(new URL(path, root), 'utf8');
  const info = await stat(new URL(path, root));
  if (info.size === 0) throw new Error(`${path} is empty.`);
}

const joined = Object.values(content).join('\n');
const required = [
  'three@0.166.1', 'OrbitControls', 'RectAreaLight', 'touch-action: none', 'NIGHTHAWKS',
  'createSeatedMan', 'createWoman', 'createServer', 'renderer.setAnimationLoop', 'world.scale.z = -1'
];
const missing = required.filter((token) => !joined.includes(token));
if (missing.length) throw new Error(`Missing required markers: ${missing.join(', ')}`);

for (const dependency of ['./core.js', './environment.js', './characters.js', './runtime.js']) {
  if (!content['src/app.js'].includes(dependency)) throw new Error(`src/app.js does not import ${dependency}`);
}

const total = (await Promise.all(files.map(async (path) => (await stat(new URL(path, root))).size))).reduce((a, b) => a + b, 0);
if (total < 30000) throw new Error(`Scene source is unexpectedly small: ${total} bytes.`);
console.log(`Validated ${files.length} site files (${total} bytes) with ${required.length} scene markers.`);
