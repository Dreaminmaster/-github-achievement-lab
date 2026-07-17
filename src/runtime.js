import { createSafeComposition } from '../shared/safe-composition.js';

const {
  THREE, scene, camera, renderer, controls, diner, mats, isMobile, prefersReducedMotion,
  loading, hint, compositionButton, exploreButton, lightButton, resetButton
} = window.NH;
const verifyComposition = new URLSearchParams(location.search).has('verifyComposition');

if (scene.fog?.isFogExp2) scene.fog.density = .0094;
renderer.toneMappingExposure = 1.22;
mats.glow.emissiveIntensity = 2.65;
mats.yellowWall.emissiveIntensity = .2;

const ambient = new THREE.HemisphereLight(0x668b90, 0x050b0d, .27); scene.add(ambient);
const moon = new THREE.DirectionalLight(0x78a4ac, .82); moon.position.set(-11, 15, -5); moon.castShadow = true;
moon.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048); moon.shadow.camera.left = -28; moon.shadow.camera.right = 28; moon.shadow.camera.top = 22; moon.shadow.camera.bottom = -20; moon.shadow.camera.near = 1; moon.shadow.camera.far = 60; moon.shadow.bias = -.00028; scene.add(moon);
const streetFill = new THREE.DirectionalLight(0x416b70, .43); streetFill.position.set(10, 6, -14); scene.add(streetFill);

const interiorLights = new THREE.Group(); scene.add(interiorLights);
const ceilingFront = new THREE.RectAreaLight(0xffe79a, 11.0, 11.6, 2.45); ceilingFront.position.set(4.4, 4.24, 4.15); ceilingFront.rotation.x = -Math.PI / 2; interiorLights.add(ceilingFront);
const ceilingBack = new THREE.RectAreaLight(0xffdc82, 8.2, 6.8, 2.0); ceilingBack.position.set(6.4, 3.96, 5.7); ceilingBack.rotation.x = -Math.PI / 2; interiorLights.add(ceilingBack);
const dinerFill = new THREE.PointLight(0xffdda0, 4.5, 16, 1.38); dinerFill.position.set(4.4, 3.2, 4.25); dinerFill.castShadow = !isMobile; interiorLights.add(dinerFill);
const cornerFill = new THREE.PointLight(0xffeaa0, 3.1, 11, 1.5); cornerFill.position.set(-1.25, 2.75, 4.2); interiorLights.add(cornerFill);
const counterGlow = new THREE.PointLight(0xffbd67, 2.2, 10, 1.72); counterGlow.position.set(6.7, 1.7, 3.65); interiorLights.add(counterGlow);
const glassSpillFront = new THREE.PointLight(0xffc875, 2.35, 19, 2.05); glassSpillFront.position.set(4.0, 1.25, 1.25); interiorLights.add(glassSpillFront);
const glassSpillCorner = new THREE.PointLight(0xffd487, 1.65, 13, 2.0); glassSpillCorner.position.set(-2.3, 1.35, 2.55); interiorLights.add(glassSpillCorner);
const windowCool = new THREE.PointLight(0x72a9a2, .5, 11, 1.8); windowCool.position.set(-2.6, 1.2, 3.4); interiorLights.add(windowCool);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = isMobile ? 90 : 180;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) { dustPositions[i * 3] = -2 + Math.random() * 13; dustPositions[i * 3 + 1] = 1 + Math.random() * 3.2; dustPositions[i * 3 + 2] = 2.9 + Math.random() * 3.2; }
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMaterial = new THREE.PointsMaterial({ color: 0xffedb1, size: .016, transparent: true, opacity: .3, depthWrite: false, blending: THREE.AdditiveBlending });
const dust = new THREE.Points(dustGeometry, dustMaterial); diner.add(dust);

const compositionTarget = new THREE.Vector3(3.1, 2.22, 4.25);
const desktopComposition = new THREE.Vector3(-4.8, 5.15, -15.8);
const compositionSafety = createSafeComposition({ THREE, root: window.NH.fidelityDistrict || window.NH.world, targetTolerance: 1.1 });
let tween = null, lightOn = true, autoOrbit = false, viewMode = 'composition';

function compositionPose() { const aspect = innerWidth / innerHeight; const factor = aspect < .72 ? 1.55 : aspect < 1.05 ? 1.34 : aspect < 1.42 ? 1.12 : 1; return compositionTarget.clone().add(desktopComposition.clone().sub(compositionTarget).multiplyScalar(factor)); }
function compositionPreset() { const aspect = innerWidth / innerHeight; return { position: compositionPose().toArray(), target: compositionTarget.toArray(), fov: aspect < .72 ? 49 : aspect < 1.05 ? 44 : 38 }; }
function overviewPreset() { const aspect = innerWidth / innerHeight; return { position: aspect < .72 ? [-14.8, 9.8, -25.5] : [-12.2, 8.0, -22.0], target: [3.1, 2.0, 4.4], fov: aspect < .72 ? 56 : 44 }; }
function easeInOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function moveCamera(preset, duration = prefersReducedMotion ? 1 : 850) { document.documentElement.dataset.compositionReady = 'false'; tween = { start: performance.now(), duration, fromPos: camera.position.clone(), toPos: new THREE.Vector3(...preset.position), fromTarget: controls.target.clone(), toTarget: new THREE.Vector3(...preset.target), fromFov: camera.fov, toFov: preset.fov }; }
function stopAutomatedMotion() { tween = null; compositionSafety.exit(); if (autoOrbit) { autoOrbit = false; controls.autoRotate = false; exploreButton.setAttribute('aria-pressed', 'false'); } viewMode = 'free'; compositionButton.classList.remove('primary'); }
function returnToComposition() { autoOrbit = false; controls.autoRotate = false; exploreButton.setAttribute('aria-pressed', 'false'); viewMode = 'composition'; compositionButton.classList.add('primary'); moveCamera(compositionSafety.resolve(compositionPreset())); }

