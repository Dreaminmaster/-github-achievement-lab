const {
  THREE, scene, fidelityDistrict, interiorLights
} = window.NH;

// Restore the painting's left-to-right sequence: rounded glass corner, solitary
// patron, couple, then server and equipment. Camera ownership now remains in
// runtime.js so initial load, touch, composition and reset all use one pose.
if (fidelityDistrict) fidelityDistrict.scale.x = -1;
if (interiorLights) interiorLights.scale.x = -1;

// Mirror the principal light rig and add restrained warm fills over the patron
// and server side of the counter. This module deliberately does not touch the
// camera or register competing reset handlers.
const patronFill = new THREE.PointLight(0xffe7a0, 1.35, 15, 1.55);
patronFill.position.set(-5.4, 3.05, 4.55);
scene.add(patronFill);
const serverFill = new THREE.PointLight(0xffefb2, .72, 10, 1.75);
serverFill.position.set(-8.4, 3.2, 5.55);
scene.add(serverFill);

Object.assign(window.NH, { patronFill, serverFill });
