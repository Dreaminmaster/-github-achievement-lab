import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

RectAreaLightUniformsLib.init();

const container = document.querySelector('#scene');
const loading = document.querySelector('#loading');
const hint = document.querySelector('#hint');
const compositionButton = document.querySelector('#composition');
const exploreButton = document.querySelector('#explore');
const lightButton = document.querySelector('#light');
const resetButton = document.querySelector('#reset');
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 760px)').matches || navigator.maxTouchPoints > 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x30251f);
scene.fog = new THREE.Fog(0x30251f, 30, 90);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .06, 150);
camera.position.set(0, 5.2, 18.4);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .072;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = .42;
controls.zoomSpeed = .72;
controls.panSpeed = .58;
controls.minDistance = 4.2;
controls.maxDistance = 48;
controls.minPolarAngle = .26;
controls.maxPolarAngle = 1.52;
controls.target.set(0, 3.05, -3.6);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
scene.add(world);

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: options.roughness ?? .84,
  metalness: options.metalness ?? .01,
  transparent: options.transparent ?? false,
  opacity: options.opacity ?? 1,
  side: options.side ?? THREE.FrontSide,
  emissive: options.emissive ?? 0,
  emissiveIntensity: options.emissiveIntensity ?? 0,
  depthWrite: options.depthWrite ?? true,
  flatShading: options.flatShading ?? false
});

const mats = {
  plaster: makeMaterial(0xb3a486, { roughness: .98, emissive: 0x2c2419, emissiveIntensity: .08 }),
  plasterDark: makeMaterial(0x746958, { roughness: .98 }),
  stone: makeMaterial(0x786c59, { roughness: .94 }),
  floor: makeMaterial(0x8b765d, { roughness: .94 }),
  beam: makeMaterial(0x4e3b2d, { roughness: .9 }),
  wood: makeMaterial(0x704a2f, { roughness: .78 }),
  woodDark: makeMaterial(0x3f2b22, { roughness: .88 }),
  cloth: makeMaterial(0xc7bda6, { roughness: .92 }),
  gold: makeMaterial(0x8e7045, { roughness: .38, metalness: .45 }),
  ceramic: makeMaterial(0xb8b0a1, { roughness: .7 }),
  bread: makeMaterial(0xb3814e, { roughness: .92 }),
  wine: makeMaterial(0x5c241f, { roughness: .42, transparent: true, opacity: .82 }),
  window: new THREE.MeshPhysicalMaterial({ color: 0xa8b8af, roughness: .2, transmission: .18, transparent: true, opacity: .28, thickness: .05, side: THREE.DoubleSide, depthWrite: false }),
  shadow: makeMaterial(0x2b211d, { roughness: 1 })
};

function box(parent, size, position, material, rotation = [0, 0, 0], cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

function cylinder(parent, top, bottom, height, position, material, rotation = [0, 0, 0], segments = 18, cast = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(parent, radius, position, material, scale = [1, 1, 1], segments = 18) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(10, Math.floor(segments * .66))), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function limbBetween(parent, start, end, radius, material, segments = 10) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .86, radius, direction.length(), segments), material);
  mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function canvasTexture(draw, width = 900, height = 600) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

// Refectory shell: the painted room continues the real dining hall as a perspective box.
box(world, [21, .22, 21], [0, -.12, 0], mats.floor, [0, 0, 0], false, true);
box(world, [21, .24, 21], [0, 8.05, 0], mats.plasterDark, [0, 0, 0], false, true);
box(world, [.28, 8.1, 21], [-10.35, 4, 0], mats.plaster);
box(world, [.28, 8.1, 21], [10.35, 4, 0], mats.plaster);

// Back wall split around three landscape windows.
const backZ = -9.72;
box(world, [21, 1.35, .3], [0, .65, backZ], mats.plaster);
box(world, [21, 1.45, .3], [0, 7.35, backZ], mats.plaster);
const windowCenters = [-4.45, 0, 4.45];
const windowWidth = 2.65;
const columns = [-10.35, -5.78, -3.12, -1.33, 1.33, 3.12, 5.78, 10.35];
for (let i = 0; i < columns.length - 1; i++) {
  const left = columns[i];
  const right = columns[i + 1];
  const center = (left + right) / 2;
  const width = right - left;
  const isOpening = windowCenters.some((x) => Math.abs(center - x) < .35 && width < 3.2);
  if (!isOpening) box(world, [width, 5.75, .3], [center, 4.1, backZ], mats.plaster);
}

