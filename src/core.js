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
scene.background = new THREE.Color(0x061214);
scene.fog = new THREE.FogExp2(0x061214, 0.0105);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.08, 120);
camera.position.set(-4.8, 5.15, -15.8);

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile,
  powerPreference: 'high-performance',
  alpha: false,
  preserveDrawingBuffer: false
});
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.072;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.42;
controls.zoomSpeed = 0.75;
controls.panSpeed = 0.62;
controls.minDistance = 3.6;
controls.maxDistance = 58;
controls.minPolarAngle = 0.28;
controls.maxPolarAngle = 1.52;
controls.target.set(3.15, 2.18, 4.25);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
scene.add(world);

const palette = {
  night: 0x061214,
  street: 0x263f43,
  streetWet: 0x36585a,
  pavement: 0x71817a,
  curb: 0x8b9990,
  teal: 0x0e403f,
  deepTeal: 0x082b2d,
  greenTrim: 0x1e6554,
  blackGreen: 0x071b1d,
  brick: 0x70432f,
  brickDark: 0x392824,
  brickShadow: 0x251b1a,
  cream: 0xebe2ae,
  yellowWall: 0xd6ce8d,
  wood: 0x6d301f,
  woodLight: 0x98482b,
  brass: 0x8f7441,
  steel: 0xadb6aa,
  red: 0xa32d2c,
  navy: 0x172c3a,
  suit: 0x14282d,
  skin: 0xc8926d,
  skinLight: 0xd9aa81,
  hairRed: 0x8e3f27,
  white: 0xe0e0d0,
  shadow: 0x10191a
};

const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({
  color,
  roughness: options.roughness ?? 0.76,
  metalness: options.metalness ?? 0.01,
  flatShading: options.flatShading ?? false,
  transparent: options.transparent ?? false,
  opacity: options.opacity ?? 1,
  side: options.side ?? THREE.FrontSide,
  emissive: options.emissive ?? 0x000000,
  emissiveIntensity: options.emissiveIntensity ?? 0,
  depthWrite: options.depthWrite ?? true
});

const mats = {
  street: makeMaterial(palette.street, { roughness: .98 }),
  streetWet: makeMaterial(palette.streetWet, { roughness: .78, metalness: .05 }),
  pavement: makeMaterial(palette.pavement, { roughness: .94 }),
  curb: makeMaterial(palette.curb, { roughness: .95 }),
  teal: makeMaterial(palette.teal, { roughness: .82 }),
  deepTeal: makeMaterial(palette.deepTeal, { roughness: .88, emissive: 0x031719, emissiveIntensity: .11 }),
  greenTrim: makeMaterial(palette.greenTrim, { roughness: .68 }),
  blackGreen: makeMaterial(palette.blackGreen, { roughness: .86 }),
  brick: makeMaterial(palette.brick, { roughness: .96, emissive: 0x25130c, emissiveIntensity: .12 }),
  brickDark: makeMaterial(palette.brickDark, { roughness: .98, emissive: 0x130b0a, emissiveIntensity: .12 }),
  brickShadow: makeMaterial(palette.brickShadow, { roughness: .99 }),
  cream: makeMaterial(palette.cream, { roughness: .78 }),
  yellowWall: makeMaterial(palette.yellowWall, { roughness: .72, emissive: 0x5a552b, emissiveIntensity: .12 }),
  wood: makeMaterial(palette.wood, { roughness: .58 }),
  woodLight: makeMaterial(palette.woodLight, { roughness: .5 }),
  brass: makeMaterial(palette.brass, { roughness: .3, metalness: .7 }),
  steel: makeMaterial(palette.steel, { roughness: .22, metalness: .72 }),
  red: makeMaterial(palette.red, { roughness: .76, flatShading: true }),
  navy: makeMaterial(palette.navy, { roughness: .8, flatShading: true }),
  suit: makeMaterial(palette.suit, { roughness: .84, flatShading: true }),
  skin: makeMaterial(palette.skin, { roughness: .86, flatShading: true }),
  skinLight: makeMaterial(palette.skinLight, { roughness: .84, flatShading: true }),
  hairRed: makeMaterial(palette.hairRed, { roughness: .92, flatShading: true }),
  white: makeMaterial(palette.white, { roughness: .84, flatShading: true }),
  shadow: makeMaterial(palette.shadow, { roughness: .95 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x83b8aa,
    roughness: .11,
    metalness: 0,
    transmission: .25,
    transparent: true,
    opacity: .24,
    thickness: .08,
    clearcoat: .28,
    clearcoatRoughness: .2,
    side: THREE.DoubleSide,
    depthWrite: false
  }),
  reflection: new THREE.MeshBasicMaterial({
    color: 0xa4d1c3,
    transparent: true,
    opacity: .055,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }),
  glow: makeMaterial(0xf2e6a5, { emissive: 0xf2e6a5, emissiveIntensity: 1.85, roughness: .4 }),
  windowDark: makeMaterial(0x06191b, { roughness: .4, metalness: .08, emissive: 0x041112, emissiveIntensity: .12 })
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
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .86, radius, length, segments), material);
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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
  return box(
    parent,
    [Math.max(.01, length - (options.gap ?? 0)), height, thickness],
    [mid.x, y + height / 2, mid.y],
    material,
    [0, -Math.atan2(delta.y, delta.x), 0],
    options.cast ?? true,
    options.receive ?? true
  );
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
    emissive: emissive ? 0x796e39 : 0x000000,
    emissiveIntensity: emissive ? .22 : 0,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function shapePlane(parent, points, y, material, rotationX = -Math.PI / 2) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (const [x, z] of points.slice(1)) shape.lineTo(x, z);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);
  mesh.rotation.x = rotationX;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addWindowGrid(parent, center, size, rows, cols, frameMaterial, inset = .045) {
  const [cx, cy, cz] = center;
  const [width, height] = size;
  for (let c = 1; c < cols; c++) {
    box(parent, [inset, height, inset], [cx - width / 2 + width * c / cols, cy, cz], frameMaterial);
  }
  for (let r = 1; r < rows; r++) {
    box(parent, [width, inset, inset], [cx, cy - height / 2 + height * r / rows, cz], frameMaterial);
  }
}

Object.assign(window.NH = {}, {
  THREE, container, loading, hint, compositionButton, exploreButton, lightButton, resetButton,
  prefersReducedMotion, isMobile, scene, camera, renderer, controls, world, palette, makeMaterial, mats,
  box, cylinder, sphere, limbBetween, makeFootprintShape, extrudeHorizontal, panelAlong,
  canvasTexture, signPlane, shapePlane, addWindowGrid
});
