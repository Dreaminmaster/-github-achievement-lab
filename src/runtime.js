const {
  THREE, scene, camera, renderer, controls, diner, mats, isMobile, prefersReducedMotion,
  loading, hint, compositionButton, exploreButton, lightButton, resetButton
} = window.NH;

const ambient = new THREE.HemisphereLight(0x91afb0, 0x081112, .58);
scene.add(ambient);

const moon = new THREE.DirectionalLight(0x9bc2c2, 1.45);
moon.position.set(-9, 13, 8);
moon.castShadow = true;
moon.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
moon.shadow.camera.left = -22;
moon.shadow.camera.right = 22;
moon.shadow.camera.top = 18;
moon.shadow.camera.bottom = -16;
moon.shadow.bias = -.0003;
scene.add(moon);

const frontFill = new THREE.DirectionalLight(0x6f9995, .9);
frontFill.position.set(-4, 5, -12);
scene.add(frontFill);

const interiorLights = new THREE.Group();
scene.add(interiorLights);

const rect1 = new THREE.RectAreaLight(0xfff4b7, 8.2, 8.5, 2.2);
rect1.position.set(5.55, 4.2, 1.7);
rect1.rotation.x = -Math.PI / 2;
interiorLights.add(rect1);

const rect2 = new THREE.RectAreaLight(0xffed9f, 6.2, 4.2, 2.2);
rect2.position.set(8.5, 3.3, 3.55);
rect2.rotation.x = -Math.PI / 2;
interiorLights.add(rect2);

const fill = new THREE.PointLight(0xffeaa8, 3.1, 13, 1.35);
fill.position.set(5.7, 3.6, 1.6);
fill.castShadow = !isMobile;
interiorLights.add(fill);

const windowGlow = new THREE.PointLight(0x87d0bd, 1.2, 11, 1.7);
windowGlow.position.set(-.6, 1.2, .25);
interiorLights.add(windowGlow);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = isMobile ? 120 : 230;
const dustPositions = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPositions[i * 3] = -1 + Math.random() * 12;
  dustPositions[i * 3 + 1] = 1.15 + Math.random() * 3.2;
  dustPositions[i * 3 + 2] = .3 + Math.random() * 3.7;
}
dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
const dustMaterial = new THREE.PointsMaterial({ color: 0xffefbd, size: .018, transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending });
const dust = new THREE.Points(dustGeometry, dustMaterial);
diner.add(dust);

const target = new THREE.Vector3(1.0, 2.38, 2.0);
const desktopComposition = new THREE.Vector3(-1.5, 5.35, 16.5);
let tween = null;
let lightOn = true;
let autoOrbit = false;
let lastTap = 0;

function compositionPose() {
  const aspect = innerWidth / innerHeight;
  const factor = aspect < .78 ? 2.15 : aspect < 1.15 ? 1.66 : aspect < 1.5 ? 1.24 : 1;
  return target.clone().add(desktopComposition.clone().sub(target).multiplyScalar(factor));
}

function moveCamera(destination, targetDestination = target, duration = prefersReducedMotion ? 1 : 950) {
  tween = {
    start: performance.now(),
    duration,
    fromPos: camera.position.clone(),
    toPos: destination.clone(),
    fromTarget: controls.target.clone(),
    toTarget: targetDestination.clone()
  };
}

function easeInOutCubic(t) {
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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
  controls.autoRotateSpeed = .28;
  exploreButton.setAttribute('aria-pressed', String(autoOrbit));
  compositionButton.classList.toggle('primary', !autoOrbit);
});

lightButton.addEventListener('click', () => {
  lightOn = !lightOn;
  lightButton.setAttribute('aria-pressed', String(lightOn));
  interiorLights.visible = lightOn;
  mats.glow.emissiveIntensity = lightOn ? 2.1 : .12;
  mats.yellowWall.emissiveIntensity = lightOn ? .14 : .01;
  renderer.toneMappingExposure = lightOn ? 1.18 : .76;
});

renderer.domElement.addEventListener('pointerdown', () => {
  hint.classList.add('hidden');
  compositionButton.classList.remove('primary');
}, { passive: true });

renderer.domElement.addEventListener('pointerup', (event) => {
  const now = performance.now();
  if (now - lastTap < 330 && event.pointerType !== 'mouse') returnToComposition();
  lastTap = now;
}, { passive: true });

renderer.domElement.addEventListener('dblclick', returnToComposition);

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  camera.aspect = width / height;
  camera.fov = camera.aspect < .78 ? 52 : camera.aspect < 1.15 ? 46 : 36;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.45 : 2));
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
    dust.rotation.y = elapsed * .008;
    dust.position.y = Math.sin(elapsed * .22) * .025;
    if (lightOn) {
      rect1.intensity = 8.2 + Math.sin(elapsed * 1.7) * .045 + Math.sin(elapsed * 8.3) * .016;
      fill.intensity = 3.1 + Math.sin(elapsed * 2.1) * .025;
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
  setTimeout(() => hint.classList.add('hidden'), 5500);
});

Object.assign(window.NH, { ambient, moon, frontFill, interiorLights, dust, returnToComposition });
