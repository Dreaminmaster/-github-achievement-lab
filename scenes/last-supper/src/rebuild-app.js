import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { rebuildLastSupper } from './fidelity.js';
import { createSafeComposition } from '../../../shared/safe-composition.js';

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
const verifyComposition = new URLSearchParams(location.search).has('verifyComposition');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x30251f);
scene.fog = new THREE.Fog(0x30251f, 38, 155);
const camera = new THREE.PerspectiveCamera(37, innerWidth / innerHeight, .045, 320);
const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, powerPreference: 'high-performance', alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.32 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .07;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.rotateSpeed = .46;
controls.zoomSpeed = .84;
controls.panSpeed = .72;
controls.minDistance = 1.8;
controls.maxDistance = 145;
controls.minPolarAngle = .035;
controls.maxPolarAngle = 1.84;
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group(); scene.add(world);
const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? .86, metalness: options.metalness ?? .01, transparent: options.transparent ?? false, opacity: options.opacity ?? 1, side: options.side ?? THREE.FrontSide, emissive: options.emissive ?? 0, emissiveIntensity: options.emissiveIntensity ?? 0, depthWrite: options.depthWrite ?? true, flatShading: options.flatShading ?? false });
function box(parent, size, position, material, rotation = [0,0,0], cast = true, receive = true) { const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh; }
function cylinder(parent, top, bottom, height, position, material, rotation = [0,0,0], segments = 18, cast = true) { const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,segments),material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh; }
function sphere(parent, radius, position, material, scale = [1,1,1], segments = 18) { const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius,segments,Math.max(10,Math.floor(segments*.66))),material); mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; }
function limbBetween(parent, start, end, radius, material, segments = 10) { const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end), direction = b.clone().sub(a); const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius*.86,radius,direction.length(),segments),material); mesh.position.copy(a.clone().add(b).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; }
function canvasTexture(draw, width = 900, height = 600) { const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const context = canvas.getContext('2d'); draw(context,width,height); const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = Math.min(8,renderer.capabilities.getMaxAnisotropy()); return texture; }

const fidelity = rebuildLastSupper({ THREE, scene, world, makeMaterial, box, cylinder, sphere, limbBetween, canvasTexture, isMobile, renderer });
const compositionSafety = createSafeComposition({ THREE, root: fidelity.group, allowRelocation: false });

const ambient = new THREE.HemisphereLight(0xc1b58d,0x2b211c,.62); scene.add(ambient);
const leftDaylight = new THREE.DirectionalLight(0xffe6bd,2.35); leftDaylight.position.set(-16,12,9); leftDaylight.target.position.set(0,3.1,-4.3); leftDaylight.castShadow = true;
leftDaylight.shadow.mapSize.set(isMobile?1024:2048,isMobile?1024:2048); leftDaylight.shadow.camera.left=-24; leftDaylight.shadow.camera.right=24; leftDaylight.shadow.camera.top=18; leftDaylight.shadow.camera.bottom=-14; leftDaylight.shadow.camera.near=1; leftDaylight.shadow.camera.far=80; leftDaylight.shadow.bias=-.0003; scene.add(leftDaylight,leftDaylight.target);
const backWindowLights = new THREE.Group(); scene.add(backWindowLights);
for(const x of [-4.2,0,4.2]){const light=new THREE.RectAreaLight(0xcdd7ca,2.15,2.55,4.6);light.position.set(x,3.8,-10.05);light.lookAt(x,3.0,-3.0);backWindowLights.add(light);}
const tableFill = new THREE.PointLight(0xffc98e,1.12,26,1.8); tableFill.position.set(0,5.2,-1.4); scene.add(tableFill);

