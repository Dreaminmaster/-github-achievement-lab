import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .06, 180);
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
controls.maxDistance = 38;
controls.minPolarAngle = .24;
controls.maxPolarAngle = 1.5;
controls.target.set(.5, 2.45, -1.2);
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

const world = new THREE.Group();
scene.add(world);
const makeMaterial = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: options.roughness ?? .82, metalness: options.metalness ?? .01, transparent: options.transparent ?? false, opacity: options.opacity ?? 1, side: options.side ?? THREE.FrontSide, emissive: options.emissive ?? 0, emissiveIntensity: options.emissiveIntensity ?? 0, depthWrite: options.depthWrite ?? true });
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

// Main room and the back wall split around the impossible door to the sea.
box(world, [12.4, .22, 11.8], [0, -.12, .4], mats.floor, [0, 0, 0], false, true);
box(world, [12.4, .22, 11.8], [0, 6.55, .4], mats.wallWarm, [0, 0, 0], false, true);
box(world, [.22, 6.7, 11.8], [6.1, 3.25, .4], mats.wallWarm);
box(world, [.22, 6.7, 4.2], [-6.1, 3.25, 3.9], mats.wall);
box(world, [.22, 6.7, 3.25], [-6.1, 3.25, -3.86], mats.wall);
box(world, [8.15, 6.7, .24], [-2.02, 3.25, -5.37], mats.wall);
box(world, [1.15, 6.7, .24], [5.53, 3.25, -5.37], mats.wallWarm);
box(world, [3.15, 1.05, .24], [3.34, 6.02, -5.37], mats.wallWarm);
box(world, [8.15, .18, .13], [-2.02, .18, -5.22], mats.trim);
box(world, [1.15, .18, .13], [5.53, .18, -5.22], mats.trim);
box(world, [.16, 5.55, .16], [1.98, 2.77, -5.17], mats.trim);
box(world, [.16, 5.55, .16], [5.0, 2.77, -5.17], mats.trim);
box(world, [3.18, .16, .16], [3.49, 5.5, -5.17], mats.trim);

const doorPivot = new THREE.Group();
doorPivot.position.set(5.02, 0, -5.15); doorPivot.rotation.y = -.34; world.add(doorPivot);
box(doorPivot, [2.65, 5.35, .16], [1.3, 2.68, 0], mats.door);
box(doorPivot, [.13, 5.1, .18], [.03, 2.68, 0], mats.trim);
box(doorPivot, [2.45, .13, .18], [1.3, 5.22, 0], mats.trim);
box(doorPivot, [2.45, .13, .18], [1.3, .13, 0], mats.trim);
cylinder(doorPivot, .07, .07, .1, [.18, 2.55, -.12], mats.handle, [Math.PI / 2, 0, 0], 16);
cylinder(doorPivot, .045, .045, .23, [.18, 2.55, -.25], mats.handle, [0, 0, Math.PI / 2], 12);

