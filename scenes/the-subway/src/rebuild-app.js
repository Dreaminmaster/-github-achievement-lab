import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { rebuildSubway } from './fidelity.js';
import { createSafeComposition } from '../../../shared/safe-composition.js';

RectAreaLightUniformsLib.init();

const container=document.querySelector('#scene');
const loading=document.querySelector('#loading');
const hint=document.querySelector('#hint');
const compositionButton=document.querySelector('#composition');
const exploreButton=document.querySelector('#explore');
const lightButton=document.querySelector('#light');
const resetButton=document.querySelector('#reset');
const prefersReducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile=matchMedia('(max-width:760px)').matches||navigator.maxTouchPoints>0;
const verifyComposition=new URLSearchParams(location.search).has('verifyComposition');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x747b72);
scene.fog=new THREE.Fog(0x747b72,32,135);
const camera=new THREE.PerspectiveCamera(39,innerWidth/innerHeight,.045,300);
const renderer=new THREE.WebGLRenderer({antialias:!isMobile,powerPreference:'high-performance',alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.3:2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.98;
container.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.dampingFactor=.072;controls.enablePan=true;controls.screenSpacePanning=true;controls.zoomToCursor=true;
controls.rotateSpeed=.46;controls.zoomSpeed=.84;controls.panSpeed=.7;controls.minDistance=1.65;controls.maxDistance=140;controls.minPolarAngle=.035;controls.maxPolarAngle=1.84;
controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;

const world=new THREE.Group();scene.add(world);
const makeMaterial=(color,options={})=>new THREE.MeshStandardMaterial({color,roughness:options.roughness??.86,metalness:options.metalness??.01,transparent:options.transparent??false,opacity:options.opacity??1,side:options.side??THREE.FrontSide,emissive:options.emissive??0,emissiveIntensity:options.emissiveIntensity??0,depthWrite:options.depthWrite??true,flatShading:options.flatShading??false});
function box(parent,size,position,material,rotation=[0,0,0],cast=true,receive=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=cast;mesh.receiveShadow=receive;parent.add(mesh);return mesh;}
function cylinder(parent,top,bottom,height,position,material,rotation=[0,0,0],segments=16,cast=true){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,segments),material);mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.castShadow=cast;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function sphere(parent,radius,position,material,scale=[1,1,1],segments=18){const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,segments,Math.max(10,Math.floor(segments*.66))),material);mesh.position.set(...position);mesh.scale.set(...scale);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function limbBetween(parent,start,end,radius,material,segments=10){const a=new THREE.Vector3(...start),b=new THREE.Vector3(...end),direction=b.clone().sub(a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.86,radius,direction.length(),segments),material);mesh.position.copy(a.clone().add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());mesh.castShadow=true;parent.add(mesh);return mesh;}

const fidelity=rebuildSubway({THREE,scene,world,makeMaterial,box,cylinder,sphere,limbBetween,isMobile,renderer});
const compositionSafety=createSafeComposition({THREE,root:fidelity.group,targetTolerance:1.15});

const ambient=new THREE.HemisphereLight(0xd8d5bd,0x393f3a,.72);scene.add(ambient);
const fluorescentGroup=new THREE.Group();scene.add(fluorescentGroup);
for(const [x,z,w] of [[0,5.4,6.8],[-2.8,.4,4.4],[3.1,-2.0,4.6],[0,-8.6,5.8],[-8.4,1.4,2.8],[8,-8.8,3]]){const rect=new THREE.RectAreaLight(0xe6e2c8,2.75,w,.6);rect.position.set(x,6.15,z);rect.rotation.x=-Math.PI/2;fluorescentGroup.add(rect);}
const frontFill=new THREE.DirectionalLight(0xc7c5af,.96);frontFill.position.set(-4,8,14);frontFill.castShadow=true;
frontFill.shadow.mapSize.set(isMobile?1024:2048,isMobile?1024:2048);frontFill.shadow.camera.left=-20;frontFill.shadow.camera.right=20;frontFill.shadow.camera.top=15;frontFill.shadow.camera.bottom=-12;frontFill.shadow.bias=-.00035;scene.add(frontFill);
const sideFill=new THREE.DirectionalLight(0x87978a,.48);sideFill.position.set(12,5,-8);scene.add(sideFill);