compositionButton.addEventListener('click', returnToComposition); resetButton.addEventListener('click', returnToComposition);
exploreButton.addEventListener('click', () => { tween = null; compositionSafety.exit(); autoOrbit = !autoOrbit; controls.autoRotate = autoOrbit; controls.autoRotateSpeed = .24; exploreButton.setAttribute('aria-pressed', String(autoOrbit)); compositionButton.classList.toggle('primary', !autoOrbit); if (autoOrbit) { viewMode = 'overview'; moveCamera(overviewPreset()); } else viewMode = 'free'; });
lightButton.addEventListener('click', () => { lightOn = !lightOn; lightButton.setAttribute('aria-pressed', String(lightOn)); interiorLights.visible = lightOn; mats.glow.emissiveIntensity = lightOn ? 2.65 : .08; mats.yellowWall.emissiveIntensity = lightOn ? .2 : .008; renderer.toneMappingExposure = lightOn ? 1.22 : .68; });
controls.addEventListener('start', () => { hint.classList.add('hidden'); stopAutomatedMotion(); });

const activePointers = new Set(); const pointerStarts = new Map(); let multiTouchGesture = false; let lastSingleTap = -Infinity;
renderer.domElement.addEventListener('pointerdown', (event) => { activePointers.add(event.pointerId); pointerStarts.set(event.pointerId, { x: event.clientX, y: event.clientY, time: performance.now() }); if (activePointers.size > 1) multiTouchGesture = true; hint.classList.add('hidden'); stopAutomatedMotion(); }, { passive: true });
renderer.domElement.addEventListener('pointermove', (event) => { const start = pointerStarts.get(event.pointerId); if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) start.moved = true; }, { passive: true });
function finishPointer(event) { const start = pointerStarts.get(event.pointerId); const hadMultiple = multiTouchGesture; activePointers.delete(event.pointerId); pointerStarts.delete(event.pointerId); if (activePointers.size === 0) multiTouchGesture = false; if (!start || event.pointerType === 'mouse' || hadMultiple || start.moved) return; if (performance.now() - start.time > 320) return; const now = performance.now(); if (now - lastSingleTap < 340) { lastSingleTap = -Infinity; returnToComposition(); } else lastSingleTap = now; }
renderer.domElement.addEventListener('pointerup', finishPointer, { passive: true }); renderer.domElement.addEventListener('pointercancel', finishPointer, { passive: true }); renderer.domElement.addEventListener('dblclick', returnToComposition);

function applyPresetImmediately(preset) { camera.position.set(...preset.position); controls.target.set(...preset.target); camera.fov = preset.fov; camera.updateProjectionMatrix(); controls.update(); }
function resize() { camera.aspect = innerWidth / innerHeight; if (viewMode === 'composition' && !tween) applyPresetImmediately(compositionSafety.resolve(compositionPreset())); else if (viewMode === 'overview' && !tween) applyPresetImmediately(overviewPreset()); else camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.35 : 2)); }
addEventListener('resize', resize, { passive: true });

const clock = new THREE.Clock();
function animate(now) { const elapsed = clock.getElapsedTime(); if (tween) { const progress = Math.min(1, (now - tween.start) / tween.duration); const eased = easeInOutCubic(progress); camera.position.lerpVectors(tween.fromPos, tween.toPos, eased); controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased); camera.fov = THREE.MathUtils.lerp(tween.fromFov, tween.toFov, eased); camera.updateProjectionMatrix(); if (progress >= 1) { tween = null; if (viewMode === 'composition') document.documentElement.dataset.compositionReady = 'true'; } } if (!prefersReducedMotion) { dust.rotation.y = elapsed * .006; dust.position.y = Math.sin(elapsed * .18) * .018; if (lightOn) { ceilingFront.intensity = 11.0 + Math.sin(elapsed * 1.3) * .05; ceilingBack.intensity = 8.2 + Math.sin(elapsed * 1.1) * .035; dinerFill.intensity = 4.5 + Math.sin(elapsed * 1.9) * .03; counterGlow.intensity = 2.2 + Math.sin(elapsed * 1.55) * .025; } } controls.update(); renderer.render(scene, camera); }

const initialPreset = compositionSafety.resolve(compositionPreset()); applyPresetImmediately(initialPreset); resize(); document.documentElement.dataset.compositionReady = 'true';
if (verifyComposition) { compositionSafety.exit(); viewMode = 'overview'; applyPresetImmediately(overviewPreset()); setTimeout(returnToComposition, 80); }
renderer.setAnimationLoop(animate);
requestAnimationFrame(() => { renderer.render(scene, camera); loading.classList.add('done'); setTimeout(() => hint.classList.add('hidden'), 5500); });

Object.assign(window.NH, { ambient, moon, streetFill, interiorLights, dust, returnToComposition, stopAutomatedMotion });
