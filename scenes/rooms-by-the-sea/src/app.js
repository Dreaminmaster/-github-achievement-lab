import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { rebuildRooms } from './fidelity.js';

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
scene.background = new THREE.Color(0xb7d6df);
scene.fog = new THREE.Fog(0xb7d6df, 38, 105);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .06, 220);
camera.position.set(-.2, 3.7, 10.9);
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .072;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = .42;
controls.zoomSpeed = .74;
controls.panSpeed = .6;
controls.minDistance = 2.6;
controls.maxDistance = 76;
controls.minPolarAngle = .18;
controls.maxPolarAngle = 1.54;
controls.target.set(.5, 2.45, -1.2);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
scene.add(world);
const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? .82, metalness: options.metalness ?? .01, transparent: options.transparent ?? false, opacity: options.opacity ?? 1, side: options.side ?? THREE.FrontSide, emissive: options.emissive ?? 0, emissiveIntensity: options.emissiveIntensity ?? 0, depthWrite: options.depthWrite ?? true, flatShading: options.flatShading ?? false });
const mats = {
  wall: makeMaterial(0xe8e2cf, { roughness: .94 }), wallWarm: makeMaterial(0xe9dfc7, { roughness: .94 }),
  floor: makeMaterial(0xc7b66f, { roughness: .91 }), floorDark: makeMaterial(0x8b7748, { roughness: .94 }),
  trim: makeMaterial(0xc8c0a8, { roughness: .86 }), door: makeMaterial(0xdcd7c5, { roughness: .86 }),
  handle: makeMaterial(0x76694e, { roughness: .32, metalness: .58 }), red: makeMaterial(0x8f3d30, { roughness: .83 }),
  wood: makeMaterial(0x6f4d32, { roughness: .79 }), woodDark: makeMaterial(0x4a3428, { roughness: .88 }),
  frame: makeMaterial(0x5c4937, { roughness: .72 }), picture: makeMaterial(0x6a897d, { roughness: .9, emissive: 0x25362f, emissiveIntensity: .04 }),
  shadow: makeMaterial(0x6c695d, { roughness: 1, transparent: true, opacity: .42, depthWrite: false }),
  sun: new THREE.MeshBasicMaterial({ color: 0xfff4c1, transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
};

function box(parent, size, position, material, rotation = [0, 0, 0], cast = true, receive = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
}
function cylinder(parent, top, bottom, height, position, material, rotation = [0, 0, 0], segments = 20) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function shapeMesh(points, material, position = [0, 0, 0], rotation = [0, 0, 0]) {
  const shape = new THREE.Shape(); shape.moveTo(points[0][0], points[0][1]);
  for (const point of points.slice(1)) shape.lineTo(point[0], point[1]); shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.receiveShadow = true; world.add(mesh); return mesh;
}

// Legacy study geometry is retained for comparison, then replaced by fidelity.js.
box(world, [12.4, .22, 11.8], [0, -.12, .4], mats.floor, [0, 0, 0], false, true);
box(world, [12.4, .22, 11.8], [0, 6.55, .4], mats.wallWarm, [0, 0, 0], false, true);
box(world, [.22, 6.7, 11.8], [6.1, 3.25, .4], mats.wallWarm);
box(world, [.22, 6.7, 4.2], [-6.1, 3.25, 3.9], mats.wall);
box(world, [.22, 6.7, 3.25], [-6.1, 3.25, -3.86], mats.wall);
box(world, [8.15, 6.7, .24], [-2.02, 3.25, -5.37], mats.wall);
box(world, [1.15, 6.7, .24], [5.53, 3.25, -5.37], mats.wallWarm);
box(world, [3.15, 1.05, .24], [3.34, 6.02, -5.37], mats.wallWarm);
const doorPivot = new THREE.Group(); doorPivot.position.set(5.02, 0, -5.15); doorPivot.rotation.y = -.34; world.add(doorPivot);
box(doorPivot, [2.65, 5.35, .16], [1.3, 2.68, 0], mats.door);
box(world, [3.6, 1.05, .22], [-4.2, 6.02, -.55], mats.wall);
const oceanUniforms = { uTime: { value: 0 } };
const wallSun = shapeMesh([[-5.98,.22],[1.9,.22],[1.9,5.98],[-1.05,5.98]], mats.sun, [0,0,-5.235]);
const floorSun = shapeMesh([[-5.95,5.8],[5.75,5.8],[4.55,-4.85],[-2.35,-4.85]], mats.sun, [0,.018,0], [-Math.PI/2,0,0]);

const fidelity = rebuildRooms({ THREE, scene, world, makeMaterial, box, cylinder, shapeMesh, isMobile, renderer });

const ambient = new THREE.HemisphereLight(0xd7edf0, 0x6e6d57, 1.05); scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff2bd, 4.8); sun.position.set(11,10,-14); sun.target.position.set(-1.5,1.2,-2.5); sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); sun.shadow.camera.left=-22; sun.shadow.camera.right=22; sun.shadow.camera.top=18; sun.shadow.camera.bottom=-16; sun.shadow.camera.near=1; sun.shadow.camera.far=70; sun.shadow.bias=-.00028; scene.add(sun,sun.target);
const oceanFill = new THREE.DirectionalLight(0x5ba5ba, 1.4); oceanFill.position.set(0,4,-18); scene.add(oceanFill);
const roomBounce = new THREE.PointLight(0xffe7a8, 1.1, 22, 1.7); roomBounce.position.set(1.8,2.6,-2.9); scene.add(roomBounce);

