const {
  THREE, world, mats, box, cylinder, sphere, makeFootprintShape, extrudeHorizontal,
  panelAlong, canvasTexture, signPlane, shapePlane, makeMaterial
} = window.NH;

const ground = new THREE.Group();
world.add(ground);

// The painting's spatial logic: a broad foreground avenue, a side street opening at the
// diner's rounded corner, a dark block across that side street, and the diner attached
// to a deeper masonry mass.
box(ground, [64, .16, 58], [0, -.15, 4], mats.street, [0, 0, 0], false, true);

const foregroundSheen = makeMaterial(0x6f8f8d, {
  roughness: .74,
  transparent: true,
  opacity: .09,
  depthWrite: false
});
shapePlane(ground, [
  [-23, -14], [24, -14], [21, 1.9], [-7.2, 1.9], [-23, -4.2]
], -.055, foregroundSheen);

const dinerSidewalkShape = makeFootprintShape((s) => {
  s.moveTo(-4.3, 1.7);
  s.lineTo(13.7, 1.7);
  s.lineTo(13.7, 8.6);
  s.lineTo(-2.9, 8.6);
  s.lineTo(-4.8, 6.4);
  s.lineTo(-4.8, 3.3);
  s.closePath();
});
extrudeHorizontal(ground, dinerSidewalkShape, .16, -.02, mats.pavement, {
  bevelEnabled: false,
  cast: false
});

const oppositeWalkShape = makeFootprintShape((s) => {
  s.moveTo(-22, 4.4);
  s.lineTo(-8.1, 4.4);
  s.lineTo(-8.1, 15.5);
  s.lineTo(-22, 15.5);
  s.closePath();
});
extrudeHorizontal(ground, oppositeWalkShape, .15, -.025, mats.pavement, {
  bevelEnabled: false,
  cast: false
});

const farWalkShape = makeFootprintShape((s) => {
  s.moveTo(14.1, 1.7);
  s.lineTo(25, 1.7);
  s.lineTo(25, 14.8);
  s.lineTo(14.1, 14.8);
  s.closePath();
});
extrudeHorizontal(ground, farWalkShape, .15, -.025, mats.pavement, {
  bevelEnabled: false,
  cast: false
});

panelAlong(ground, [-22, 4.35], [-8.05, 4.35], -.01, .18, .12, mats.curb, { cast: false });
panelAlong(ground, [-8.02, 4.35], [-8.02, 15.5], -.01, .18, .12, mats.curb, { cast: false });
panelAlong(ground, [-4.75, 1.65], [13.75, 1.65], -.01, .18, .12, mats.curb, { cast: false });
panelAlong(ground, [-4.75, 1.65], [-4.75, 6.4], -.01, .18, .12, mats.curb, { cast: false });

for (let i = 0; i < 8; i++) {
  box(
    ground,
    [3.1, .012, .045],
    [-18 + i * 5.4, -.047, -.5 - i * .06],
    makeMaterial(0x93aaa2, { roughness: 1, transparent: true, opacity: .09 }),
    [0, -.012, 0],
    false,
    false
  );
}
for (let i = 0; i < 6; i++) {
  box(
    ground,
    [.045, .012, 2.4],
    [-6.5 + i * .03, -.045, 5.7 + i * 4.1],
    makeMaterial(0x8ba09a, { roughness: 1, transparent: true, opacity: .065 }),
    [0, 0, 0],
    false,
    false
  );
}

const oppositeBlock = new THREE.Group();
world.add(oppositeBlock);
box(oppositeBlock, [13.4, 8.4, 5.6], [-15.2, 4.18, 10.4], mats.brickDark);
box(oppositeBlock, [13.4, 2.75, .35], [-15.2, 1.35, 7.48], mats.deepTeal);
box(oppositeBlock, [13.4, .32, .52], [-15.2, 2.83, 7.31], mats.greenTrim);
box(oppositeBlock, [13.4, .24, .48], [-15.2, 7.45, 7.34], mats.brickShadow);

const upperWindowXs = [-20.2, -17.2, -14.2, -11.2];
upperWindowXs.forEach((x, i) => {
  box(oppositeBlock, [1.32, 1.75, .08], [x, 5.55, 7.25], mats.windowDark, [0, 0, 0], false, false);
  box(oppositeBlock, [1.5, .09, .14], [x, 6.47, 7.20], mats.brick, [0, 0, 0], false, false);
  box(oppositeBlock, [.08, 1.92, .12], [x - .7, 5.55, 7.19], mats.greenTrim, [0, 0, 0], false, false);
  box(oppositeBlock, [.08, 1.92, .12], [x + .7, 5.55, 7.19], mats.greenTrim, [0, 0, 0], false, false);
  if (i === 0) box(oppositeBlock, [.045, 1.6, .07], [x, 5.55, 7.13], mats.greenTrim, [0, 0, 0], false, false);
});

