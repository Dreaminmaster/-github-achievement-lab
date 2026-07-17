const {
  THREE, scene, world, mats, makeMaterial, box, cylinder, sphere, limbBetween,
  makeFootprintShape, extrudeHorizontal, panelAlong, canvasTexture, signPlane
} = window.NH;

for (const child of world.children) child.visible = false;

const district = new THREE.Group();
district.name = 'nighthawks-fidelity-rebuild';
world.add(district);

const street = makeMaterial(0x243d41, { roughness: .97 });
const streetSheen = makeMaterial(0x557876, { roughness: .7, transparent: true, opacity: .08, depthWrite: false });
const sidewalk = makeMaterial(0x829087, { roughness: .96 });
const mortar = makeMaterial(0x4d3027, { roughness: .98 });
const darkBrick = makeMaterial(0x2d201d, { roughness: .99 });
const shopGreen = makeMaterial(0x113d39, { roughness: .86 });
const blackGlass = makeMaterial(0x061416, { roughness: .42, metalness: .06 });
const warmWall = makeMaterial(0xd6cf8d, { roughness: .77, emissive: 0x554d22, emissiveIntensity: .13 });
const cream = makeMaterial(0xebe3af, { roughness: .78 });
const redWood = makeMaterial(0x79331f, { roughness: .58 });

// The painting is a corner intersection: a broad avenue fills the foreground and a
// narrower side street runs behind the rounded end of the diner.
box(district, [70, .16, 24], [0, -.12, -7.5], street, [0, 0, 0], false, true);
box(district, [12.5, .16, 52], [-8.8, -.115, 13], street, [0, 0, 0], false, true);
box(district, [28, .16, 14], [17, -.11, 7.5], street, [0, 0, 0], false, true);
box(district, [56, .012, 7.5], [2, -.025, -8.5], streetSheen, [0, 0, 0], false, false);
box(district, [7.2, .012, 40], [-9.1, -.023, 14], streetSheen, [0, 0, 0], false, false);

const dinerWalk = makeFootprintShape((s) => {
  s.moveTo(-3.7, 1.4); s.lineTo(14.6, 1.4); s.lineTo(14.6, 9.2);
  s.lineTo(-2.1, 9.2); s.lineTo(-4.5, 7.4); s.lineTo(-4.8, 4.6);
  s.quadraticCurveTo(-4.8, 2.2, -3.7, 1.4); s.closePath();
});
extrudeHorizontal(district, dinerWalk, .18, -.01, sidewalk, { bevelEnabled: false, cast: false });

const westWalk = makeFootprintShape((s) => {
  s.moveTo(-18.5, 3.6); s.lineTo(-12.5, 3.6); s.lineTo(-12.5, 28);
  s.lineTo(-18.5, 28); s.closePath();
});
extrudeHorizontal(district, westWalk, .17, -.015, sidewalk, { bevelEnabled: false, cast: false });

panelAlong(district, [-4.55, 1.35], [14.7, 1.35], -.02, .2, .13, mats.curb, { cast: false });
panelAlong(district, [-4.75, 4.2], [-4.75, 7.5], -.02, .2, .13, mats.curb, { cast: false });
panelAlong(district, [-12.45, 3.55], [-12.45, 28], -.02, .2, .13, mats.curb, { cast: false });

// Opposite storefront block: it faces the side street, not the foreground avenue.
const westBlock = new THREE.Group();
westBlock.position.set(-15.8, 0, 13.2);
district.add(westBlock);
box(westBlock, [6.1, 8.9, 23], [0, 4.42, 0], darkBrick);
box(westBlock, [.18, 2.65, 22.3], [3.12, 1.35, 0], shopGreen);
for (let z = -8.7; z <= 8.7; z += 4.35) {
  box(westBlock, [.09, 2.0, 3.15], [3.23, 1.48, z], blackGlass, [0, 0, 0], false, false);
  box(westBlock, [.13, .16, 3.45], [3.28, 2.58, z], mats.greenTrim);
  box(westBlock, [.13, .48, 2.65], [3.29, .45, z], mortar);
}
for (let z = -8.6; z <= 8.6; z += 3.45) {
  box(westBlock, [.08, 1.55, 1.45], [3.24, 5.7, z], mats.windowDark, [0, 0, 0], false, false);
}