// Opening to the secondary room, with the red sofa, bureau and framed picture visible.
box(world, [3.6, 1.05, .22], [-4.2, 6.02, -.55], mats.wall);
box(world, [.22, 6.7, 2.7], [-2.38, 3.25, .9], mats.wall);
box(world, [.22, 6.7, 2.55], [-2.38, 3.25, -3.9], mats.wall);
box(world, [.18, 5.55, .15], [-2.52, 2.77, -1.25], mats.trim);
box(world, [3.48, .17, .15], [-4.25, 5.5, -1.25], mats.trim);
const sideRoom = new THREE.Group(); world.add(sideRoom);
box(sideRoom, [7.3, .2, 7], [-6, -.13, -1.25], mats.floorDark, [0, 0, 0], false, true);
box(sideRoom, [7.3, 6.7, .2], [-6, 3.25, -4.68], mats.wallWarm);
box(sideRoom, [.2, 6.7, 7], [-9.55, 3.25, -1.25], mats.wallWarm);
const sofa = new THREE.Group(); sofa.position.set(-6.8, .15, -3.55); sideRoom.add(sofa);
box(sofa, [2.65, .55, 1.05], [0, .45, 0], mats.red);
box(sofa, [2.65, 1.15, .3], [0, 1.08, .35], mats.red, [-.08, 0, 0]);
box(sofa, [.3, .78, 1.05], [-1.32, .62, 0], mats.red);
box(sofa, [.3, .78, 1.05], [1.32, .62, 0], mats.red);
for (const x of [-1.05, 1.05]) box(sofa, [.15, .5, .15], [x, .04, -.32], mats.woodDark);
const bureau = new THREE.Group(); bureau.position.set(-8.15, .1, -.05); sideRoom.add(bureau);
box(bureau, [1.65, 1.45, .65], [0, .75, 0], mats.wood);
box(bureau, [1.82, .12, .75], [0, 1.51, 0], mats.woodDark);
for (let row = 0; row < 3; row++) {
  box(bureau, [1.42, .34, .08], [0, .42 + row * .4, -.37], mats.woodDark);
  cylinder(bureau, .035, .035, .05, [0, .42 + row * .4, -.44], mats.handle, [Math.PI / 2, 0, 0], 10);
}
box(sideRoom, [1.55, 1.1, .11], [-7.25, 3.85, -4.53], mats.frame);
box(sideRoom, [1.34, .9, .08], [-7.25, 3.85, -4.46], mats.picture, [0, 0, 0], false, false);

