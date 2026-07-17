export function rebuildLastSupper(api) {
  const { THREE, scene, world, makeMaterial, box, cylinder, sphere, limbBetween, canvasTexture, isMobile, renderer } = api;
  for (const child of world.children) child.visible = false;

  const hall = new THREE.Group();
  hall.name = 'last-supper-fidelity-rebuild';
  world.add(hall);

  const mats = {
    plaster: makeMaterial(0xb9aa8d, { roughness: .98, emissive: 0x2c2419, emissiveIntensity: .07 }),
    plasterShade: makeMaterial(0x7b6f5c, { roughness: .99 }),
    floor: makeMaterial(0x8f7b61, { roughness: .96 }),
    floorLine: makeMaterial(0x665746, { roughness: .98 }),
    stone: makeMaterial(0x776b59, { roughness: .95 }),
    beam: makeMaterial(0x4d392c, { roughness: .92 }),
    wood: makeMaterial(0x714b31, { roughness: .8 }),
    woodDark: makeMaterial(0x3e2b22, { roughness: .9 }),
    cloth: makeMaterial(0xc9bea8, { roughness: .94 }),
    ceramic: makeMaterial(0xb9b0a0, { roughness: .76 }),
    bread: makeMaterial(0xb3824e, { roughness: .94 }),
    wine: makeMaterial(0x5a211d, { roughness: .4, transparent: true, opacity: .82 }),
    gold: makeMaterial(0x8b6e42, { roughness: .4, metalness: .42 }),
    dark: makeMaterial(0x2c211c, { roughness: 1 }),
    window: new THREE.MeshPhysicalMaterial({ color: 0xb9c8bf, roughness: .18, transmission: .24, transparent: true, opacity: .26, thickness: .05, side: THREE.DoubleSide, depthWrite: false })
  };

  function quad(points, material, parent = hall) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setIndex([0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function panelBetween(parent, a, b, y, height, thickness, material) {
    const p1 = new THREE.Vector2(a[0], a[1]);
    const p2 = new THREE.Vector2(b[0], b[1]);
    const delta = p2.clone().sub(p1);
    const mesh = box(parent, [delta.length(), height, thickness], [(p1.x + p2.x) / 2, y + height / 2, (p1.y + p2.y) / 2], material, [0, -Math.atan2(delta.y, delta.x), 0]);
    return mesh;
  }

  // The real refectory: a long rectangular hall extending far behind the iconic view.
  box(hall, [21.2, .22, 36], [0, -.12, 6.0], mats.floor, [0, 0, 0], false, true);
  box(hall, [21.2, .24, 36], [0, 8.15, 6.0], mats.plasterShade, [0, 0, 0], false, true);
  box(hall, [.28, 8.2, 36], [-10.46, 4.0, 6.0], mats.plaster);
  box(hall, [.28, 8.2, 36], [10.46, 4.0, 6.0], mats.plaster);
  box(hall, [21.2, 8.2, .3], [0, 4.0, 23.85], mats.plasterShade);

  // Floor strips and wall benches make the room readable from every direction.
  for (let z = -10; z <= 23; z += 2.1) box(hall, [20.6, .018, .045], [0, .015, z], mats.floorLine, [0, 0, 0], false, false);
  for (let x = -9.2; x <= 9.2; x += 2.3) box(hall, [.045, .018, 35], [x, .016, 6], mats.floorLine, [0, 0, 0], false, false);
  for (const side of [-1, 1]) {
    box(hall, [.75, .28, 29], [side * 9.65, .78, 7.0], mats.woodDark);
    for (let z = -5.5; z <= 20; z += 3.2) box(hall, [.58, .9, .25], [side * 9.65, .42, z], mats.woodDark);
  }

  // Real left-wall daylight windows and right-wall monastery doors.
  for (const z of [-1.5, 5.2, 11.9, 18.2]) {
    box(hall, [.08, 3.1, 2.3], [-10.58, 4.35, z], mats.window, [0, 0, 0], false, false);
    box(hall, [.14, 3.35, .16], [-10.62, 4.35, z - 1.22], mats.stone);
    box(hall, [.14, 3.35, .16], [-10.62, 4.35, z + 1.22], mats.stone);
    box(hall, [.14, .16, 2.58], [-10.62, 5.94, z], mats.stone);
    box(hall, [.14, .16, 2.58], [-10.62, 2.76, z], mats.stone);
  }
  for (const z of [2.0, 10.0, 17.6]) {
    box(hall, [.14, 4.6, 2.3], [10.58, 2.3, z], mats.woodDark);
    box(hall, [.16, 4.35, 2.05], [10.47, 2.25, z], mats.wood);
  }

  // Leonardo's painted room is a physical perspective box nested inside the actual hall.
  const stage = new THREE.Group();
  stage.name = 'leonardo-perspective-box';
  hall.add(stage);
  const frontZ = -5.45;
  const backZ = -10.45;
  const frontHalf = 9.65;
  const backHalf = 6.35;
  const frontTop = 7.75;
  const backTop = 6.35;

  quad([[-frontHalf,.08,frontZ],[frontHalf,.08,frontZ],[backHalf,.08,backZ],[-backHalf,.08,backZ]], mats.floor, stage);
  quad([[-frontHalf,frontTop,frontZ],[-backHalf,backTop,backZ],[backHalf,backTop,backZ],[frontHalf,frontTop,frontZ]], mats.plasterShade, stage);
  quad([[-frontHalf,.08,frontZ],[-backHalf,.08,backZ],[-backHalf,backTop,backZ],[-frontHalf,frontTop,frontZ]], mats.plaster, stage);
  quad([[frontHalf,.08,frontZ],[frontHalf,frontTop,frontZ],[backHalf,backTop,backZ],[backHalf,.08,backZ]], mats.plaster, stage);

  // Back wall with three landscape windows, centered exactly on Christ and the vanishing point.
  box(stage, [12.9, 1.25, .28], [0, .68, backZ], mats.plaster);
  box(stage, [12.9, 1.15, .28], [0, 6.0, backZ], mats.plaster);
  const landscapeTexture = canvasTexture((ctx, w, h) => {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#98a9ad'); sky.addColorStop(.5, '#b8baa5'); sky.addColorStop(1, '#6a705b');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#70785f'; ctx.beginPath(); ctx.moveTo(0, h * .65);
    for (let x = 0; x <= w; x += 45) ctx.lineTo(x, h * (.5 + Math.sin(x * .018) * .06));
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.fillStyle = 'rgba(215,205,166,.5)'; ctx.fillRect(w * .42, h * .58, w * .16, h * .1);
  }, 1000, 650);
  const windowCenters = [-4.2, 0, 4.2];
  for (const x of windowCenters) {
    const landscape = new THREE.Mesh(new THREE.PlaneGeometry(2.55, 4.55), new THREE.MeshBasicMaterial({ map: landscapeTexture, side: THREE.DoubleSide, fog: false }));
    landscape.position.set(x, 3.65, backZ - .17); stage.add(landscape);
    box(stage, [2.72, .16, .18], [x, 5.98, backZ + .1], mats.stone);
    box(stage, [2.72, .16, .18], [x, 1.3, backZ + .1], mats.stone);
    box(stage, [.16, 4.84, .18], [x - 1.36, 3.64, backZ + .1], mats.stone);
    box(stage, [.16, 4.84, .18], [x + 1.36, 3.64, backZ + .1], mats.stone);
  }
  for (const [x, width] of [[-5.68,1.02],[-2.78,1.1],[2.78,1.1],[5.68,1.02]]) box(stage, [width, 4.62, .28], [x, 3.62, backZ], mats.plaster);

  // Perspective ceiling: every longitudinal line points to the central vanishing point.
  const railXs = [-9.1, -6.8, -4.55, -2.28, 0, 2.28, 4.55, 6.8, 9.1];
  for (const frontX of railXs) {
    const backX = frontX * (backHalf / frontHalf);
    panelBetween(stage, [frontX, frontZ], [backX, backZ], 7.46, .26, .18, mats.beam);
  }
  const depthStops = [0, .19, .38, .57, .75, .9, 1];
  for (const t of depthStops) {
    const z = THREE.MathUtils.lerp(frontZ, backZ, t);
    const half = THREE.MathUtils.lerp(frontHalf, backHalf, t);
    const y = THREE.MathUtils.lerp(frontTop, backTop, t) - .25;
    box(stage, [half * 2, .26, .18], [0, y, z], mats.beam);
  }

  // Side tapestries shrink and converge with the painted room.
  const tapestryColors = [0x6d4b3a, 0x40544d, 0x6e6042, 0x4e3e48];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const t = .14 + i * .205;
      const z = THREE.MathUtils.lerp(frontZ, backZ, t);
      const x = side * THREE.MathUtils.lerp(frontHalf, backHalf, t);
      const nextT = t + .15;
      const nextZ = THREE.MathUtils.lerp(frontZ, backZ, nextT);
      const nextX = side * THREE.MathUtils.lerp(frontHalf, backHalf, nextT);
      const panel = panelBetween(stage, [x, z], [nextX, nextZ], 2.6, 3.1 - i * .18, .09, makeMaterial(tapestryColors[(i + (side > 0 ? 1 : 0)) % tapestryColors.length], { roughness: .98 }));
      panel.position.y += .2;
    }
  }

  // Long table and trestles.
  const table = new THREE.Group(); stage.add(table);
  box(table, [16.9, .34, 2.32], [0, 2.25, -2.62], mats.wood);
  box(table, [17.18, .11, 2.58], [0, 2.48, -2.62], mats.cloth, [0, 0, 0], false, true);
  for (const x of [-6.25, 0, 6.25]) {
    box(table, [.42, 2.0, 1.52], [x, 1.15, -2.62], mats.woodDark);
    box(table, [2.2, .2, 1.76], [x, .18, -2.62], mats.woodDark);
  }
  box(stage, [16.0, .3, .82], [0, 1.05, -5.18], mats.woodDark);

  // Broad rhythm of plates, bread, wine, knives and folds.
  for (let i = 0; i < 13; i++) {
    const x = -7.15 + i * 1.19;
    cylinder(table, .32, .32, .04, [x, 2.58, -2.43 + (i % 2) * .15], mats.ceramic, [0, 0, 0], 24, false);
    if (i % 2 === 0) sphere(table, .17, [x + .27, 2.66, -2.72], mats.bread, [1.28, .55, .9], 14);
    cylinder(table, .075, .095, .24, [x - .27, 2.68, -2.76], mats.wine, [0, 0, 0], 18, false);
    box(table, [.42, .025, .025], [x + .08, 2.61, -2.88], mats.gold, [0, .18 * (i % 3 - 1), 0], false, false);
  }

  const skin = [makeMaterial(0xb88365, { roughness: .9, flatShading: true }), makeMaterial(0xc39778, { roughness: .9, flatShading: true })];
  const hair = [makeMaterial(0x34251f, { roughness: 1, flatShading: true }), makeMaterial(0x5a3b27, { roughness: 1, flatShading: true }), makeMaterial(0x71604d, { roughness: 1, flatShading: true })];

  function figure(config) {
    const g = new THREE.Group();
    g.position.set(config.x, .12, config.z);
    g.rotation.y = config.yaw || 0;
    g.scale.setScalar(config.scale || 1);
    stage.add(g);
    const robe = makeMaterial(config.robe, { roughness: .91, flatShading: true });
    const mantle = makeMaterial(config.mantle || new THREE.Color(config.robe).offsetHSL(.02, -.08, -.08).getHex(), { roughness: .93, flatShading: true });
    const skinMat = skin[config.skin || 0];
    const hairMat = hair[config.hair || 0];
    cylinder(g, .34, .5, 1.42, [0, 1.68, 0], robe, [0, 0, config.lean || 0], 12);
    box(g, [.92, .68, .22], [0, 1.9, .05], mantle, [0, 0, (config.lean || 0) * .6]);
    sphere(g, .29, [0, 2.64, 0], skinMat, [.88, 1.08, .92], 20);
    sphere(g, .31, [0, 2.75, -.08], hairMat, [1, .66, .96], 18);
    limbBetween(g, [-.31, 2.12, .02], config.left, .1, mantle);
    limbBetween(g, [.31, 2.12, .02], config.right, .1, mantle);
    sphere(g, .105, config.left, skinMat, [1, .78, 1], 12);
    sphere(g, .105, config.right, skinMat, [1, .78, 1], 12);
    if (config.christ) {
      box(g, [.84, .46, .18], [0, 1.62, .14], makeMaterial(0x385f77, { roughness: .91, flatShading: true }));
      const halo = new THREE.Mesh(new THREE.RingGeometry(.34, .39, 48), new THREE.MeshBasicMaterial({ color: 0xb9aa78, transparent: true, opacity: .14, side: THREE.DoubleSide }));
      halo.position.set(0, 2.68, -.16); g.add(halo);
    }
    return g;
  }

  // Four groups of three, with Judas pushed slightly forward and Christ isolated at the center.
  const configs = [
    {x:-7.25,z:-4.28,robe:0x485d6e,mantle:0x6d4937,lean:-.08,yaw:-.16,left:[-.86,1.62,.42],right:[.48,1.94,.28],hair:2},
    {x:-6.05,z:-4.15,robe:0x8b5f3d,mantle:0x53624e,lean:.1,yaw:.18,left:[-.68,2.12,.16],right:[.75,1.64,.5]},
    {x:-4.82,z:-4.34,robe:0x716548,mantle:0x79534b,lean:-.12,yaw:-.08,left:[-.82,1.7,.42],right:[.62,2.2,.14]},
    {x:-3.55,z:-4.12,robe:0x7a3d37,mantle:0x355d67,lean:.13,yaw:.14,left:[-.55,2.3,.08],right:[.8,1.66,.4]},
    {x:-2.35,z:-3.9,robe:0x413c37,mantle:0x5b4432,lean:-.1,yaw:-.18,left:[-.72,1.72,.36],right:[.64,2.04,.3],scale:.96,hair:0},
    {x:-1.18,z:-4.16,robe:0x8f6845,mantle:0x4c6254,lean:.04,yaw:.2,left:[-.6,2.1,.12],right:[.56,1.66,.48]},
    {x:1.18,z:-4.16,robe:0x5a7180,mantle:0x826142,lean:-.04,yaw:-.2,left:[-.56,1.66,.48],right:[.6,2.1,.12]},
    {x:2.38,z:-4.34,robe:0x826142,mantle:0x6b4a56,lean:.08,yaw:.16,left:[-.64,2.04,.3],right:[.72,1.72,.36]},
    {x:3.55,z:-4.12,robe:0x6b4a56,mantle:0x4d6458,lean:-.13,yaw:-.14,left:[-.8,1.66,.4],right:[.55,2.3,.08]},
    {x:4.82,z:-4.34,robe:0x4d6458,mantle:0x8e7046,lean:.12,yaw:.08,left:[-.62,2.2,.14],right:[.82,1.7,.42]},
    {x:6.05,z:-4.15,robe:0x8e7046,mantle:0x5a526b,lean:-.1,yaw:-.18,left:[-.75,1.64,.5],right:[.68,2.12,.16]},
    {x:7.25,z:-4.28,robe:0x5a526b,mantle:0x485d6e,lean:.08,yaw:.16,left:[-.48,1.94,.28],right:[.86,1.62,.42]}
  ];
  configs.forEach((config, index) => figure({ ...config, skin: index % 2, hair: config.hair ?? index % 3 }));
  figure({ x:0, z:-4.24, robe:0x355e7a, mantle:0x8e3b35, left:[-.84,1.6,.52], right:[.84,1.6,.52], scale:1.1, christ:true, hair:1 });

  // The south wall completes the actual room so the visitor can stand behind the scene and look forward.
  const crucifixionTexture = canvasTexture((ctx, w, h) => {
    ctx.fillStyle = '#8a735d'; ctx.fillRect(0, 0, w, h);
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#81796b'); sky.addColorStop(1, '#59493d');
    ctx.fillStyle = sky; ctx.fillRect(w * .08, h * .08, w * .84, h * .82);
    ctx.strokeStyle = '#33261f'; ctx.lineWidth = 22;
    for (const x of [w * .3, w * .5, w * .7]) {
      ctx.beginPath(); ctx.moveTo(x, h * .2); ctx.lineTo(x, h * .72); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - w * .06, h * .34); ctx.lineTo(x + w * .06, h * .34); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(53,38,31,.75)';
    for (let i = 0; i < 18; i++) {
      const x = w * (.12 + (i % 9) * .095); const y = h * (.7 + Math.floor(i / 9) * .08);
      ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 12, y + 14, 24, 48);
    }
  }, 1200, 700);
  const southMural = new THREE.Mesh(new THREE.PlaneGeometry(17.2, 7.1), new THREE.MeshStandardMaterial({ map: crucifixionTexture, roughness: .95, side: THREE.DoubleSide }));
  southMural.position.set(0, 4.05, 23.66); southMural.rotation.y = Math.PI; hall.add(southMural);
  box(hall, [18.0, .24, .3], [0, 7.72, 23.7], mats.stone);
  box(hall, [.24, 7.5, .3], [-9.05, 4.0, 23.7], mats.stone);
  box(hall, [.24, 7.5, .3], [9.05, 4.0, 23.7], mats.stone);

  // Small monastic details in the real hall extension.
  for (const z of [1.7, 8.5, 15.3]) {
    box(hall, [1.2, .14, .75], [8.9, 1.15, z], mats.wood);
    cylinder(hall, .06, .08, 1.02, [8.45, .56, z - .25], mats.woodDark, [0, 0, 0], 10);
    cylinder(hall, .06, .08, 1.02, [9.35, .56, z + .25], mats.woodDark, [0, 0, 0], 10);
  }

  scene.background = new THREE.Color(0x30251f);
  scene.fog = new THREE.Fog(0x30251f, 34, 120);

  return { group: hall, stage };
}