// A low return building creates the dark upper-left corner visible in the painting.
const cornerBlock = new THREE.Group();
cornerBlock.position.set(-11.8, 0, 1.0);
district.add(cornerBlock);
box(cornerBlock, [9.6, 7.3, 5.0], [0, 3.62, 0], mortar);
box(cornerBlock, [9.6, 2.2, .16], [0, 1.15, -2.55], shopGreen);
for (const x of [-3.5, -.9, 1.8, 3.7]) box(cornerBlock, [1.65, 1.7, .08], [x, 1.42, -2.66], blackGlass, [0, 0, 0], false, false);

// Diner footprint and host masonry mass.
const diner = new THREE.Group();
diner.name = 'faithful-diner';
district.add(diner);
window.NH.diner = diner;

const footprint = makeFootprintShape((s) => {
  s.moveTo(-2.8, 2.45); s.lineTo(12.4, 2.45); s.lineTo(12.4, 7.25);
  s.lineTo(-2.0, 7.25); s.lineTo(-3.65, 6.25); s.lineTo(-4.05, 4.75);
  s.bezierCurveTo(-4.25, 3.55, -3.75, 2.65, -2.8, 2.45); s.closePath();
});
extrudeHorizontal(diner, footprint, .18, .07, mats.greenTrim, { bevelSize: .025, bevelThickness: .02, curveSegments: 36 });
extrudeHorizontal(diner, footprint, .22, 4.55, mats.blackGreen, { bevelSize: .025, bevelThickness: .02, curveSegments: 36 });

const host = new THREE.Group();
host.position.set(5.0, 0, 10.0);
district.add(host);
box(host, [15.8, 10.2, 6.3], [0, 5.05, 0], mortar);
box(host, [15.8, .35, 6.5], [0, 9.5, 0], darkBrick);
for (const x of [-6.1, -3.2, -.3, 2.6, 5.5]) {
  box(host, [1.25, 1.75, .08], [x, 6.3, -3.2], mats.windowDark, [0, 0, 0], false, false);
  box(host, [1.42, .1, .16], [x, 7.22, -3.26], darkBrick, [0, 0, 0], false, false);
}

box(diner, [14.4, 4.15, .16], [4.85, 2.36, 7.12], warmWall);
box(diner, [.16, 4.15, 4.55], [12.32, 2.36, 4.85], warmWall);

const glassCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(12.25, 0, 2.54), new THREE.Vector3(8.7, 0, 2.54),
  new THREE.Vector3(5.0, 0, 2.54), new THREE.Vector3(1.4, 0, 2.54),
  new THREE.Vector3(-1.25, 0, 2.7), new THREE.Vector3(-3.05, 0, 3.35),
  new THREE.Vector3(-3.75, 0, 4.55), new THREE.Vector3(-3.55, 0, 5.85),
  new THREE.Vector3(-2.2, 0, 7.05)
], false, 'centripetal');
const curvePoints = glassCurve.getPoints(48);
for (let i = 0; i < curvePoints.length - 1; i++) {
  const a = curvePoints[i], b = curvePoints[i + 1];
  panelAlong(diner, [a.x, a.z], [b.x, b.z], .25, .78, .16, mats.blackGreen, { gap: .006 });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 1.02, 3.12, .055, mats.glass, { gap: .012, cast: false, receive: false });
  panelAlong(diner, [a.x, a.z], [b.x, b.z], 4.08, .55, .18, mats.blackGreen, { gap: .006 });
}
for (const index of [0, 7, 14, 21, 28, 35, 41, 48]) {
  const p = curvePoints[index];
  box(diner, [.075, 3.58, .075], [p.x, 2.36, p.z], mats.greenTrim);
}

// The seamless glass wedge has no visible entrance, preserving the painting's exclusion.
const ceilingGlow = box(diner, [14.1, .08, 4.2], [4.65, 4.35, 4.8], mats.glow, [0, 0, 0], false, false);
ceilingGlow.material.emissiveIntensity = 1.35;

