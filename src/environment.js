const {
  THREE, world, mats, box, cylinder, sphere, makeFootprintShape, extrudeHorizontal,
  panelAlong, canvasTexture, signPlane, makeMaterial
} = window.NH;

const ground = new THREE.Group();
world.add(ground);

box(ground, [46, .18, 42], [0, -.13, 0], mats.street, [0, 0, 0], false, true);

const sidewalkShape = makeFootprintShape((s) => {
  s.moveTo(-20, -2.2);
  s.lineTo(18, -2.2);
  s.lineTo(18, 8.4);
  s.lineTo(-8.5, 8.4);
  s.lineTo(-20, 1.6);
  s.closePath();
});
extrudeHorizontal(ground, sidewalkShape, .12, -.02, mats.pavement, { bevelEnabled: false, cast: false });

const streetWash = makeMaterial(0x77908a, { roughness: 1, transparent: true, opacity: .17, depthWrite: false });
const washShape = makeFootprintShape((s) => {
  s.moveTo(-19, -10);
  s.lineTo(4, -2.15);
  s.lineTo(18, -2.15);
  s.lineTo(18, -10);
  s.closePath();
});
extrudeHorizontal(ground, washShape, .008, .004, streetWash, { bevelEnabled: false, cast: false });

const streetLines = new THREE.Group();
ground.add(streetLines);
for (let i = 0; i < 7; i++) {
  box(streetLines, [2.7, .012, .05], [-15 + i * 5.2, .025, -3.5 - i * .25], makeMaterial(0x8ca49a, { roughness: 1, transparent: true, opacity: .11 }), [0, -.05, 0], false, false);
}

const leftBuilding = new THREE.Group();
world.add(leftBuilding);
box(leftBuilding, [12.8, 6.8, 2.4], [-6.7, 3.35, 6.55], mats.brickDark);
box(leftBuilding, [12.8, 2.7, .34], [-6.7, 1.35, 5.22], mats.deepTeal);
box(leftBuilding, [12.8, .34, .48], [-6.7, 2.83, 5.08], mats.greenTrim);
box(leftBuilding, [12.8, .22, .48], [-6.7, 5.98, 5.08], mats.brickDark);

for (let i = 0; i < 4; i++) {
  const x = -11.0 + i * 2.75;
  box(leftBuilding, [1.15, 1.62, .08], [x, 4.72, 5.01], mats.windowDark, [0, 0, 0], false, false);
  box(leftBuilding, [1.28, .08, .12], [x, 5.56, 4.97], mats.greenTrim, [0, 0, 0], false, false);
  box(leftBuilding, [.08, 1.78, .12], [x - .62, 4.72, 4.97], mats.greenTrim, [0, 0, 0], false, false);
  box(leftBuilding, [.08, 1.78, .12], [x + .62, 4.72, 4.97], mats.greenTrim, [0, 0, 0], false, false);
}

const storefrontPositions = [-10.7, -7.4, -4.05, -1.15];
storefrontPositions.forEach((x, i) => {
  const w = i === 1 ? 2.2 : 2.65;
  box(leftBuilding, [w, 2.08, .09], [x, 1.42, 5.02], mats.windowDark, [0, 0, 0], false, false);
  box(leftBuilding, [w + .15, .12, .18], [x, 2.48, 4.98], mats.greenTrim, [0, 0, 0], false, false);
  if (i !== 1) box(leftBuilding, [w * .72, .42, .14], [x, .62, 4.95], mats.wood, [0, 0, 0], true, true);
});

box(leftBuilding, [1.95, 2.1, .12], [-7.35, 1.42, 4.96], mats.blackGreen, [0, 0, 0], false, false);
box(leftBuilding, [.08, 2.1, .14], [-7.35, 1.42, 4.88], mats.greenTrim, [0, 0, 0], false, false);
box(leftBuilding, [1.2, .55, .12], [-3.95, .64, 4.91], mats.woodLight, [0, 0, 0], true, true);
cylinder(leftBuilding, .08, .08, .33, [-4.3, 1.01, 4.82], mats.steel, [0, 0, 0], 10);
cylinder(leftBuilding, .06, .06, .26, [-3.95, .98, 4.82], mats.steel, [0, 0, 0], 10);

const diner = new THREE.Group();
world.add(diner);

const dinerShape = makeFootprintShape((s) => {
  s.moveTo(-1.9, .15);
  s.bezierCurveTo(-2.15, .75, -2.15, 1.7, -1.82, 2.38);
  s.bezierCurveTo(-1.45, 3.08, -.9, 3.72, -.15, 4.35);
  s.lineTo(11.3, 4.35);
  s.lineTo(11.3, .15);
  s.closePath();
});

