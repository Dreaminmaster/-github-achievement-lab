import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { rebuildLastSupper } from './fidelity.js';

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
scene.fog = new THREE.Fog(0x30251f, 34, 120);
const camera = new THREE.PerspectiveCamera(37, innerWidth / innerHeight, .06, 240);
camera.position.set(0, 5.25, 18.6);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.32 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .072;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = .4;
controls.zoomSpeed = .72;
controls.panSpeed = .6;
controls.minDistance = 3.7;
controls.maxDistance = 92;
controls.minPolarAngle = .14;
controls.maxPolarAngle = 1.58;
controls.target.set(0, 3.0, -3.6);
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
function box(parent, size, position, material, rotation = [0,0,0], cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
}
function cylinder(parent, top, bottom, height, position, material, rotation = [0,0,0], segments = 18, cast = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function sphere(parent, radius, position, material, scale = [1,1,1], segments = 18) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(10, Math.floor(segments * .66))), material);
  mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function limbBetween(parent, start, end, radius, material, segments = 10) {
  const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end), direction = b.clone().sub(a);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .86, radius, direction.length(), segments), material);
  mesh.position.copy(a.clone().add(b).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize());
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function canvasTexture(draw, width = 900, height = 600) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d'); draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); return texture;
}

const fidelity = rebuildLastSupper({ THREE, scene, world, makeMaterial, box, cylinder, sphere, limbBetween, canvasTexture, isMobile, renderer });

const ambient = new THREE.HemisphereLight(0xc1b58d, 0x2b211c, .58);
scene.add(ambient);
const leftDaylight = new THREE.DirectionalLight(0xffe6bd, 2.25);
leftDaylight.position.set(-16, 12, 9);
leftDaylight.target.position.set(0, 3.1, -4.3);
leftDaylight.castShadow = true;
leftDaylight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
leftDaylight.shadow.camera.left = -24; leftDaylight.shadow.camera.right = 24;
leftDaylight.shadow.camera.top = 18; leftDaylight.shadow.camera.bottom = -14;
leftDaylight.shadow.camera.near = 1; leftDaylight.shadow.camera.far = 80;
leftDaylight.shadow.bias = -.0003;
scene.add(leftDaylight, leftDaylight.target);

const backWindowLights = new THREE.Group();
scene.add(backWindowLights);
for (const x of [-4.2, 0, 4.2]) {
  const light = new THREE.RectAreaLight(0xcdd7ca, 2.05, 2.55, 4.6);
  light.position.set(x, 3.8, -10.05);
  light.lookAt(x, 3.0, -3.0);
  backWindowLights.add(light);
}
const tableFill = new THREE.PointLight(0xffc98e, 1.0, 24, 1.8);
tableFill.position.set(0, 5.2, -1.4);
scene.add(tableFill);

const compositionTarget = new THREE.Vector3(0, 3.0, -3.6);
const desktopComposition = new THREE.Vector3(0, 5.25, 18.6);
let tween = null;
let lightOn = true;
let autoOrbit = false;

function compositionPose() {
  const aspect = innerWidth / innerHeight;
  const factor = aspect < .72 ? 2.28 : aspect < 1.05 ? 1.68 : aspect < 1.45 ? 1.18 : 1;
  return compositionTarget.clone().add(desktopComposition.clone().sub(compositionTarget).multiplyScalar(factor));
}
function ease(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function moveCamera(destination, targetDestination = compositionTarget, duration = prefersReducedMotion ? 1 : 950) {
  tween = { start: performance.now(), duration, fromPos: camera.position.clone(), toPos: destination.clone(), fromTarget: controls.target.clone(), toTarget: targetDestination.clone() };
}
function stopAutomatedMotion() {
  tween = null;
  if (autoOrbit) { autoOrbit = false; controls.autoRotate = false; exploreButton.setAttribute('aria-pressed','false'); }
  compositionButton.classList.remove('primary');
}
function returnToComposition() {
  autoOrbit = false; controls.autoRotate = false; exploreButton.setAttribute('aria-pressed','false');
  compositionButton.classList.add('primary'); moveCamera(compositionPose());
}
compositionButton.addEventListener('click', returnToComposition);
resetButton.addEventListener('click', returnToComposition);
exploreButton.addEventListener('click', () => {
  tween = null; autoOrbit = !autoOrbit; controls.autoRotate = autoOrbit; controls.autoRotateSpeed = .18;
  exploreButton.setAttribute('aria-pressed', String(autoOrbit)); compositionButton.classList.toggle('primary', !autoOrbit);
});
lightButton.addEventListener('click', () => {
  lightOn = !lightOn; lightButton.setAttribute('aria-pressed', String(lightOn));
  leftDaylight.intensity = lightOn ? 2.25 : .28; backWindowLights.visible = lightOn;
  tableFill.intensity = lightOn ? 1.0 : .18; renderer.toneMappingExposure = lightOn ? 1.02 : .7;
});
controls.addEventListener('start', () => { hint.classList.add('hidden'); stopAutomatedMotion(); });

const activePointers = new Set();
const pointerStarts = new Map();
let multiTouchGesture = false;
let lastSingleTap = -Infinity;
renderer.domElement.addEventListener('pointerdown', (event) => {
  activePointers.add(event.pointerId); pointerStarts.set(event.pointerId, { x:event.clientX, y:event.clientY, time:performance.now() });
  if (activePointers.size > 1) multiTouchGesture = true; stopAutomatedMotion(); hint.classList.add('hidden');
}, { passive:true });
renderer.domElement.addEventListener('pointermove', (event) => {
  const start = pointerStarts.get(event.pointerId);
  if (start && Math.hypot(event.clientX-start.x, event.clientY-start.y) > 10) start.moved = true;
}, { passive:true });
function finishPointer(event) {
  const start = pointerStarts.get(event.pointerId); const hadMultiple = multiTouchGesture;
  activePointers.delete(event.pointerId); pointerStarts.delete(event.pointerId); if (activePointers.size === 0) multiTouchGesture = false;
  if (!start || event.pointerType === 'mouse' || hadMultiple || start.moved || performance.now()-start.time > 320) return;
  const now = performance.now(); if (now-lastSingleTap < 340) { lastSingleTap = -Infinity; returnToComposition(); } else lastSingleTap = now;
}
renderer.domElement.addEventListener('pointerup', finishPointer, { passive:true });
renderer.domElement.addEventListener('pointercancel', finishPointer, { passive:true });
renderer.domElement.addEventListener('dblclick', returnToComposition);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = camera.aspect < .72 ? 52 : camera.aspect < 1.05 ? 46 : 37;
  camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.32 : 2));
}
addEventListener('resize', resize, { passive:true });

const clock = new THREE.Clock();
function animate(now) {
  const elapsed = clock.getElapsedTime();
  if (tween) {
    const progress = Math.min(1, (now-tween.start)/tween.duration), eased = ease(progress);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, eased);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
    if (progress >= 1) tween = null;
  }
  if (!prefersReducedMotion && lightOn) tableFill.intensity = 1.0 + Math.sin(elapsed * .45) * .018;
  controls.update(); renderer.render(scene, camera);
}
resize(); camera.position.copy(compositionPose()); controls.target.copy(compositionTarget); controls.update();
renderer.setAnimationLoop(animate);
requestAnimationFrame(() => { renderer.render(scene, camera); loading.classList.add('done'); setTimeout(() => hint.classList.add('hidden'), 6000); });

Object.assign(window, { __LAST_SUPPER_FIDELITY__: fidelity });