const landscape = canvasTexture((ctx, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#9eaeb1');
  sky.addColorStop(.42, '#bcc0aa');
  sky.addColorStop(1, '#6e745d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#6f7861';
  ctx.beginPath();
  ctx.moveTo(0, h * .62);
  for (let x = 0; x <= w; x += 60) ctx.lineTo(x, h * (.48 + Math.sin(x * .017) * .07));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.fillStyle = 'rgba(207,199,163,.55)';
  ctx.fillRect(w * .42, h * .56, w * .17, h * .1);
}, 1000, 650);

for (const x of windowCenters) {
  const view = new THREE.Mesh(new THREE.PlaneGeometry(windowWidth - .16, 5.22), new THREE.MeshBasicMaterial({ map: landscape, side: THREE.DoubleSide, fog: false }));
  view.position.set(x, 4.08, backZ - .22);
  world.add(view);
  box(world, [windowWidth, .18, .18], [x, 6.75, backZ + .12], mats.stone);
  box(world, [windowWidth, .18, .18], [x, 1.4, backZ + .12], mats.stone);
  box(world, [.18, 5.5, .18], [x - windowWidth / 2, 4.08, backZ + .12], mats.stone);
  box(world, [.18, 5.5, .18], [x + windowWidth / 2, 4.08, backZ + .12], mats.stone);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(windowWidth - .08, 5.24), mats.window);
  glass.position.set(x, 4.08, backZ + .17);
  world.add(glass);
}

// Coffered ceiling and perspective beams.
for (let x = -9; x <= 9; x += 2.25) box(world, [.16, .28, 20.2], [x, 7.78, 0], mats.beam, [0, 0, 0], false, true);
for (let z = -8.7; z <= 8.7; z += 2.1) box(world, [20.2, .28, .16], [0, 7.78, z], mats.beam, [0, 0, 0], false, true);

// Side-wall tapestries and openings, extended beyond the crop.
const tapestryColors = [0x6b4a3a, 0x40544d, 0x6f6143, 0x4e3e48];
for (const side of [-1, 1]) {
  for (let i = 0; i < 4; i++) {
    const z = -6.7 + i * 3.75;
    const frame = makeMaterial(0x584431, { roughness: .88 });
    box(world, [.16, 3.1, 2.45], [side * 10.16, 4.15, z], frame, [0, 0, 0], false, true);
    box(world, [.18, 2.76, 2.12], [side * 10.05, 4.15, z], makeMaterial(tapestryColors[(i + (side > 0 ? 1 : 0)) % tapestryColors.length], { roughness: .98, emissive: 0x201711, emissiveIntensity: .05 }), [0, 0, 0], false, true);
  }
  box(world, [.34, 4.7, 2.1], [side * 10.15, 2.45, 7.65], mats.shadow);
}

// Long table, cloth, trestles and rear bench.
const table = new THREE.Group();
world.add(table);
box(table, [16.8, .34, 2.28], [0, 2.3, -2.7], mats.wood);
box(table, [17.15, .12, 2.55], [0, 2.52, -2.7], mats.cloth, [0, 0, 0], false, true);
for (const x of [-6.2, 0, 6.2]) {
  box(table, [.42, 2.05, 1.55], [x, 1.18, -2.7], mats.woodDark);
  box(table, [2.25, .22, 1.78], [x, .2, -2.7], mats.woodDark);
}
box(world, [16.2, .32, .82], [0, 1.12, -5.35], mats.woodDark);
for (const x of [-6.6, -3.3, 0, 3.3, 6.6]) box(world, [.24, 1.18, .68], [x, .52, -5.35], mats.woodDark);

// Table settings deliberately follow the broad rhythm of the original rather than decorative abundance.
for (let i = 0; i < 13; i++) {
  const x = -7.2 + i * 1.2;
  cylinder(table, .34, .34, .045, [x, 2.62, -2.52 + (i % 2) * .18], mats.ceramic, [0, 0, 0], 24, false);
  if (i % 2 === 0) sphere(table, .18, [x + .28, 2.69, -2.78], mats.bread, [1.25, .55, .9], 14);
  cylinder(table, .08, .1, .25, [x - .3, 2.72, -2.78], mats.wine, [0, 0, 0], 18, false);
  cylinder(table, .13, .13, .028, [x - .3, 2.58, -2.78], mats.gold, [0, 0, 0], 18, false);
}

const robePalette = [0x485d6e, 0x8b5f3d, 0x716548, 0x7a3d37, 0x4c6254, 0x916445, 0x5a7180, 0x826142, 0x6b4a56, 0x4d6458, 0x8e7046, 0x5a526b];
const skinMats = [makeMaterial(0xb78366, { roughness: .88, flatShading: true }), makeMaterial(0xc39576, { roughness: .88, flatShading: true })];
const hairMats = [makeMaterial(0x35261f, { roughness: 1, flatShading: true }), makeMaterial(0x5a3b27, { roughness: 1, flatShading: true }), makeMaterial(0x72604d, { roughness: 1, flatShading: true })];