extrudeHorizontal(diner, dinerShape, .18, .03, mats.greenTrim, { bevelSize: .04, bevelThickness: .035 });
extrudeHorizontal(diner, dinerShape, .2, 4.62, mats.blackGreen, { bevelSize: .035, bevelThickness: .035 });

box(diner, [11.5, 4.45, .18], [5.52, 2.42, 4.22], mats.deepTeal);
box(diner, [.2, 4.45, 4.22], [11.2, 2.42, 2.2], mats.yellowWall);
box(diner, [4.4, 3.45, .14], [8.9, 2.05, 4.08], mats.yellowWall, [0, 0, 0], false, true);
box(diner, [6.7, 3.45, .14], [3.1, 2.05, 4.08], mats.deepTeal, [0, 0, 0], false, true);

const frontCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(11.2, 0, .18),
  new THREE.Vector3(7.5, 0, .18),
  new THREE.Vector3(3.3, 0, .18),
  new THREE.Vector3(.1, 0, .23),
  new THREE.Vector3(-1.45, 0, .72),
  new THREE.Vector3(-1.88, 0, 1.72),
  new THREE.Vector3(-1.35, 0, 2.9),
  new THREE.Vector3(-.18, 0, 4.22)
], false, 'centripetal');

const curvePoints = frontCurve.getPoints(26);
for (let i = 0; i < curvePoints.length - 1; i++) {
  const a = curvePoints[i];
  const b = curvePoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], .22, .92, .18, mats.blackGreen, { gap: .018 });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 1.12, 3.06, .07, mats.glass, { gap: .026, cast: false, receive: false });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 4.16, .48, .19, mats.blackGreen, { gap: .018 });
}

const frameIndices = [0, 5, 10, 15, 19, 23, 26];
frameIndices.forEach((index) => {
  const p = curvePoints[index];
  box(diner, [.085, 3.48, .085], [p.x, 2.39, p.z], mats.greenTrim, [0, 0, 0], true, true);
});

const fasciaPoints = frontCurve.getPoints(16);
for (let i = 0; i < fasciaPoints.length - 1; i++) {
  const a = fasciaPoints[i];
  const b = fasciaPoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 4.64, .75, .32, mats.blackGreen, { gap: .012 });
}

const philliesTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#102b2b';
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(42,76,69,.75)');
  grad.addColorStop(.5, 'rgba(6,28,29,.4)');
  grad.addColorStop(1, 'rgba(1,12,14,.7)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b3a36c';
  ctx.font = '600 112px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '18px';
  ctx.fillText('PHILLIES', w * .5, h * .48);
  ctx.font = 'italic 32px Georgia';
  ctx.fillStyle = '#8f855d';
  ctx.fillText('America’s favorite', w * .86, h * .55);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(235,225,170,${Math.random() * .035})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 18 + 2, 1);
  }
}, 1600, 260);
signPlane(diner, philliesTexture, [8.7, 1.05], [5.9, 5.08, -.09], [0, 0, 0], false);

const fiveCentTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#182c28';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#73683f';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = '#a09258';
  ctx.font = 'italic 64px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Only 5¢', w / 2, h / 2);
}, 520, 180);
signPlane(diner, fiveCentTexture, [2.25, .78], [.15, 5.2, -.1], [0, 0, 0], false);

box(diner, [10.9, .14, 3.75], [5.75, 4.48, 2.18], mats.cream, [0, 0, 0], false, true);
box(diner, [10.2, .05, 1.12], [5.7, 4.39, 1.23], mats.glow, [0, 0, 0], false, false);

const counterShape = makeFootprintShape((s) => {
  s.moveTo(-.65, .92);
  s.bezierCurveTo(-1.18, 1.18, -1.18, 2.05, -.65, 2.36);
  s.bezierCurveTo(-.2, 2.62, .5, 2.72, 1.2, 2.72);
  s.lineTo(10.35, 2.72);
  s.lineTo(10.35, 1.02);
  s.lineTo(1.15, 1.02);
  s.bezierCurveTo(.5, 1.02, -.2, .86, -.65, .92);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(.05, 1.28);
  hole.bezierCurveTo(-.22, 1.45, -.2, 2.05, .14, 2.22);
  hole.bezierCurveTo(.4, 2.36, .86, 2.42, 1.34, 2.42);
  hole.lineTo(9.95, 2.42);
  hole.lineTo(9.95, 1.32);
  hole.lineTo(1.2, 1.32);
  hole.bezierCurveTo(.76, 1.32, .34, 1.23, .05, 1.28);
  hole.closePath();
  s.holes.push(hole);
});
extrudeHorizontal(diner, counterShape, .18, 1.44, mats.woodLight, { bevelSize: .06, bevelThickness: .04, curveSegments: 36 });

