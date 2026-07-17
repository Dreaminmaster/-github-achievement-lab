const {
  THREE, scene, camera, controls, renderer, fidelityDistrict, interiorLights,
  compositionButton, resetButton
} = window.NH;

// Restore the painting's left-to-right sequence: rounded glass corner, solitary
// patron, couple, then server and equipment.
if (fidelityDistrict) fidelityDistrict.scale.x = -1;
if (interiorLights) interiorLights.scale.x = -1;

// The mirrored model needs a composition centered farther along the counter so
// the couple and server remain inside the frame while the empty side street is
// still visible at the left.
const target = new THREE.Vector3(-1.25, 2.28, 4.28);
const desktop = new THREE.Vector3(-6.25, 5.2, -19.2);
function pose() {
  const aspect = innerWidth / innerHeight;
  const factor = aspect < .72 ? 1.72 : aspect < 1.05 ? 1.4 : aspect < 1.42 ? 1.14 : 1;
  return target.clone().add(desktop.clone().sub(target).multiplyScalar(factor));
}
function applyComposition() {
  camera.position.copy(pose());
  controls.target.copy(target);
  controls.update();
}
applyComposition();

// Mirror the principal light rig and add a restrained warm fill over the right
// half of the counter, which became underlit after correcting the orientation.
const patronFill = new THREE.PointLight(0xffe7a0, 1.35, 15, 1.55);
patronFill.position.set(-5.4, 3.05, 4.55);
scene.add(patronFill);
const serverFill = new THREE.PointLight(0xffefb2, .72, 10, 1.75);
serverFill.position.set(-8.4, 3.2, 5.55);
scene.add(serverFill);

// Capture the visible reset controls so they return to the corrected framing
// instead of the pre-mirror camera constants retained by the legacy runtime.
for (const button of [compositionButton, resetButton]) {
  button.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    applyComposition();
    compositionButton.classList.add('primary');
  }, true);
}
renderer.domElement.addEventListener('dblclick', (event) => {
  event.stopImmediatePropagation();
  applyComposition();
}, true);