const compositionPresets={wide:{position:[0,4.45,16.6],target:[0,2.55,-2.4],fov:39},square:{position:[0,4.75,18.2],target:[0,2.62,-2.65],fov:57},portrait:{position:[0,4.9,19.2],target:[0,2.68,-2.8],fov:70}};
const overviewPresets={wide:{position:[12.5,8.2,19.5],target:[0,2.65,-3.2],fov:43},square:{position:[13.8,9.4,21.5],target:[0,2.75,-3.8],fov:57},portrait:{position:[14.2,10.0,23.2],target:[0,2.85,-4.2],fov:66}};
function viewportMode(){const aspect=innerWidth/innerHeight;return aspect<.72?'portrait':aspect<1.18?'square':'wide';}
function presetFor(collection){return collection[viewportMode()];}
let tween=null,lightOn=true,autoOrbit=false,viewMode='composition';
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function moveCamera(preset,duration=prefersReducedMotion?1:950){document.documentElement.dataset.compositionReady='false';tween={start:performance.now(),duration,fromPos:camera.position.clone(),toPos:new THREE.Vector3(...preset.position),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...preset.target),fromFov:camera.fov,toFov:preset.fov};}
function stopAutomatedMotion(){tween=null;compositionSafety.exit();if(autoOrbit){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');}viewMode='free';compositionButton.classList.remove('primary');}
function returnToComposition(){autoOrbit=false;controls.autoRotate=false;exploreButton.setAttribute('aria-pressed','false');viewMode='composition';compositionButton.classList.add('primary');moveCamera(compositionSafety.resolve(presetFor(compositionPresets)));}
compositionButton.addEventListener('click',returnToComposition);resetButton.addEventListener('click',returnToComposition);
exploreButton.addEventListener('click',()=>{tween=null;compositionSafety.exit();autoOrbit=!autoOrbit;controls.autoRotate=autoOrbit;controls.autoRotateSpeed=.16;exploreButton.setAttribute('aria-pressed',String(autoOrbit));compositionButton.classList.toggle('primary',!autoOrbit);if(autoOrbit){viewMode='overview';moveCamera(presetFor(overviewPresets));}else viewMode='free';});
lightButton.addEventListener('click',()=>{lightOn=!lightOn;lightButton.setAttribute('aria-pressed',String(lightOn));fluorescentGroup.visible=lightOn;frontFill.intensity=lightOn?.96:.18;sideFill.intensity=lightOn?.48:.16;renderer.toneMappingExposure=lightOn?.98:.62;});
controls.addEventListener('start',()=>{hint.classList.add('hidden');stopAutomatedMotion();});

const activePointers=new Set(),pointerStarts=new Map();let multiTouchGesture=false,lastSingleTap=-Infinity;
renderer.domElement.addEventListener('pointerdown',(event)=>{activePointers.add(event.pointerId);pointerStarts.set(event.pointerId,{x:event.clientX,y:event.clientY,time:performance.now()});if(activePointers.size>1)multiTouchGesture=true;stopAutomatedMotion();hint.classList.add('hidden');},{passive:true});
renderer.domElement.addEventListener('pointermove',(event)=>{const start=pointerStarts.get(event.pointerId);if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)start.moved=true;},{passive:true});
function finishPointer(event){const start=pointerStarts.get(event.pointerId),hadMultiple=multiTouchGesture;activePointers.delete(event.pointerId);pointerStarts.delete(event.pointerId);if(activePointers.size===0)multiTouchGesture=false;if(!start||event.pointerType==='mouse'||hadMultiple||start.moved||performance.now()-start.time>320)return;const now=performance.now();if(now-lastSingleTap<340){lastSingleTap=-Infinity;returnToComposition();}else lastSingleTap=now;}
renderer.domElement.addEventListener('pointerup',finishPointer,{passive:true});renderer.domElement.addEventListener('pointercancel',finishPointer,{passive:true});renderer.domElement.addEventListener('dblclick',returnToComposition);

function applyPresetImmediately(preset){camera.position.set(...preset.position);controls.target.set(...preset.target);camera.fov=preset.fov;camera.updateProjectionMatrix();controls.update();}
function resize(){camera.aspect=innerWidth/innerHeight;if(viewMode==='composition'&&!tween)applyPresetImmediately(compositionSafety.resolve(presetFor(compositionPresets)));else if(viewMode==='overview'&&!tween)applyPresetImmediately(presetFor(overviewPresets));else camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.3:2));}
addEventListener('resize',resize,{passive:true});
const clock=new THREE.Clock();
function animate(now){const elapsed=clock.getElapsedTime();if(tween){const progress=Math.min(1,(now-tween.start)/tween.duration),eased=ease(progress);camera.position.lerpVectors(tween.fromPos,tween.toPos,eased);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,eased);camera.fov=THREE.MathUtils.lerp(tween.fromFov,tween.toFov,eased);camera.updateProjectionMatrix();if(progress>=1){tween=null;if(viewMode==='composition')document.documentElement.dataset.compositionReady='true';}}if(!prefersReducedMotion){fidelity.centralWoman.rotation.z=Math.sin(elapsed*.42)*.0025;for(let i=0;i<fidelity.figures.length;i++)fidelity.figures[i].position.y=Math.sin(elapsed*.34+i*.8)*.003;if(lightOn){const pulse=Math.sin(elapsed*5.7)*.014;fluorescentGroup.children.forEach((child)=>{if(child.isRectAreaLight)child.intensity=2.75+pulse;});}}controls.update();renderer.render(scene,camera);}
const initialPreset=compositionSafety.resolve(presetFor(compositionPresets));applyPresetImmediately(initialPreset);resize();document.documentElement.dataset.compositionReady='true';
if(verifyComposition){compositionSafety.exit();viewMode='overview';applyPresetImmediately(presetFor(overviewPresets));setTimeout(returnToComposition,80);}
renderer.setAnimationLoop(animate);
requestAnimationFrame(()=>{renderer.render(scene,camera);loading.classList.add('done');setTimeout(()=>hint.classList.add('hidden'),6000);});

Object.assign(window,{__SUBWAY_FIDELITY__:fidelity});
