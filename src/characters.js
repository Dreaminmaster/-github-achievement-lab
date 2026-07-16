const { THREE, diner, mats, box, cylinder, sphere, limbBetween, canvasTexture, signPlane } = window.NH;

function createHat(parent, colorMaterial, position = [0, 0, 0], scale = 1) {
  const hat = new THREE.Group();
  hat.position.set(...position);
  parent.add(hat);
  cylinder(hat, .34 * scale, .34 * scale, .035 * scale, [0, 0, 0], colorMaterial, [0, 0, 0], 28);
  cylinder(hat, .22 * scale, .25 * scale, .18 * scale, [0, .095 * scale, 0], colorMaterial, [0, 0, 0], 20);
  box(hat, [.45 * scale, .042 * scale, .025 * scale], [0, .055 * scale, .23 * scale], mats.cream, [0, 0, 0], false, false);
  return hat;
}

function createFace(parent, options = {}) {
  const face = new THREE.Group();
  parent.add(face);
  const skin = options.skin ?? mats.skin;
  const head = sphere(face, .25, [0, 0, 0], skin, [.88, 1.08, .92], 24);
  head.rotation.y = options.faceYaw ?? 0;
  if (!options.backView) {
    sphere(face, .025, [-.082, .035, .224], mats.shadow, [1, .5, .5], 10);
    sphere(face, .025, [.082, .035, .224], mats.shadow, [1, .5, .5], 10);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(.038, .12, 8), skin);
    nose.position.set(0, -.005, .26);
    nose.rotation.x = Math.PI / 2;
    face.add(nose);
    box(face, [.11, .018, .015], [0, -.105, .234], options.lipMaterial ?? mats.woodLight, [0, 0, 0], false, false);
  }
  return face;
}

function createSeatedMan(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  diner.add(person);

  cylinder(person, .25, .31, .88, [0, 1.83, 0], options.jacket ?? mats.suit, [0, 0, options.lean ?? 0], 14);
  box(person, [.52, .08, .58], [0, 1.35, 0], options.jacket ?? mats.suit, [0, 0, 0], true, true);
  sphere(person, .25, [0, 2.4, .01], options.skin ?? mats.skin, [.88, 1.08, .92], 24);
  if (!options.backView) {
    sphere(person, .024, [-.08, 2.44, .23], mats.shadow, [1, .5, .5], 10);
    sphere(person, .024, [.08, 2.44, .23], mats.shadow, [1, .5, .5], 10);
    box(person, [.11, .016, .014], [0, 2.3, .238], mats.wood, [0, 0, 0], false, false);
  }
  createHat(person, options.hat ?? mats.suit, [0, 2.68, 0], .92);
  limbBetween(person, [-.23, 2.0, .05], [-.26, 1.62, .38], .09, options.jacket ?? mats.suit);
  limbBetween(person, [.23, 2.0, .05], [.3, 1.62, .38], .09, options.jacket ?? mats.suit);
  sphere(person, .09, [-.26, 1.58, .4], options.skin ?? mats.skin, [1, .78, 1], 14);
  sphere(person, .09, [.3, 1.58, .4], options.skin ?? mats.skin, [1, .78, 1], 14);
  return person;
}

function createWoman(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  diner.add(person);

  cylinder(person, .23, .31, .8, [0, 1.83, 0], mats.red, [0, 0, -.03], 16);
  sphere(person, .245, [0, 2.4, .015], mats.skinLight, [.87, 1.08, .92], 24);
  sphere(person, .275, [0, 2.44, -.035], mats.hairRed, [.98, 1.05, .92], 22);
  box(person, [.44, .24, .28], [0, 2.25, -.04], mats.hairRed, [0, 0, 0], true, true);
  sphere(person, .024, [-.078, 2.44, .235], mats.shadow, [1, .45, .45], 10);
  sphere(person, .024, [.078, 2.44, .235], mats.shadow, [1, .45, .45], 10);
  box(person, [.13, .025, .014], [0, 2.3, .24], mats.red, [0, 0, 0], false, false);
  limbBetween(person, [-.18, 2.03, .08], [-.32, 1.7, .42], .075, mats.skinLight);
  limbBetween(person, [.18, 2.03, .08], [.06, 1.73, .43], .075, mats.skinLight);
  sphere(person, .078, [-.32, 1.67, .43], mats.skinLight, [1, .78, 1], 14);
  sphere(person, .078, [.06, 1.7, .44], mats.skinLight, [1, .78, 1], 14);
  return person;
}

function createServer(options) {
  const person = new THREE.Group();
  person.position.set(...options.position);
  person.rotation.y = options.rotationY ?? 0;
  diner.add(person);

  cylinder(person, .25, .33, .92, [0, 1.95, 0], mats.white, [0, 0, -.16], 14);
  box(person, [.5, .56, .05], [.03, 1.78, .29], mats.cream, [0, 0, -.16], true, true);
  sphere(person, .24, [-.06, 2.48, .04], mats.skinLight, [.9, 1.05, .92], 24);
  sphere(person, .22, [-.08, 2.57, -.07], mats.white, [1, .58, .96], 18);
  sphere(person, .022, [-.13, 2.5, .245], mats.shadow, [1, .5, .5], 10);
  sphere(person, .022, [.02, 2.47, .245], mats.shadow, [1, .5, .5], 10);
  limbBetween(person, [-.22, 2.05, .05], [-.48, 1.64, .44], .075, mats.white);
  limbBetween(person, [.22, 2.04, .05], [.5, 1.65, .42], .075, mats.white);
  sphere(person, .082, [-.48, 1.61, .45], mats.skinLight, [1, .78, 1], 14);
  sphere(person, .082, [.5, 1.62, .43], mats.skinLight, [1, .78, 1], 14);
  return person;
}

createSeatedMan({ position: [2.12, .02, 1.5], rotationY: Math.PI * .94, backView: true, jacket: mats.suit, hat: mats.suit, lean: -.05 });
createSeatedMan({ position: [5.45, .03, 1.52], rotationY: Math.PI * .98, jacket: mats.navy, hat: mats.navy, skin: mats.skinLight, lean: .02 });
createWoman({ position: [6.55, .03, 1.55], rotationY: Math.PI * .98 });
createServer({ position: [8.12, .04, 1.77], rotationY: Math.PI * .94 });

const yellowDoorTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#cdbf65';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#455b51';
  ctx.fillRect(w * .56, h * .41, w * .12, h * .13);
  ctx.strokeStyle = 'rgba(255,245,190,.18)';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, w - 16, h - 16);
}, 360, 840);
signPlane(diner, yellowDoorTexture, [1.15, 2.85], [10.56, 2.22, 3.98], [0, 0, 0], false);

Object.assign(window.NH, { createHat, createFace, createSeatedMan, createWoman, createServer });
