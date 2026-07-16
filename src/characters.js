const { THREE, diner, mats, box, cylinder, sphere, limbBetween } = window.NH;

function createHat(parent, material, position = [0, 0, 0], scale = 1, tilt = 0) {
  const hat = new THREE.Group();
  hat.position.set(...position);
  hat.rotation.z = tilt;
  parent.add(hat);
  cylinder(hat, .34 * scale, .34 * scale, .035 * scale, [0, 0, 0], material, [0, 0, 0], 28);
  cylinder(hat, .21 * scale, .25 * scale, .18 * scale, [0, .095 * scale, 0], material, [0, 0, 0], 20);
  box(hat, [.44 * scale, .038 * scale, .026 * scale], [0, .055 * scale, .225 * scale], mats.cream, [0, 0, 0], false, false);
  return hat;
}

function facialDetails(parent, y, skin, options = {}) {
  if (options.backView) return;
  const face = new THREE.Group();
  face.position.y = y;
  face.rotation.y = options.yaw ?? 0;
  parent.add(face);
  sphere(face, .023, [-.078, .04, .228], mats.shadow, [1, .5, .5], 10);
  sphere(face, .023, [.078, .04, .228], mats.shadow, [1, .5, .5], 10);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.035, .105, 8), skin);
  nose.position.set(0, -.012, .257);
  nose.rotation.x = Math.PI / 2;
  face.add(nose);
  box(face, [.105, .017, .014], [0, -.115, .236], options.lips ?? mats.wood, [0, 0, 0], false, false);
}

function seatedMan(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  person.scale.setScalar(options.scale ?? 1);
  diner.add(person);
  const jacket = options.jacket ?? mats.suit;
  cylinder(person, .24, .31, .84, [0, 1.75, 0], jacket, [0, 0, options.lean ?? 0], 14);
  box(person, [.5, .08, .54], [0, 1.31, .01], jacket);
  sphere(person, .24, [0, 2.3, .015], options.skin ?? mats.skin, [.87, 1.08, .92], 24);
  facialDetails(person, 2.3, options.skin ?? mats.skin, { backView: options.backView, yaw: options.faceYaw ?? 0, lips: options.lips });
  createHat(person, options.hat ?? jacket, [0, 2.57, 0], .9, options.hatTilt ?? 0);
  limbBetween(person, [-.22, 1.95, .04], [-.25, 1.56, .39], .085, jacket);
  limbBetween(person, [.22, 1.95, .04], [.28, 1.56, .39], .085, jacket);
  sphere(person, .083, [-.25, 1.53, .4], options.skin ?? mats.skin, [1, .76, 1], 14);
  sphere(person, .083, [.28, 1.53, .4], options.skin ?? mats.skin, [1, .76, 1], 14);
  limbBetween(person, [-.14, 1.32, -.02], [-.17, .64, .02], .105, jacket);
  limbBetween(person, [.14, 1.32, -.02], [.18, .64, .02], .105, jacket);
  box(person, [.18, .12, .38], [-.17, .45, .17], mats.shadow);
  box(person, [.18, .12, .38], [.18, .45, .17], mats.shadow);
  return person;
}

function seatedWoman(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  person.scale.setScalar(options.scale ?? 1);
  diner.add(person);
  cylinder(person, .22, .3, .77, [0, 1.76, 0], mats.red, [0, 0, -.025], 16);
  box(person, [.46, .08, .5], [0, 1.33, 0], mats.red);
  sphere(person, .238, [0, 2.3, .015], mats.skinLight, [.87, 1.08, .92], 24);
  sphere(person, .267, [0, 2.35, -.04], mats.hairRed, [.98, 1.04, .92], 22);
  box(person, [.42, .24, .27], [0, 2.17, -.04], mats.hairRed);
  facialDetails(person, 2.3, mats.skinLight, { yaw: options.faceYaw ?? 0, lips: mats.red });
  limbBetween(person, [-.18, 1.98, .07], [-.31, 1.61, .42], .073, mats.skinLight);
  limbBetween(person, [.18, 1.98, .07], [.04, 1.63, .43], .073, mats.skinLight);
  sphere(person, .075, [-.31, 1.58, .43], mats.skinLight, [1, .76, 1], 14);
  sphere(person, .075, [.04, 1.6, .44], mats.skinLight, [1, .76, 1], 14);
  limbBetween(person, [-.12, 1.34, -.02], [-.14, .64, .02], .09, mats.red);
  limbBetween(person, [.12, 1.34, -.02], [.15, .64, .02], .09, mats.red);
  return person;
}

function server(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  person.scale.setScalar(options.scale ?? 1);
  diner.add(person);
  cylinder(person, .24, .32, .88, [0, 1.86, 0], mats.white, [0, 0, -.12], 14);
  box(person, [.48, .55, .05], [.03, 1.72, .29], mats.cream, [0, 0, -.12]);
  sphere(person, .232, [-.05, 2.38, .035], mats.skinLight, [.9, 1.05, .92], 24);
  sphere(person, .215, [-.07, 2.48, -.07], mats.white, [1, .58, .96], 18);
  facialDetails(person, 2.38, mats.skinLight, { yaw: -.08, lips: mats.wood });
  limbBetween(person, [-.21, 1.98, .05], [-.48, 1.58, .42], .073, mats.white);
  limbBetween(person, [.21, 1.98, .05], [.48, 1.58, .41], .073, mats.white);
  sphere(person, .08, [-.48, 1.55, .43], mats.skinLight, [1, .76, 1], 14);
  sphere(person, .08, [.48, 1.55, .42], mats.skinLight, [1, .76, 1], 14);
  limbBetween(person, [-.13, 1.42, 0], [-.16, .72, .02], .1, mats.white);
  limbBetween(person, [.13, 1.42, 0], [.17, .72, .02], .1, mats.white);
  return person;
}

const lonePatron = seatedMan({ position: [-.72, .03, 3.95], rotationY: .03, backView: true, jacket: mats.suit, hat: mats.suit, lean: -.04, scale: 1.02 });
const man = seatedMan({ position: [4.82, .03, 3.86], rotationY: .02, jacket: mats.navy, hat: mats.navy, skin: mats.skinLight, faceYaw: .16, lean: .015 });
const woman = seatedWoman({ position: [5.95, .03, 3.88], rotationY: .02, faceYaw: -.22, scale: .98 });
const attendant = server({ position: [7.85, .03, 4.78], rotationY: Math.PI, scale: 1.01 });
box(diner, [.24, .025, .16], [5.88, 1.69, 4.03], mats.cream, [0, -.18, 0], false, true);

Object.assign(window.NH, { createHat, seatedMan, seatedWoman, server, lonePatron, man, woman, attendant });