box(diner, [9.1, 1.27, .34], [5.65, .86, 1.22], mats.wood);
box(diner, [9.1, .12, .38], [5.65, 1.34, 1.02], mats.woodLight);
box(diner, [9.1, .12, .38], [5.65, .35, 1.02], mats.blackGreen);
for (let i = 0; i < 7; i++) {
  box(diner, [.08, .95, .04], [1.55 + i * 1.35, .83, .835], makeMaterial(0x4b241c, { roughness: .68 }), [0, 0, 0], true, true);
}

const curvedBasePoints = frontCurve.getPoints(7).slice(3, 7);
for (let i = 0; i < curvedBasePoints.length - 1; i++) {
  const a = curvedBasePoints[i];
  const b = curvedBasePoints[i + 1];
  panelAlong(diner, [a.x + 1.2, a.z + .62], [b.x + 1.2, b.z + .62], .32, 1.08, .3, mats.wood, { gap: .02 });
}

const stoolXs = [1.25, 2.85, 4.48, 6.12, 7.75, 9.35];
stoolXs.forEach((x, i) => {
  cylinder(diner, .22, .22, .08, [x, .82, .44 + (i % 2) * .03], mats.brass, [0, 0, 0], 24);
  cylinder(diner, .07, .08, .7, [x, .44, .44 + (i % 2) * .03], mats.brass, [0, 0, 0], 12);
  cylinder(diner, .18, .18, .035, [x, .09, .44 + (i % 2) * .03], mats.brass, [0, 0, 0], 18);
});

const serviceBack = new THREE.Group();
diner.add(serviceBack);
box(serviceBack, [7.2, .16, .72], [6.7, 1.15, 3.38], mats.woodLight);
box(serviceBack, [7.2, .95, .38], [6.7, .65, 3.55], mats.wood);

function coffeeUrn(x, z, scale = 1) {
  const urn = new THREE.Group();
  urn.position.set(x, 1.28, z);
  serviceBack.add(urn);
  cylinder(urn, .28 * scale, .24 * scale, 1.14 * scale, [0, .58 * scale, 0], mats.steel, [0, 0, 0], 24);
  cylinder(urn, .31 * scale, .31 * scale, .05 * scale, [0, .02 * scale, 0], mats.brass, [0, 0, 0], 24);
  cylinder(urn, .12 * scale, .27 * scale, .23 * scale, [0, 1.26 * scale, 0], mats.steel, [0, 0, 0], 24);
  sphere(urn, .06 * scale, [0, 1.42 * scale, 0], mats.brass, [1, .72, 1], 16);
  cylinder(urn, .035 * scale, .035 * scale, .32 * scale, [.31 * scale, .42 * scale, 0], mats.brass, [0, 0, Math.PI / 2], 10);
  sphere(urn, .06 * scale, [.47 * scale, .42 * scale, 0], mats.brass, [1, .7, 1], 12);
  return urn;
}

coffeeUrn(8.35, 3.2, 1.02);
coffeeUrn(9.18, 3.2, .95);

function cup(parent, position, scale = 1) {
  const g = new THREE.Group();
  g.position.set(...position);
  parent.add(g);
  cylinder(g, .08 * scale, .07 * scale, .13 * scale, [0, .065 * scale, 0], mats.white, [0, 0, 0], 18, true);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.055 * scale, .014 * scale, 8, 16, Math.PI * 1.5), mats.white);
  handle.position.set(.075 * scale, .072 * scale, 0);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);
  cylinder(g, .11 * scale, .11 * scale, .018 * scale, [0, -.008 * scale, 0], mats.white, [0, 0, 0], 20, true);
  return g;
}

[[1.1,1.68,1.38],[3.9,1.68,1.35],[5.28,1.68,1.35],[6.6,1.68,1.35],[8.0,1.68,1.35],[8.65,1.68,1.35]].forEach((p, i) => cup(diner, p, i === 0 ? .9 : 1));
for (let i = 0; i < 4; i++) {
  cylinder(diner, .025, .025, .15, [2.15 + i * .17, 1.72, 1.38], i % 2 ? mats.red : mats.brass, [0, 0, 0], 10);
}
box(diner, [.22, .18, .1], [2.82, 1.68, 1.38], mats.steel);
box(diner, [.11, .23, .1], [7.38, 1.7, 1.36], mats.white);

Object.assign(window.NH, { ground, leftBuilding, diner, serviceBack, frontCurve, curvePoints, coffeeUrn, cup });
