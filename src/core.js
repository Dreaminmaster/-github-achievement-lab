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
const isMobile = matchMedia('(max-width: 700px)').matches || navigator.maxTouchPoints > 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071416);
scene.fog = new THREE.FogExp2(0x071416, 0.014);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.08, 90);
camera.position.set(-1.5, 5.35, 16.5);

const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.45 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.45;
controls.zoomSpeed = 0.72;
controls.panSpeed = 0.55;
controls.minDistance = 5.5;
controls.maxDistance = 68;
controls.minPolarAngle = 0.38;
controls.maxPolarAngle = 1.49;
controls.target.set(3.9, 2.05, 1.5);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
world.scale.z = -1;
scene.add(world);

const palette = {
  night: 0x071416,
  street: 0x365457,
  pavement: 0x6e8079,
  teal: 0x0d4b47,
  deepTeal: 0x082f31,
  greenTrim: 0x1b6d59,
  blackGreen: 0x071d1e,
  brick: 0x70412d,
  brickDark: 0x3d2b27,
  warmWhite: 0xece6b4,
  cream: 0xe8dfb4,
  yellowWall: 0xd8cf91,
  wood: 0x6b2f1e,
  woodLight: 0x9b4b2b,
  brass: 0x8f7545,
  steel: 0xaeb7a9,
  red: 0x9f2d2b,
  navy: 0x182e3d,
  suit: 0x15292e,
  skin: 0xc99370,
  skinLight: 0xd8aa82,
  hairRed: 0x8c3f28,
  white: 0xd8ddd0,
  shadow: 0x101a1b
};

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: options.roughness ?? 0.74,
  metalness: options.metalness ?? 0.02,
  flatShading: options.flatShading ?? false,
  transparent: options.transparent ?? false,
  opacity: options.opacity ?? 1,
  side: options.side ?? THREE.FrontSide,
  emissive: options.emissive ?? 0x000000,
  emissiveIntensity: options.emissiveIntensity ?? 0,
  depthWrite: options.depthWrite ?? true
});

const mats = {
  street: makeMaterial(palette.street, { roughness: 0.96 }),
  pavement: makeMaterial(palette.pavement, { roughness: 0.96 }),
  teal: makeMaterial(palette.teal, { roughness: 0.82 }),
  deepTeal: makeMaterial(palette.deepTeal, { roughness: 0.88, emissive: 0x031819, emissiveIntensity: .16 }),
  greenTrim: makeMaterial(palette.greenTrim, { roughness: 0.68 }),
  blackGreen: makeMaterial(palette.blackGreen, { roughness: 0.8 }),
  brick: makeMaterial(palette.brick, { roughness: 0.95, emissive: 0x2b160d, emissiveIntensity: .18 }),
  brickDark: makeMaterial(palette.brickDark, { roughness: 0.96, emissive: 0x1b1010, emissiveIntensity: .14 }),
  cream: makeMaterial(palette.cream, { roughness: 0.8 }),
  yellowWall: makeMaterial(palette.yellowWall, { roughness: 0.72, emissive: 0x615d32, emissiveIntensity: .14 }),
  wood: makeMaterial(palette.wood, { roughness: 0.54 }),
  woodLight: makeMaterial(palette.woodLight, { roughness: 0.48 }),
  brass: makeMaterial(palette.brass, { roughness: 0.28, metalness: .68 }),
  steel: makeMaterial(palette.steel, { roughness: 0.2, metalness: .72 }),
  red: makeMaterial(palette.red, { roughness: 0.72, flatShading: true }),
  navy: makeMaterial(palette.navy, { roughness: 0.76, flatShading: true }),
  suit: makeMaterial(palette.suit, { roughness: 0.82, flatShading: true }),
  skin: makeMaterial(palette.skin, { roughness: 0.84, flatShading: true }),
  skinLight: makeMaterial(palette.skinLight, { roughness: 0.84, flatShading: true }),
  hairRed: makeMaterial(palette.hairRed, { roughness: .9, flatShading: true }),
  white: makeMaterial(palette.white, { roughness: .82, flatShading: true }),
  shadow: makeMaterial(palette.shadow, { roughness: .9 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x8ac4b0,
    roughness: .08,
    metalness: 0,
    transmission: .38,
    transparent: true,
    opacity: .27,
    thickness: .08,
    clearcoat: .38,
    clearcoatRoughness: .12,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  glow: makeMaterial(0xf0e9af, { emissive: 0xf0e9af, emissiveIntensity: 2.1, roughness: .38 }),
  windowDark: makeMaterial(0x081b1c, { roughness: .38, metalness: .1, emissive: 0x071313, emissiveIntensity: .1 })
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

function cylinder(parent, radiusTop, radiusBottom, height, position, material, rotation = [0, 0, 0], segments = 20, cast = true) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function sphere(parent, radius, position, material, scale = [1, 1, 1], segments = 20) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, Math.max(10, Math.floor(segments * .66))), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function limbBetween(parent, start, end, radius, material, segments = 12) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const midpoint = a.clone().add(b).multiplyScalar(.5);
  const length = a.distanceTo(b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .88, radius, length, segments), material);
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeFootprintShape(builder) {
  const shape = new THREE.Shape();
  builder(shape);
  return shape;
}

function extrudeHorizontal(parent, shape, height, y, material, options = {}) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: options.bevelEnabled ?? true,
    bevelSegments: options.bevelSegments ?? 2,
    steps: 1,
    bevelSize: options.bevelSize ?? .025,
    bevelThickness: options.bevelThickness ?? .025,
    curveSegments: options.curveSegments ?? 24
  });
  geometry.rotateX(Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y + height;
  mesh.castShadow = options.cast ?? true;
  mesh.receiveShadow = options.receive ?? true;
  parent.add(mesh);
  return mesh;
}

function panelAlong(parent, a, b, y, height, thickness, material, options = {}) {
  const p1 = new THREE.Vector2(...a);
  const p2 = new THREE.Vector2(...b);
  const delta = p2.clone().sub(p1);
  const length = delta.length();
  const mid = p1.clone().add(p2).multiplyScalar(.5);
  const segment = box(parent, [Math.max(.01, length - (options.gap ?? 0)), height, thickness], [mid.x, y + height / 2, mid.y], material, [0, -Math.atan2(delta.y, delta.x), 0], options.cast ?? true, options.receive ?? true);
  return segment;
}

function canvasTexture(draw, width = 1024, height = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

function signPlane(parent, texture, size, position, rotation = [0, 0, 0], emissive = false) {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: .76,
    metalness: 0,
    transparent: true,
    emissive: emissive ? 0x7d713c : 0x000000,
    emissiveIntensity: emissive ? .2 : 0,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = false;
  parent.add(mesh);
  return mesh;
}

Object.assign(window.NH = {}, {
  THREE, container, loading, hint, compositionButton, exploreButton, lightButton, resetButton,
  prefersReducedMotion, isMobile, scene, camera, renderer, controls, world, palette, makeMaterial, mats,
  box, cylinder, sphere, limbBetween, makeFootprintShape, extrudeHorizontal, panelAlong, canvasTexture, signPlane
});