const storefronts = [
  { x: -19.7, w: 2.3 },
  { x: -16.7, w: 2.45 },
  { x: -13.5, w: 2.5 },
  { x: -10.6, w: 2.05 }
];
storefronts.forEach(({ x, w }, index) => {
  box(oppositeBlock, [w, 2.08, .08], [x, 1.46, 7.22], mats.windowDark, [0, 0, 0], false, false);
  box(oppositeBlock, [w + .16, .13, .18], [x, 2.54, 7.17], mats.greenTrim);
  if (index !== 1) box(oppositeBlock, [w * .76, .42, .16], [x, .58, 7.14], mats.wood);
});
box(oppositeBlock, [1.72, 2.1, .12], [-16.7, 1.45, 7.12], mats.blackGreen);
box(oppositeBlock, [.08, 2.1, .14], [-16.7, 1.45, 7.02], mats.greenTrim);
box(oppositeBlock, [.3, 8.4, 8.2], [-8.35, 4.18, 11.7], mats.brickShadow);
for (let z = 9.1; z < 14.4; z += 2.25) {
  box(oppositeBlock, [.08, 1.45, 1.15], [-8.15, 5.55, z], mats.windowDark, [0, 0, 0], false, false);
}

const extension = new THREE.Group();
world.add(extension);
box(extension, [14, 9.5, 6], [19.8, 4.7, 11.8], mats.brickShadow);
box(extension, [10, 11, 5], [-3.2, 5.4, 19], mats.brickDark);
box(extension, [18, 7, 4], [10, 3.45, 22], mats.blackGreen);
for (let i = 0; i < 9; i++) {
  const x = 15.7 + (i % 3) * 3.3;
  const y = 2.5 + Math.floor(i / 3) * 2.55;
  box(extension, [1.35, 1.3, .07], [x, y, 8.72], mats.windowDark, [0, 0, 0], false, false);
}

const hostBuilding = new THREE.Group();
world.add(hostBuilding);
box(hostBuilding, [14.8, 8.2, 4.2], [5.0, 4.05, 8.9], mats.brick);
box(hostBuilding, [14.8, .28, 4.35], [5.0, 7.7, 8.9], mats.brickDark);
for (let x = -1; x <= 10.7; x += 2.65) {
  box(hostBuilding, [1.15, 1.55, .08], [x, 5.85, 6.73], mats.windowDark, [0, 0, 0], false, false);
  box(hostBuilding, [1.3, .09, .14], [x, 6.68, 6.67], mats.brickDark);
}

const diner = new THREE.Group();
world.add(diner);

const floorShape = makeFootprintShape((s) => {
  s.moveTo(-2.55, 2.65);
  s.lineTo(11.25, 2.65);
  s.lineTo(11.25, 6.72);
  s.lineTo(-2.55, 6.72);
  s.lineTo(-2.55, 5.05);
  s.bezierCurveTo(-2.55, 3.76, -1.72, 2.65, -.25, 2.65);
  s.closePath();
});
extrudeHorizontal(diner, floorShape, .18, .08, mats.greenTrim, { bevelSize: .035, bevelThickness: .03, curveSegments: 40 });
extrudeHorizontal(diner, floorShape, .18, 4.62, mats.blackGreen, { bevelSize: .025, bevelThickness: .025, curveSegments: 40 });
extrudeHorizontal(diner, floorShape, .08, 4.38, mats.cream, { bevelEnabled: false, cast: false, receive: true });

box(diner, [13.75, 4.25, .16], [4.35, 2.36, 6.62], mats.yellowWall);
box(diner, [.16, 4.25, 4.05], [11.17, 2.36, 4.64], mats.yellowWall);
box(diner, [4.25, 3.05, .12], [8.95, 2.0, 6.5], mats.yellowWall, [0, 0, 0], false, true);
box(diner, [7.4, 3.05, .12], [3.05, 2.0, 6.5], mats.deepTeal, [0, 0, 0], false, true);

const glassCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(11.15, 0, 2.72),
  new THREE.Vector3(8.3, 0, 2.72),
  new THREE.Vector3(5.2, 0, 2.72),
  new THREE.Vector3(2.0, 0, 2.72),
  new THREE.Vector3(-.25, 0, 2.72),
  new THREE.Vector3(-1.65, 0, 3.05),
  new THREE.Vector3(-2.35, 0, 3.9),
  new THREE.Vector3(-2.48, 0, 5.12),
  new THREE.Vector3(-2.48, 0, 6.42)
], false, 'centripetal');