let sunlightOn = true, autoOrbit = false, tween = null;
const compositionTarget = new THREE.Vector3(.55,2.55,-1.35);
const desktopComposition = new THREE.Vector3(-.2,3.7,10.9);
function compositionPose(){const aspect=innerWidth/innerHeight;const factor=aspect<.72?1.55:aspect<1.05?1.3:aspect<1.42?1.12:1;return compositionTarget.clone().add(desktopComposition.clone().sub(compositionTarget).multiplyScalar(factor));}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function moveCamera(destination,targetDestination=compositionTarget,duration=prefersReducedMotion?1:850){tween={start:performance.now(),duration,fromPos:camera.position.clone(),toPos:destination.clone(),fromTarget:controls.target.clone(),toTarget:targetDestination.clone()};}
function stopAutomatedMotion(){tween=null;if(autoOrbit){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');}compositionButton.classList.remove('primary');}
function returnToComposition(){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');compositionButton.classList.add('primary');moveCamera(compositionPose());}
compositionButton.addEventListener('click',returnToComposition); resetButton.addEventListener('click',returnToComposition);
exploreButton.addEventListener('click',()=>{tween=null;autoOrbit=!autoOrbit;controls.autoRotate=autoOrbit;controls.autoRotateSpeed=.2;exploreButton.setAttribute('aria-pressed',String(autoOrbit));compositionButton.classList.toggle('primary',!autoOrbit);});
lightButton.addEventListener('click',()=>{sunlightOn=!sunlightOn;lightButton.setAttribute('aria-pressed',String(sunlightOn));sun.visible=sunlightOn;wallSun.visible=sunlightOn;floorSun.visible=sunlightOn;fidelity.sunLayers.visible=sunlightOn;roomBounce.visible=sunlightOn;renderer.toneMappingExposure=sunlightOn?1.05:.82;});
controls.addEventListener('start',()=>{hint.classList.add('hidden');stopAutomatedMotion();});

const activePointers=new Set(), pointerStarts=new Map(); let multiTouchGesture=false,lastSingleTap=-Infinity;
renderer.domElement.addEventListener('pointerdown',(event)=>{activePointers.add(event.pointerId);pointerStarts.set(event.pointerId,{x:event.clientX,y:event.clientY,time:performance.now()});if(activePointers.size>1)multiTouchGesture=true;stopAutomatedMotion();hint.classList.add('hidden');},{passive:true});
renderer.domElement.addEventListener('pointermove',(event)=>{const start=pointerStarts.get(event.pointerId);if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)start.moved=true;},{passive:true});
function finishPointer(event){const start=pointerStarts.get(event.pointerId);const hadMultiple=multiTouchGesture;activePointers.delete(event.pointerId);pointerStarts.delete(event.pointerId);if(activePointers.size===0)multiTouchGesture=false;if(!start||event.pointerType==='mouse'||hadMultiple||start.moved)return;if(performance.now()-start.time>320)return;const now=performance.now();if(now-lastSingleTap<340){lastSingleTap=-Infinity;returnToComposition();}else lastSingleTap=now;}
renderer.domElement.addEventListener('pointerup',finishPointer,{passive:true}); renderer.domElement.addEventListener('pointercancel',finishPointer,{passive:true}); renderer.domElement.addEventListener('dblclick',returnToComposition);

function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<.72?52:camera.aspect<1.05?47:42;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.35:2));}
addEventListener('resize',resize,{passive:true});
const clock=new THREE.Clock();
function animate(now){const elapsed=clock.getElapsedTime();oceanUniforms.uTime.value=prefersReducedMotion?0:elapsed;fidelity.update(elapsed,prefersReducedMotion);if(tween){const progress=Math.min(1,(now-tween.start)/tween.duration);const eased=ease(progress);camera.position.lerpVectors(tween.fromPos,tween.toPos,eased);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,eased);if(progress>=1)tween=null;}if(!prefersReducedMotion&&sunlightOn)roomBounce.intensity=1.1+Math.sin(elapsed*.32)*.025;controls.update();renderer.render(scene,camera);}
resize();camera.position.copy(compositionPose());controls.target.copy(compositionTarget);controls.update();renderer.setAnimationLoop(animate);
requestAnimationFrame(()=>{renderer.render(scene,camera);loading.classList.add('done');setTimeout(()=>hint.classList.add('hidden'),5500);});
