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
scene.background = new THREE.Color(0x777d74);
scene.fog = new THREE.Fog(0x777d74, 26, 88);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .06, 150);
camera.position.set(0, 4.45, 16.8);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.3 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .96;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .075;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = .4;
controls.zoomSpeed = .72;
controls.panSpeed = .56;
controls.minDistance = 3.8;
controls.maxDistance = 52;
controls.minPolarAngle = .25;
controls.maxPolarAngle = 1.52;
controls.target.set(0, 2.55, -2.4);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
scene.add(world);

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: options.roughness ?? .86,
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
  tile: makeMaterial(0xc6c4b5, { roughness: .93, emissive: 0x31332e, emissiveIntensity: .04 }),
  tileDark: makeMaterial(0x868b7e, { roughness: .95 }),
  green: makeMaterial(0x596c58, { roughness: .91 }),
  floor: makeMaterial(0x8d8b7d, { roughness: .96 }),
  floorDark: makeMaterial(0x686b64, { roughness: .98 }),
  ceiling: makeMaterial(0xa9a99d, { roughness: .96 }),
  metal: makeMaterial(0x303633, { roughness: .38, metalness: .68 }),
  metalDark: makeMaterial(0x171d1c, { roughness: .42, metalness: .55 }),
  light: makeMaterial(0xd9d6b8, { roughness: .38, emissive: 0xd9d6b8, emissiveIntensity: 1.35 }),
  red: makeMaterial(0x934737, { roughness: .9, flatShading: true }),
  rust: makeMaterial(0x8a4c34, { roughness: .91, flatShading: true }),
  ochre: makeMaterial(0x9a744a, { roughness: .91, flatShading: true }),
  navy: makeMaterial(0x3c4c56, { roughness: .92, flatShading: true }),
  charcoal: makeMaterial(0x3f4541, { roughness: .94, flatShading: true }),
  skin: makeMaterial(0xc79a7d, { roughness: .9, flatShading: true }),
  skinPale: makeMaterial(0xd0ad94, { roughness: .9, flatShading: true }),
  hair: makeMaterial(0x57443a, { roughness: 1, flatShading: true }),
  shadow: makeMaterial(0x333834, { roughness: 1, transparent: true, opacity: .22, depthWrite: false })
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
function cylinder(parent, top, bottom, height, position, material, rotation = [0, 0, 0], segments = 16, cast = true) {
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

// Main concourse shell, deliberately low and oppressive.
box(world, [25, .2, 34], [0, -.12, -3], mats.floor, [0, 0, 0], false, true);
box(world, [25, .28, 34], [0, 7.1, -3], mats.ceiling, [0, 0, 0], false, true);
box(world, [.3, 7.2, 34], [-12.35, 3.5, -3], mats.tile);
box(world, [.3, 7.2, 34], [12.35, 3.5, -3], mats.tile);
box(world, [25, 7.2, .3], [0, 3.5, -19.85], mats.tileDark);

// Tile bands and seams give the architecture its institutional repetition.
for (const side of [-1, 1]) {
  box(world, [.34, 1.05, 33.5], [side * 12.17, 1.05, -3], mats.green, [0, 0, 0], false, true);
}
for (let z = -18.2; z <= 12.8; z += 2.2) box(world, [24.6, .018, .045], [0, .015, z], mats.floorDark, [0, 0, 0], false, false);
for (let x = -11.2; x <= 11.2; x += 2.1) box(world, [.045, .018, 33], [x, .018, -3], mats.floorDark, [0, 0, 0], false, false);

// Forest of square columns and cross beams creates several competing vanishing systems.
const columns = [];
for (const x of [-8.4, -4.2, 4.2, 8.4]) {
  for (const z of [-12.5, -5.4, 1.7, 8.8]) {
    const column = new THREE.Group();
    column.position.set(x, 0, z);
    world.add(column);
    box(column, [1.0, 7, 1.0], [0, 3.5, 0], mats.tile);
    box(column, [1.08, 1.05, 1.08], [0, 1.02, 0], mats.green);
    for (let y = 1.62; y < 6.7; y += .62) box(column, [1.03, .018, 1.03], [0, y, 0], mats.tileDark, [0, 0, 0], false, false);
    columns.push(column);
  }
}
for (const z of [-12.5, -5.4, 1.7, 8.8]) box(world, [18, .85, 1.05], [0, 6.58, z], mats.ceiling);

// Side passages rotate away from the central view, extending the maze beyond the canvas.
function createPassage(x, z, rotationY, length = 18) {
  const passage = new THREE.Group();
  passage.position.set(x, 0, z);
  passage.rotation.y = rotationY;
  world.add(passage);
  box(passage, [6.5, .18, length], [0, -.08, -length / 2], mats.floorDark, [0, 0, 0], false, true);
  box(passage, [.24, 6.7, length], [-3.25, 3.35, -length / 2], mats.tile);
  box(passage, [.24, 6.7, length], [3.25, 3.35, -length / 2], mats.tile);
  box(passage, [6.5, .22, length], [0, 6.72, -length / 2], mats.ceiling, [0, 0, 0], false, true);
  box(passage, [.28, 1.05, length], [-3.1, 1.02, -length / 2], mats.green, [0, 0, 0], false, true);
  box(passage, [.28, 1.05, length], [3.1, 1.02, -length / 2], mats.green, [0, 0, 0], false, true);
  for (let pz = -2; pz > -length + 2; pz -= 3.4) box(passage, [2.7, .12, .55], [0, 6.48, pz], mats.light, [0, 0, 0], false, false);
  return passage;
}
const leftPassage = createPassage(-8.9, 4.9, Math.PI / 2, 21);
const rightPassage = createPassage(8.9, -.8, -Math.PI / 2, 20);
const rearPassage = createPassage(0, -15.8, 0, 18);

// Stairs leading to nowhere-visible, one of Tooker's most unsettling motifs.
function createStairs(parent, position, rotationY, width = 4.2, steps = 11) {
  const stairs = new THREE.Group();
  stairs.position.set(...position);
  stairs.rotation.y = rotationY;
  parent.add(stairs);
  for (let i = 0; i < steps; i++) box(stairs, [width, .28, .72], [0, .14 + i * .27, -i * .63], i % 2 ? mats.floor : mats.tileDark);
  box(stairs, [.16, 3.2, steps * .65], [-width / 2 - .2, 1.55, -steps * .31], mats.metalDark, [0, 0, 0], true, true);
  box(stairs, [.16, 3.2, steps * .65], [width / 2 + .2, 1.55, -steps * .31], mats.metalDark, [0, 0, 0], true, true);
  return stairs;
}
createStairs(world, [-6.0, .02, -14.2], .08, 4.4, 12);
createStairs(world, [7.2, .02, -7.4], -Math.PI / 2, 3.7, 10);

// Barred gates, cages and turnstiles cast the grid of shadows over the central figures.
function createGate(parent, position, rotationY, width = 5.5, height = 5.6) {
  const gate = new THREE.Group();
  gate.position.set(...position);
  gate.rotation.y = rotationY;
  parent.add(gate);
  box(gate, [width, .14, .16], [0, height, 0], mats.metalDark);
  box(gate, [width, .14, .16], [0, .08, 0], mats.metalDark);
  for (let x = -width / 2; x <= width / 2; x += .55) box(gate, [.055, height, .055], [x, height / 2, 0], mats.metal, [0, 0, 0], true, false);
  for (let y = .8; y < height; y += 1.25) box(gate, [width, .045, .045], [0, y, 0], mats.metal, [0, 0, 0], true, false);
  return gate;
}
const rightGate = createGate(world, [5.35, .02, 2.25], 0, 5.8, 5.7);
createGate(world, [-8.55, .02, -7.2], Math.PI / 2, 4.8, 5.5);
createGate(world, [8.45, .02, -14.2], -Math.PI / 2, 4.6, 5.5);

function createTurnstile(x, z, rotationY = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = rotationY;
  world.add(g);
  cylinder(g, .18, .22, 1.35, [0, .68, 0], mats.metalDark, [0, 0, 0], 16);
  cylinder(g, .08, .08, 1.8, [0, 1.18, 0], mats.metal, [0, 0, Math.PI / 2], 12);
  for (let i = 0; i < 3; i++) {
    const arm = new THREE.Group();
    arm.rotation.y = i * Math.PI * 2 / 3;
    g.add(arm);
    cylinder(arm, .045, .045, 1.25, [.55, 1.18, 0], mats.metal, [0, 0, Math.PI / 2], 10);
  }
  box(g, [.62, .32, .62], [0, 1.65, 0], mats.tileDark);
  return g;
}
for (const x of [-2.3, -.75, .8, 2.35]) createTurnstile(x, -7.7);

const figures = [];
function createFigure({ position, coat = mats.rust, dress = null, rotationY = 0, scale = 1, hat = false, bag = false, central = false, gaze = 0 }) {
  const person = new THREE.Group();
  person.position.set(...position);
  person.rotation.y = rotationY;
  person.scale.setScalar(scale);
  world.add(person);
  const skin = central ? mats.skinPale : mats.skin;
  const bodyMat = dress || coat;
  cylinder(person, .34, .48, 1.7, [0, 1.67, 0], bodyMat, [0, 0, central ? -.015 : .02], 12);
  box(person, [.86, 1.68, .3], [0, 1.68, .04], coat, [0, 0, 0]);
  sphere(person, .29, [0, 2.82, 0], skin, [.86, 1.1, .92], 20);
  sphere(person, .31, [0, 2.94, -.06], mats.hair, [1, .62, .96], 18);
  sphere(person, .026, [-.085 + gaze, 2.86, .255], mats.metalDark, [1, .5, .5], 10);
  sphere(person, .026, [.085 + gaze, 2.86, .255], mats.metalDark, [1, .5, .5], 10);
  box(person, [.13, .022, .012], [0, 2.7, .267], mats.rust, [0, 0, -.06], false, false);
  if (hat) {
    cylinder(person, .37, .37, .04, [0, 3.11, -.02], coat, [0, 0, 0], 24);
    cylinder(person, .23, .28, .2, [0, 3.21, -.02], coat, [0, 0, 0], 18);
  }
  if (central) {
    limbBetween(person, [-.27, 2.18, .02], [-.14, 1.52, .38], .09, coat);
    limbBetween(person, [.27, 2.18, .02], [.14, 1.48, .39], .09, coat);
    sphere(person, .11, [-.14, 1.48, .4], skin, [1, .75, 1], 12);
    sphere(person, .11, [.14, 1.44, .41], skin, [1, .75, 1], 12);
  } else {
    limbBetween(person, [-.28, 2.15, .02], [-.38, 1.48, .25], .09, coat);
    limbBetween(person, [.28, 2.15, .02], [.38, 1.52, .25], .09, coat);
    sphere(person, .1, [-.38, 1.44, .28], skin, [1, .75, 1], 12);
    sphere(person, .1, [.38, 1.48, .28], skin, [1, .75, 1], 12);
  }
  limbBetween(person, [-.18, .9, 0], [-.2, .12, .04], .12, coat);
  limbBetween(person, [.18, .9, 0], [.2, .12, .04], .12, coat);
  box(person, [.38, .12, .72], [-.22, .06, .2], mats.metalDark);
  box(person, [.38, .12, .72], [.22, .06, .2], mats.metalDark);
  if (bag) {
    box(person, [.62, .78, .18], [.62, 1.18, .08], mats.metalDark);
    cylinder(person, .03, .03, .62, [.62, 1.73, .08], mats.metalDark, [0, 0, Math.PI / 2], 8);
  }
  figures.push(person);
  return person;
}

// Central woman and surrounding commuters from the original arrangement.
const centralWoman = createFigure({ position: [0, .02, 2.15], coat: mats.navy, dress: mats.red, central: true, scale: 1.12, rotationY: -.02 });
createFigure({ position: [-2.15, .04, 1.25], coat: mats.rust, hat: true, bag: true, rotationY: .12, scale: 1.04, gaze: -.015 });
createFigure({ position: [1.65, .04, .75], coat: mats.ochre, hat: true, rotationY: -.1, scale: 1.03, gaze: .018 });
createFigure({ position: [3.42, .04, 1.45], coat: mats.rust, bag: true, rotationY: -.45, scale: .98 });
createFigure({ position: [6.8, .04, 2.4], coat: mats.charcoal, rotationY: -.55, scale: .96 });
createFigure({ position: [-6.8, .04, -1.25], coat: mats.ochre, rotationY: .65, scale: .9 });
createFigure({ position: [-3.8, .04, -4.35], coat: mats.red, rotationY: .08, scale: .78 });
createFigure({ position: [4.7, .04, -3.65], coat: mats.navy, hat: true, rotationY: -.28, scale: .82 });
createFigure({ position: [8.7, .04, -6.4], coat: mats.rust, rotationY: -.8, scale: .72 });
createFigure({ position: [-8.6, .04, 5.4], coat: mats.navy, rotationY: .75, scale: .86 });
createFigure({ position: [1.0, .04, -11.4], coat: mats.ochre, hat: true, rotationY: 0, scale: .66 });

// Fluorescent ceiling strips and directional fill.
const ambient = new THREE.HemisphereLight(0xd8d6bf, 0x3b403b, .72);
scene.add(ambient);
const fluorescentGroup = new THREE.Group();
scene.add(fluorescentGroup);
for (const z of [-14.5, -9.5, -4.5, .5, 5.5, 10.5]) {
  const rect = new THREE.RectAreaLight(0xe6e2c8, 2.9, 7.2, .65);
  rect.position.set(0, 6.78, z);
  rect.rotation.x = -Math.PI / 2;
  fluorescentGroup.add(rect);
  box(world, [7.2, .12, .65], [0, 6.86, z], mats.light, [0, 0, 0], false, false);
}
const frontFill = new THREE.DirectionalLight(0xc8c6b0, 1.05);
frontFill.position.set(-4, 8, 14);
frontFill.castShadow = true;
frontFill.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
frontFill.shadow.camera.left = -18;
frontFill.shadow.camera.right = 18;
frontFill.shadow.camera.top = 15;
frontFill.shadow.camera.bottom = -12;
frontFill.shadow.bias = -.00035;
scene.add(frontFill);

// Thin shadow grid projected across the central group.
const gridShadow = new THREE.Group();
gridShadow.position.set(0, .025, 2.1);
world.add(gridShadow);
for (let x = -4.4; x <= 4.4; x += .62) box(gridShadow, [.07, .018, 7.5], [x, 0, 0], mats.shadow, [0, .1, 0], false, false);
for (let z = -3.2; z <= 3.2; z += 1.05) box(gridShadow, [9.2, .018, .07], [0, 0, z], mats.shadow, [0, .1, 0], false, false);

const target = new THREE.Vector3(0, 2.55, -2.4);
const desktopComposition = new THREE.Vector3(0, 4.45, 16.8);
let tween = null;
let lightOn = true;
let autoOrbit = false;
let lastTap = 0;
let multiTouchGesture = false;
const activePointers = new Set();

function compositionPose() {
  const aspect = innerWidth / innerHeight;
  const factor = aspect < .72 ? 2.45 : aspect < 1.05 ? 1.78 : aspect < 1.45 ? 1.22 : 1;
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
  controls.autoRotateSpeed = .22;
  exploreButton.setAttribute('aria-pressed', String(autoOrbit));
  compositionButton.classList.toggle('primary', !autoOrbit);
});
lightButton.addEventListener('click', () => {
  lightOn = !lightOn;
  lightButton.setAttribute('aria-pressed', String(lightOn));
  fluorescentGroup.visible = lightOn;
  frontFill.intensity = lightOn ? 1.05 : .22;
  mats.light.emissiveIntensity = lightOn ? 1.35 : .08;
  renderer.toneMappingExposure = lightOn ? .96 : .62;
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
  camera.fov = camera.aspect < .72 ? 54 : camera.aspect < 1.05 ? 48 : 40;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.3 : 2));
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
    centralWoman.rotation.z = Math.sin(elapsed * .42) * .0025;
    for (let i = 0; i < figures.length; i++) figures[i].position.y = Math.sin(elapsed * .34 + i * .8) * .003;
    if (lightOn) {
      const pulse = Math.sin(elapsed * 5.7) * .015 + Math.sin(elapsed * 1.1) * .01;
      fluorescentGroup.children.forEach((child) => { if (child.isRectAreaLight) child.intensity = 2.9 + pulse; });
    }
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