// Counter follows the window and curls inward at the left end.
const counter = new THREE.Group();
diner.add(counter);
box(counter, [12.4, .28, 1.05], [4.9, 1.54, 4.08], redWood);
box(counter, [12.6, .12, 1.16], [4.9, 1.75, 4.08], mats.woodLight);
box(counter, [1.2, .28, 3.0], [-1.0, 1.54, 4.95], redWood, [0, -.16, 0]);
box(counter, [1.32, .12, 3.1], [-1.0, 1.75, 4.95], mats.woodLight, [0, -.16, 0]);
for (const x of [-.1, 1.3, 2.7, 4.1, 5.5, 6.9, 8.3]) {
  cylinder(diner, .23, .23, .1, [x, 1.02, 3.15], mats.woodLight, [0, 0, 0], 20);
  cylinder(diner, .055, .07, .9, [x, .57, 3.15], mats.brass, [0, 0, 0], 12);
}

function person({ x, z, coat, hat, back = false, woman = false, server = false, yaw = 0 }) {
  const g = new THREE.Group(); g.position.set(x, .05, z); g.rotation.y = yaw; diner.add(g);
  const body = server ? mats.white : woman ? mats.red : coat;
  cylinder(g, .23, .32, .86, [0, 1.72, 0], body, [0, 0, woman ? -.03 : .02], 14);
  sphere(g, .235, [0, 2.3, .02], woman ? mats.skinLight : mats.skin, [.88, 1.08, .92], 20);
  if (woman) sphere(g, .26, [0, 2.37, -.05], mats.hairRed, [1, .78, .94], 18);
  else {
    cylinder(g, .32, .32, .035, [0, 2.57, 0], hat || body, [0, 0, 0], 20);
    cylinder(g, .2, .24, .17, [0, 2.66, 0], hat || body, [0, 0, 0], 16);
  }
  if (!back) {
    sphere(g, .022, [-.075, 2.34, .225], mats.shadow, [1, .5, .5], 8);
    sphere(g, .022, [.075, 2.34, .225], mats.shadow, [1, .5, .5], 8);
  }
  limbBetween(g, [-.2, 1.97, .04], [-.28, 1.58, .39], .075, body);
  limbBetween(g, [.2, 1.97, .04], [.25, 1.58, .39], .075, body);
  return g;
}
person({ x: -.7, z: 3.9, coat: mats.suit, back: true, yaw: .02 });
person({ x: 5.0, z: 3.88, coat: mats.navy, yaw: .03 });
person({ x: 6.15, z: 3.9, woman: true, yaw: .03 });
person({ x: 8.1, z: 4.9, server: true, yaw: Math.PI });

// Coffee equipment and restrained table detail.
box(diner, [1.3, 1.35, .6], [9.7, 2.42, 6.65], mats.steel);
for (const x of [9.35, 9.95]) cylinder(diner, .12, .15, .72, [x, 3.2, 6.45], mats.steel, [0, 0, 0], 16);
for (const x of [4.75, 5.25, 6.0, 6.55]) cylinder(diner, .09, .11, .16, [x, 1.91, 4.08], cream, [0, 0, 0], 18, false);

const signTexture = canvasTexture((ctx, w, h) => {
  ctx.fillStyle = '#0c2b2b'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#b9a86b'; ctx.font = '600 90px Georgia'; ctx.textAlign = 'center';
  ctx.fillText('PHILLIES', w / 2, h * .62);
}, 1000, 220);
signPlane(district, signTexture, [10.4, 1.65], [4.5, 7.35, 7.12], [0, 0, 0], true);

// Street continuation beyond the crop, aligned to the same intersection rather than arbitrary blocks.
for (let i = 0; i < 4; i++) {
  const z = 23 + i * 9;
  box(district, [6.2, 8 + (i % 2) * 2, 7.2], [-15.7, 4 + (i % 2), z], i % 2 ? darkBrick : mortar);
  box(district, [12 + i * 2, 8.5, 6], [10 + i * 7, 4.2, 16 + i * 8], i % 2 ? mats.brickDark : mats.brick);
}

Object.assign(window.NH, { fidelityDistrict: district, fidelityDiner: diner });