// Animated ocean begins immediately outside the threshold.
const oceanUniforms = { uTime: { value: 0 }, uDeep: { value: new THREE.Color(0x176c88) }, uLight: { value: new THREE.Color(0x3f9bb0) }, uFoam: { value: new THREE.Color(0xa7d9dc) } };
const oceanMaterial = new THREE.ShaderMaterial({
  uniforms: oceanUniforms,
  vertexShader: `uniform float uTime; varying float vWave; varying vec2 vUv; void main(){vUv=uv;vec3 p=position;float w1=sin(p.x*.48+uTime*.58)*.08;float w2=cos(p.y*.34-uTime*.42)*.055;float w3=sin((p.x+p.y)*.19+uTime*.3)*.035;p.z+=w1+w2+w3;vWave=w1+w2+w3;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
  fragmentShader: `uniform vec3 uDeep;uniform vec3 uLight;uniform vec3 uFoam;varying float vWave;varying vec2 vUv;void main(){float horizon=smoothstep(.02,.78,vUv.y);vec3 color=mix(uLight,uDeep,horizon);float glint=smoothstep(.075,.13,abs(vWave))*(1.0-horizon)*.34;color=mix(color,uFoam,glint);gl_FragColor=vec4(color,1.0);}`,
  side: THREE.DoubleSide
});
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(95, 95, isMobile ? 70 : 120, isMobile ? 70 : 120), oceanMaterial);
ocean.rotation.x = -Math.PI / 2; ocean.position.set(4, -.18, -48); ocean.receiveShadow = true; world.add(ocean);
const sky = new THREE.Mesh(new THREE.SphereGeometry(105, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x80b7c4, side: THREE.BackSide, fog: false }));
sky.position.set(2, -.2, -35); world.add(sky);

const cliff = new THREE.Group(); world.add(cliff);
box(cliff, [12, 4.4, 7], [0, -2.15, -2.1], makeMaterial(0x6f7469, { roughness: .99 }), [0, 0, 0], false, true);
for (let i = 0; i < 14; i++) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + Math.random() * .85, 0), makeMaterial(i % 2 ? 0x73786e : 0x5e6963, { roughness: 1 }));
  rock.position.set(-5.4 + Math.random() * 10.8, -1.2 - Math.random() * 2.5, -4.5 + Math.random() * 3.2);
  rock.rotation.set(Math.random(), Math.random(), Math.random()); rock.scale.set(1.2, .6 + Math.random(), 1.1); cliff.add(rock);
}

// Hard-edged geometric sunlight preserves Hopper's deliberately impossible perspective.
const wallSun = shapeMesh([[-5.98,.22],[1.9,.22],[1.9,5.98],[-1.05,5.98]], mats.sun, [0,0,-5.235]);
const floorSun = shapeMesh([[-5.95,5.8],[5.75,5.8],[4.55,-4.85],[-2.35,-4.85]], new THREE.MeshBasicMaterial({ color:0xffec9f,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide }), [0,.018,0], [-Math.PI/2,0,0]);
shapeMesh([[-6,6.48],[-1,6.48],[1.9,5.98],[-1.05,5.98]], mats.shadow, [0,0,-5.225]);

const ambient = new THREE.HemisphereLight(0xd7edf0, 0x6e6d57, 1.05); scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff2bd, 4.8); sun.position.set(11,10,-14); sun.target.position.set(-1.5,1.2,-2.5); sun.castShadow = true;
sun.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); sun.shadow.camera.left=-14; sun.shadow.camera.right=14; sun.shadow.camera.top=13; sun.shadow.camera.bottom=-12; sun.shadow.camera.near=1; sun.shadow.camera.far=45; sun.shadow.bias=-.00028; scene.add(sun,sun.target);
const oceanFill = new THREE.DirectionalLight(0x5ba5ba, 1.4); oceanFill.position.set(0,4,-18); scene.add(oceanFill);
const roomBounce = new THREE.PointLight(0xffe7a8, 1.1, 14, 1.7); roomBounce.position.set(1.8,2.6,-2.9); scene.add(roomBounce);

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
lightButton.addEventListener('click',()=>{sunlightOn=!sunlightOn;lightButton.setAttribute('aria-pressed',String(sunlightOn));sun.visible=sunlightOn;wallSun.visible=sunlightOn;floorSun.visible=sunlightOn;roomBounce.visible=sunlightOn;renderer.toneMappingExposure=sunlightOn?1.05:.82;});
controls.addEventListener('start',()=>{hint.classList.add('hidden');stopAutomatedMotion();});

const activePointers=new Set(), pointerStarts=new Map(); let multiTouchGesture=false,lastSingleTap=-Infinity;
renderer.domElement.addEventListener('pointerdown',(event)=>{activePointers.add(event.pointerId);pointerStarts.set(event.pointerId,{x:event.clientX,y:event.clientY,time:performance.now()});if(activePointers.size>1)multiTouchGesture=true;stopAutomatedMotion();hint.classList.add('hidden');},{passive:true});
renderer.domElement.addEventListener('pointermove',(event)=>{const start=pointerStarts.get(event.pointerId);if(start&&Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)start.moved=true;},{passive:true});
function finishPointer(event){const start=pointerStarts.get(event.pointerId);const hadMultiple=multiTouchGesture;activePointers.delete(event.pointerId);pointerStarts.delete(event.pointerId);if(activePointers.size===0)multiTouchGesture=false;if(!start||event.pointerType==='mouse'||hadMultiple||start.moved)return;if(performance.now()-start.time>320)return;const now=performance.now();if(now-lastSingleTap<340){lastSingleTap=-Infinity;returnToComposition();}else lastSingleTap=now;}
renderer.domElement.addEventListener('pointerup',finishPointer,{passive:true}); renderer.domElement.addEventListener('pointercancel',finishPointer,{passive:true}); renderer.domElement.addEventListener('dblclick',returnToComposition);

function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=camera.aspect<.72?52:camera.aspect<1.05?47:42;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,isMobile?1.35:2));}
addEventListener('resize',resize,{passive:true});
const clock=new THREE.Clock();
function animate(now){const elapsed=clock.getElapsedTime();oceanUniforms.uTime.value=prefersReducedMotion?0:elapsed;if(tween){const progress=Math.min(1,(now-tween.start)/tween.duration);const eased=ease(progress);camera.position.lerpVectors(tween.fromPos,tween.toPos,eased);controls.target.lerpVectors(tween.fromTarget,tween.toTarget,eased);if(progress>=1)tween=null;}if(!prefersReducedMotion&&sunlightOn)roomBounce.intensity=1.1+Math.sin(elapsed*.32)*.025;controls.update();renderer.render(scene,camera);}
resize();camera.position.copy(compositionPose());controls.target.copy(compositionTarget);controls.update();renderer.setAnimationLoop(animate);
requestAnimationFrame(()=>{renderer.render(scene,camera);loading.classList.add('done');setTimeout(()=>hint.classList.add('hidden'),5500);});