const compositionPresets = {
  wide: { position: [0,5.05,15.6], target: [0,3.05,-3.65], fov: 39 },
  square: { position: [0,4.65,15.9], target: [0,3.45,-3.75], fov: 62 },
  portrait: { position: [0,4.35,16.2], target: [0,3.55,-3.85], fov: 82 }
};
const overviewPresets = {
  wide: { position: [14.5,9.4,21.0], target: [0,3.2,-4.4], fov: 42 },
  square: { position: [15.5,10.8,22.0], target: [0,3.3,-4.8], fov: 58 },
  portrait: { position: [15.8,11.4,22.8], target: [0,3.4,-5.0], fov: 70 }
};
function viewportMode(){const aspect=innerWidth/innerHeight;return aspect<.72?'portrait':aspect<1.18?'square':'wide';}
function presetFor(collection){return collection[viewportMode()];}
let tween=null,lightOn=true,autoOrbit=false,viewMode='composition';
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function moveCamera(preset,duration=prefersReducedMotion?1:950){document.documentElement.dataset.compositionReady='false';tween={start:performance.now(),duration,fromPos:camera.position.clone(),toPos:new THREE.Vector3(...preset.position),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...preset.target),fromFov:camera.fov,toFov:preset.fov};}
function beginFreeInteraction(){if(viewMode==='free'&&!autoOrbit)return;tween=null;compositionSafety.exit();if(autoOrbit){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');}viewMode='free';compositionButton.classList.remove('primary');document.documentElement.dataset.compositionReady='false';}
function returnToComposition(){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');viewMode='composition';compositionButton.classList.add('primary');moveCamera(compositionSafety.resolve(presetFor(compositionPresets)));}
compositionButton.addEventListener('click',returnToComposition);resetButton.addEventListener('click',returnToComposition);
exploreButton.addEventListener('click',()=>{tween=null;compositionSafety.exit();autoOrbit=!autoOrbit;controls.autoRotate=autoOrbit;controls.autoRotateSpeed=.18;exploreButton.setAttribute('aria-pressed',String(autoOrbit));compositionButton.classList.toggle('primary',!autoOrbit);if(autoOrbit){viewMode='overview';moveCamera(presetFor(overviewPresets));}else viewMode='free';});
lightButton.addEventListener('click',()=>{lightOn=!lightOn;lightButton.setAttribute('aria-pressed',String(lightOn));leftDaylight.intensity=lightOn?2.35:.28;backWindowLights.visible=lightOn;tableFill.intensity=lightOn?1.12:.18;renderer.toneMappingExposure=lightOn?1.04:.7;});
controls.addEventListener('start',()=>hint.classList.add('hidden'));

const activePointers=new Set(),pointerStarts=new Map();let multiTouchGesture=false,lastSingleTap=-Infinity;
renderer.domElement.addEventListener('pointerdown',(event)=>{activePointers.add(event.pointerId);pointerStarts.set(event.pointerId,{x:event.clientX,y:event.clientY,time:performance.now(),moved:false});if(activePointers.size>1){multiTouchGesture=true;beginFreeInteraction();}hint.classList.add('hidden');},{passive:true});
renderer.domElement.addEventListener('pointermove',(event)=>{const start=pointerStarts.get(event.pointerId);if(!start||start.moved)return;if(Math.hypot(event.clientX-start.x,event.clientY-start.y)>12){start.moved=true;beginFreeInteraction();}},{passive:true});
function finishPointer(event){const start=pointerStarts.get(event.pointerId),hadMultiple=multiTouchGesture;activePointers.delete(event.pointerId);pointerStarts.delete(event.pointerId);if(activePointers.size===0)multiTouchGesture=false;if(!start||event.pointerType==='mouse'||hadMultiple||start.moved||performance.now()-start.time>320)return;const now=performance.now();if(now-lastSingleTap<340){lastSingleTap=-Infinity;returnToComposition();}else lastSingleTap=now;}
renderer.domElement.addEventListener('pointerup',finishPointer,{passive:true});renderer.domElement.addEventListener('pointercancel',finishPointer,{passive:true});renderer.domElement.addEventListener('dblclick',returnToComposition);renderer.domElement.addEventListener('wheel',beginFreeInteraction,{passive:true});

function applyPresetImmediately(preset){camera.position.set(...preset.position);controls.target.set(...preset.target);camera.fov=preset.fov;camera.updateProjectionMatrix();controls.update();controls.saveState?.();}
function resize(){camera.aspect=innerWidth/innerHeight;if(viewMode==='composition'&&!tween)applyPresetImmediately(compositionSafety.resolve(presetFor(compositionPresets)));else if(viewMode==='overview'&&!tween)applyPresetImmediately(presetFor(overviewPresets));else camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.32:2));}
addEventListener('resize',resize,{passive:true});
const clock=new THREE.Clock();
function animate(now){const elapsed=clock.getElapsedTime();if(tween){const progress=Math.min(1,(now-tween.start)/tween.duration),eased=ease(progress);camera.position.lerpVectors(tween.fromPos,tween.toPos,eased);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,eased);camera.fov=THREE.MathUtils.lerp(tween.fromFov,tween.toFov,eased);camera.updateProjectionMatrix();if(progress>=1){tween=null;controls.update();controls.saveState?.();if(viewMode==='composition')document.documentElement.dataset.compositionReady='true';}}if(!prefersReducedMotion&&lightOn)tableFill.intensity=1.12+Math.sin(elapsed*.45)*.018;controls.update();renderer.render(scene,camera);}
const initialPreset=compositionSafety.resolve(presetFor(compositionPresets));applyPresetImmediately(initialPreset);resize();document.documentElement.dataset.compositionReady='true';
if(verifyComposition){compositionSafety.exit();viewMode='overview';applyPresetImmediately(presetFor(overviewPresets));setTimeout(returnToComposition,80);}
renderer.setAnimationLoop(animate);
requestAnimationFrame(()=>{renderer.render(scene,camera);loading.classList.add('done');setTimeout(()=>hint.classList.add('hidden'),6000);});

Object.assign(window,{__LAST_SUPPER_FIDELITY__:fidelity});