function createDisciple({ x, z, robe, lean = 0, yaw = 0, leftGesture = [-.58, 1.7, .35], rightGesture = [.58, 1.7, .35], scale = 1, jesus = false }) {
  const person = new THREE.Group();
  person.position.set(x, .15, z);
  person.rotation.y = yaw;
  person.scale.setScalar(scale);
  world.add(person);
  const robeMat = makeMaterial(robe, { roughness: .9, flatShading: true });
  const mantleMat = makeMaterial(jesus ? 0x8e3b35 : new THREE.Color(robe).offsetHSL(.02, -.08, -.08).getHex(), { roughness: .92, flatShading: true });
  const skin = skinMats[Math.abs(Math.round(x * 10)) % skinMats.length];
  const hair = hairMats[Math.abs(Math.round(x * 7)) % hairMats.length];
  cylinder(person, .34, .5, 1.45, [0, 1.72, 0], robeMat, [0, 0, lean], 12);
  box(person, [.92, .68, .22], [0, 1.92, .05], mantleMat, [0, 0, lean * .65]);
  sphere(person, .29, [0, 2.68, 0], skin, [.88, 1.08, .92], 20);
  sphere(person, .31, [0, 2.79, -.08], hair, [1, .65, .96], 18);
  cylinder(person, .11, .14, .3, [0, 2.39, 0], skin, [0, 0, 0], 12);
  limbBetween(person, [-.31, 2.16, .02], leftGesture, .1, mantleMat);
  limbBetween(person, [.31, 2.16, .02], rightGesture, .1, mantleMat);
  sphere(person, .105, leftGesture, skin, [1, .78, 1], 12);
  sphere(person, .105, rightGesture, skin, [1, .78, 1], 12);
  if (jesus) box(person, [.82, .44, .18], [0, 1.65, .14], makeMaterial(0x385f77, { roughness: .9, flatShading: true }), [0, 0, 0]);
  return person;
}

const figures = [];
const configs = [
  [-7.25, -4.4, -.05, -.16, [-.8,1.62,.44], [.48,1.92,.3]],
  [-6.05, -4.26, .08, .18, [-.7,2.05,.18], [.72,1.65,.52]],
  [-4.82, -4.45, -.12, -.08, [-.82,1.72,.42], [.62,2.16,.15]],
  [-3.55, -4.28, .12, .14, [-.55,2.25,.08], [.78,1.7,.42]],
  [-2.38, -4.48, -.08, -.16, [-.72,1.75,.36], [.64,2.02,.32]],
  [-1.18, -4.25, .04, .2, [-.58,2.08,.12], [.56,1.68,.48]],
  [1.18, -4.25, -.04, -.2, [-.56,1.68,.48], [.58,2.08,.12]],
  [2.38, -4.48, .08, .16, [-.64,2.02,.32], [.72,1.75,.36]],
  [3.55, -4.28, -.12, -.14, [-.78,1.7,.42], [.55,2.25,.08]],
  [4.82, -4.45, .12, .08, [-.62,2.16,.15], [.82,1.72,.42]],
  [6.05, -4.26, -.08, -.18, [-.72,1.65,.52], [.7,2.05,.18]],
  [7.25, -4.4, .05, .16, [-.48,1.92,.3], [.8,1.62,.44]]
];
configs.forEach((cfg, index) => {
  figures.push(createDisciple({ x: cfg[0], z: cfg[1], robe: robePalette[index], lean: cfg[2], yaw: cfg[3], leftGesture: cfg[4], rightGesture: cfg[5], scale: index % 3 === 0 ? 1.02 : .98 }));
});
const jesus = createDisciple({ x: 0, z: -4.38, robe: 0x355e7a, lean: 0, yaw: 0, leftGesture: [-.82, 1.62, .5], rightGesture: [.82, 1.62, .5], scale: 1.08, jesus: true });