const curvePoints = glassCurve.getPoints(36);
for (let i = 0; i < curvePoints.length - 1; i++) {
  const a = curvePoints[i];
  const b = curvePoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], .24, .82, .18, mats.blackGreen, { gap: .012 });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 1.04, 3.08, .065, mats.glass, { gap: .018, cast: false, receive: false });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 4.1, .52, .18, mats.blackGreen, { gap: .012 });
}
const mullionIndices = [0, 5, 10, 15, 20, 25, 29, 33, 36];
mullionIndices.forEach((index) => {
  const p = curvePoints[index];
  box(diner, [.075, 3.55, .075], [p.x, 2.36, p.z], mats.greenTrim);
});

const fasciaPoints = glassCurve.getPoints(24);
for (let i = 0; i < fasciaPoints.length - 1; i++) {
  const a = fasciaPoints[i];
  const b = fasciaPoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 4.58, .88, .3, mats.blackGreen, { gap: .01 });
}

const philliesTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#102a29';
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(50,78,67,.72)');
  grad.addColorStop(.48, 'rgba(8,31,30,.45)');
  grad.addColorStop(1, 'rgba(2,13,15,.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b3a36d';
  ctx.font = '600 108px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PHILLIES', w * .5, h * .48);
  ctx.font = 'italic 28px Georgia';
  ctx.fillStyle = '#817752';
  ctx.fillText('America’s favorite', w * .82, h * .76);
}, 1600, 260);
signPlane(diner, philliesTexture, [9.5, 1.05], [5.6, 5.02, 2.54], [0, 0, 0], false);

const sideSignTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#172d2a';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#75683f';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = '#a4935a';
  ctx.font = 'italic 60px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Only 5¢', w / 2, h / 2);
}, 520, 180);
signPlane(diner, sideSignTexture, [2.0, .72], [-2.62, 5.02, 5.12], [0, Math.PI / 2, 0], false);

box(diner, [12.9, .05, 3.0], [4.4, 4.34, 4.35], mats.glow, [0, 0, 0], false, false);
box(diner, [12.9, .05, 3.78], [4.4, .27, 4.62], mats.cream, [0, 0, 0], false, true);

const counterShape = makeFootprintShape((s) => {
  s.moveTo(-.95, 3.72);
  s.bezierCurveTo(-1.55, 3.88, -1.7, 4.65, -1.18, 5.08);
  s.bezierCurveTo(-.65, 5.5, .1, 5.62, .9, 5.62);
  s.lineTo(9.72, 5.62);
  s.lineTo(9.72, 4.05);
  s.lineTo(.72, 4.05);
  s.bezierCurveTo(.1, 4.05, -.48, 3.85, -.95, 3.72);
  s.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-.35, 4.12);
  hole.bezierCurveTo(-.7, 4.28, -.72, 4.72, -.4, 4.98);
  hole.bezierCurveTo(-.05, 5.23, .35, 5.3, .92, 5.3);
  hole.lineTo(9.38, 5.3);
  hole.lineTo(9.38, 4.36);
  hole.lineTo(.75, 4.36);
  hole.bezierCurveTo(.33, 4.36, -.02, 4.22, -.35, 4.12);
  hole.closePath();
  s.holes.push(hole);
});
extrudeHorizontal(diner, counterShape, .2, 1.38, mats.woodLight, { bevelSize: .055, bevelThickness: .04, curveSegments: 42 });
box(diner, [9.1, 1.15, .34], [5.15, .82, 4.2], mats.wood);
box(diner, [9.1, .12, .4], [5.15, 1.32, 4.0], mats.woodLight);
for (let i = 0; i < 7; i++) box(diner, [.075, .93, .04], [1.2 + i * 1.3, .8, 3.82], makeMaterial(0x4b241c, { roughness: .7 }));

const counterCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(.75, 0, 4.1), new THREE.Vector3(-.3, 0, 4.0),
  new THREE.Vector3(-1.05, 0, 4.25), new THREE.Vector3(-1.25, 0, 4.82),
  new THREE.Vector3(-.78, 0, 5.28), new THREE.Vector3(.2, 0, 5.45)
], false, 'centripetal');
const counterBasePoints = counterCurve.getPoints(12);
for (let i = 0; i < counterBasePoints.length - 1; i++) {
  const a = counterBasePoints[i];
  const b = counterBasePoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], .3, 1.05, .3, mats.wood, { gap: .018 });
}

const stoolPositions = [[-.9, 3.63], [.8, 3.55], [2.65, 3.54], [4.5, 3.54], [6.32, 3.54], [8.12, 3.54]];
stoolPositions.forEach(([x, z]) => {
  cylinder(diner, .22, .22, .08, [x, .82, z], mats.brass, [0, 0, 0], 24);
  cylinder(diner, .065, .078, .69, [x, .44, z], mats.brass, [0, 0, 0], 12);
  cylinder(diner, .18, .18, .035, [x, .09, z], mats.brass, [0, 0, 0], 18);
});

const serviceBack = new THREE.Group();
diner.add(serviceBack);
box(serviceBack, [7.3, .16, .72], [6.45, 1.15, 5.92], mats.woodLight);
box(serviceBack, [7.3, .95, .4], [6.45, .65, 6.12], mats.wood);
box(serviceBack, [3.1, 1.9, .12], [2.1, 2.0, 6.42], mats.deepTeal, [0, 0, 0], false, true);

function coffeeUrn(x, z, scale = 1) {
  const urn = new THREE.Group();
  urn.position.set(x, 1.23, z);
  serviceBack.add(urn);
  cylinder(urn, .27 * scale, .23 * scale, 1.12 * scale, [0, .58 * scale, 0], mats.steel, [0, 0, 0], 24);
  cylinder(urn, .31 * scale, .31 * scale, .05 * scale, [0, .02 * scale, 0], mats.brass, [0, 0, 0], 24);
  cylinder(urn, .12 * scale, .26 * scale, .22 * scale, [0, 1.25 * scale, 0], mats.steel, [0, 0, 0], 24);
  sphere(urn, .058 * scale, [0, 1.4 * scale, 0], mats.brass, [1, .72, 1], 16);
  cylinder(urn, .034 * scale, .034 * scale, .32 * scale, [.3 * scale, .43 * scale, 0], mats.brass, [0, 0, Math.PI / 2], 10);
  sphere(urn, .058 * scale, [.46 * scale, .43 * scale, 0], mats.brass, [1, .72, 1], 12);
}
coffeeUrn(7.45, 5.78, 1.02);
coffeeUrn(8.32, 5.78, .95);

function cup(parent, position, scale = 1) {
  const g = new THREE.Group();
  g.position.set(...position);
  parent.add(g);
  cylinder(g, .078 * scale, .068 * scale, .13 * scale, [0, .065 * scale, 0], mats.white, [0, 0, 0], 18);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.052 * scale, .013 * scale, 8, 16, Math.PI * 1.5), mats.white);
  handle.position.set(.073 * scale, .072 * scale, 0);
  handle.rotation.y = Math.PI / 2;
  g.add(handle);
  cylinder(g, .105 * scale, .105 * scale, .017 * scale, [0, -.008 * scale, 0], mats.white, [0, 0, 0], 20);
}
[[-.8, 1.65, 4.02], [2.5, 1.65, 4], [4.75, 1.65, 4], [5.95, 1.65, 4], [7.4, 1.65, 4], [8.25, 1.65, 4]].forEach((p, i) => cup(diner, p, i === 0 ? .92 : 1));
for (let i = 0; i < 4; i++) cylinder(diner, .024, .024, .15, [1.25 + i * .17, 1.69, 4], i % 2 ? mats.red : mats.brass, [0, 0, 0], 10);
box(diner, [.22, .18, .11], [2.05, 1.65, 4], mats.steel);
box(diner, [.11, .23, .11], [6.75, 1.68, 4], mats.white);

[[[-2.25, 3.18], [-.35, 2.76]], [[1, 2.74], [4.6, 2.74]], [[6, 2.74], [9.6, 2.74]]].forEach(([a, b], index) => {
  const band = panelAlong(diner, a, b, 1.35 + index * .22, .08, .018, mats.reflection, { cast: false, receive: false });
  band.rotation.z = -.2;
});

const warmSpill = new THREE.MeshBasicMaterial({ color: 0xe6dc95, transparent: true, opacity: .105, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
shapePlane(ground, [[-3.7, 1.58], [12.9, 1.58], [17.2, -4.8], [-10.5, -4.2]], -.038, warmSpill);
shapePlane(ground, [[-5, 2.2], [-4.9, 6.2], [-8.6, 8.8], [-8.4, 3.6]], -.036, new THREE.MeshBasicMaterial({ color: 0xd8ce8e, transparent: true, opacity: .065, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));

for (const [x, z] of [[-18.6, 5], [17.8, 3.1]]) {
  cylinder(world, .08, .1, 4.8, [x, 2.4, z], mats.blackGreen, [0, 0, 0], 12);
  box(world, [.45, .22, .28], [x, 4.72, z], mats.brass);
}
box(world, [1.25, .62, .55], [-13.2, .47, 5.25], mats.wood);
cylinder(world, .055, .055, .34, [-13.55, .95, 5.15], mats.steel, [0, 0, 0], 10);
cylinder(world, .045, .045, .28, [-13.2, .92, 5.15], mats.steel, [0, 0, 0], 10);

Object.assign(window.NH, { ground, oppositeBlock, hostBuilding, extension, diner, serviceBack, glassCurve, curvePoints, coffeeUrn, cup });