// Lighting: left-wall daylight aligns with the real refectory, with slight backlight from the three windows.
const ambient = new THREE.HemisphereLight(0xc4b991, 0x2d221d, .65);
scene.add(ambient);
const daylight = new THREE.DirectionalLight(0xffe7bd, 2.1);
daylight.position.set(-14, 11, 8);
daylight.castShadow = true;
daylight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
daylight.shadow.camera.left = -18;
daylight.shadow.camera.right = 18;
daylight.shadow.camera.top = 14;
daylight.shadow.camera.bottom = -10;
daylight.shadow.bias = -.00035;
scene.add(daylight);
const windowLights = new THREE.Group();
scene.add(windowLights);
for (const x of windowCenters) {
  const light = new THREE.RectAreaLight(0xcdd9cc, 2.25, 2.55, 5.1);
  light.position.set(x, 4.15, -9.25);
  light.lookAt(x, 3.2, -2.5);
  windowLights.add(light);
}
const tableFill = new THREE.PointLight(0xffc98e, 1.25, 18, 1.8);
tableFill.position.set(0, 5.4, -1.5);
scene.add(tableFill);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = isMobile ? 90 : 180;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = -9 + Math.random() * 18;
  dustPositions[i * 3 + 1] = .8 + Math.random() * 6.4;
  dustPositions[i * 3 + 2] = -8 + Math.random() * 15;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0xffdfad, size: .022, transparent: true, opacity: .28, depthWrite: false }));
scene.add(dust);

const target = new THREE.Vector3(0, 3.05, -3.6);
const desktopComposition = new THREE.Vector3(0, 5.25, 18.6);
let tween = null;
let lightOn = true;
let autoOrbit = false;
let lastTap = 0;
let multiTouchGesture = false;
const activePointers = new Set();

function compositionPose() {
  const aspect = innerWidth / innerHeight;
  const factor = aspect < .72 ? 2.35 : aspect < 1.05 ? 1.72 : aspect < 1.45 ? 1.2 : 1;
  return target.clone().add(desktopComposition.clone().sub(target).multiplyScalar(factor));
}

function moveCamera(destination, targetDestination = target, duration = prefersReducedMotion ? 1 : 950) {
  tween = { start: performance.now(), duration, fromPos: camera.position.clone(), toPos: destination.clone(), fromTarget: controls.target.clone(), toTarget: targetDestination.clone() };
}

function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function returnToComposition() {
  autoOrbit = false;
  controls.autoRotate = false;
  exploreButton.setAttribute('aria-pressed', 'false');
  compositionButton.classList.add('primary');
  moveCamera(compositionPose());
}
compositionButton.addEventListener('click', returnToComposition);
resetButton.addEventListener('click', returnToComposition);
exploreButton.addEventListener('click', () => {
  autoOrbit = !autoOrbit;
  controls.autoRotate = autoOrbit;
  controls.autoRotateSpeed = .24;
  exploreButton.setAttribute('aria-pressed', String(autoOrbit));
  compositionButton.classList.toggle('primary', !autoOrbit);
});
lightButton.addEventListener('click', () => {
  lightOn = !lightOn;
  lightButton.setAttribute('aria-pressed', String(lightOn));
  daylight.intensity = lightOn ? 2.1 : .32;
  windowLights.visible = lightOn;
  tableFill.intensity = lightOn ? 1.25 : .25;
  renderer.toneMappingExposure = lightOn ? 1.08 : .72;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  activePointers.add(event.pointerId);
  if (activePointers.size > 1) multiTouchGesture = true;
  hint.classList.add('hidden');
  compositionButton.classList.remove('primary');
}, { passive: true });
function releasePointer(event) {
  activePointers.delete(event.pointerId);
  if (activePointers.size === 0 && multiTouchGesture) setTimeout(() => { multiTouchGesture = false; }, 260);
}
renderer.domElement.addEventListener('pointercancel', releasePointer, { passive: true });
renderer.domElement.addEventListener('pointerup', (event) => {
  releasePointer(event);
  if (multiTouchGesture || event.pointerType === 'mouse') return;
  const now = performance.now();
  if (now - lastTap < 330) returnToComposition();
  lastTap = now;
}, { passive: true });
renderer.domElement.addEventListener('dblclick', returnToComposition);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < .72 ? 53 : camera.aspect < 1.05 ? 47 : 38;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 2));
}
addEventListener('resize', resize, { passive: true });

const clock = new THREE.Clock();
function animate(now) {
  const elapsed = clock.getElapsedTime();
  if (tween) {
    const progress = Math.min(1, (now - tween.start) / tween.duration);
    const eased = easeInOutCubic(progress);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, eased);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
    if (progress >= 1) tween = null;
  }
  if (!prefersReducedMotion) {
    dust.rotation.y = elapsed * .006;
    dust.position.y = Math.sin(elapsed * .18) * .025;
    tableFill.intensity = (lightOn ? 1.25 : .25) + Math.sin(elapsed * 1.2) * .018;
  }
  controls.update();
  renderer.render(scene, camera);
}

resize();
camera.position.copy(compositionPose());
controls.target.copy(target);
controls.update();
renderer.setAnimationLoop(animate);
requestAnimationFrame(() => {
  loading.classList.add('done');
  setTimeout(() => hint.classList.add('hidden'), 6000);
});
