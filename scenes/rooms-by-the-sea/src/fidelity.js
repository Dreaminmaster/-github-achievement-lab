export function rebuildRooms(api) {
  const { THREE, scene, world, makeMaterial, box, cylinder, shapeMesh, isMobile } = api;
  for (const child of world.children) child.visible = false;

  const house = new THREE.Group();
  house.name = 'rooms-by-the-sea-fidelity-rebuild';
  world.add(house);

  const mats = {
    wall: makeMaterial(0xe9e2cc, { roughness: .96 }),
    wallShade: makeMaterial(0xd6cfb9, { roughness: .97 }),
    floor: makeMaterial(0xc8b76e, { roughness: .91 }),
    floorDark: makeMaterial(0x8b784b, { roughness: .95 }),
    trim: makeMaterial(0xc7c0aa, { roughness: .88 }),
    siding: makeMaterial(0xe3ddc8, { roughness: .96 }),
    roof: makeMaterial(0x565c58, { roughness: .99 }),
    roofEdge: makeMaterial(0x3f4642, { roughness: .99 }),
    door: makeMaterial(0xd8d3c2, { roughness: .88 }),
    brass: makeMaterial(0x76694e, { roughness: .34, metalness: .55 }),
    red: makeMaterial(0x8e3d31, { roughness: .86 }),
    wood: makeMaterial(0x6f4d32, { roughness: .8 }),
    woodDark: makeMaterial(0x443026, { roughness: .9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xb9d7dc, roughness: .1, transmission: .34, transparent: true, opacity: .32, thickness: .05, side: THREE.DoubleSide, depthWrite: false }),
    rock: makeMaterial(0x676d66, { roughness: 1, flatShading: true }),
    rockDark: makeMaterial(0x4f5955, { roughness: 1, flatShading: true }),
    sun: new THREE.MeshBasicMaterial({ color: 0xffefab, transparent: true, opacity: .28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  };

  // Main room: the painting-facing wall, threshold and floor stay exact while the camera now sits inside.
  box(house, [12.6, .22, 19], [0, -.12, 4], mats.floor, [0, 0, 0], false, true);
  box(house, [12.6, .22, 19], [0, 6.58, 4], mats.wallShade, [0, 0, 0], false, true);

  // The east wall is built around real window openings rather than being a solid slab with glass pasted on it.
  box(house, [.22, 2.25, 19], [6.2, 1.125, 4], mats.wallShade);
  box(house, [.22, 2.15, 19], [6.2, 5.625, 4], mats.wallShade);
  for (const [z, depth] of [[-4.3,2.4],[-.55,2.1],[3.85,2.1],[8.65,2.15],[12.35,2.3]]) {
    box(house, [.22, 2.25, depth], [6.2, 3.375, z], mats.wallShade);
  }

  // Sea-facing wall split around the large open door.
  box(house, [8.0, 6.7, .24], [-2.05, 3.25, -5.38], mats.wall);
  box(house, [1.15, 6.7, .24], [5.58, 3.25, -5.38], mats.wallShade);
  box(house, [3.2, 1.08, .24], [3.35, 6.02, -5.38], mats.wallShade);
  box(house, [.16, 5.55, .16], [1.72, 2.78, -5.2], mats.trim);
  box(house, [.16, 5.55, .16], [5.0, 2.78, -5.2], mats.trim);
  box(house, [3.42, .16, .16], [3.36, 5.52, -5.2], mats.trim);

  const seaDoor = new THREE.Group();
  seaDoor.position.set(5.0, 0, -5.18);
  seaDoor.rotation.y = -.38;
  house.add(seaDoor);
  box(seaDoor, [2.72, 5.34, .16], [1.34, 2.67, 0], mats.door);
  box(seaDoor, [.12, 5.08, .18], [.03, 2.67, 0], mats.trim);
  box(seaDoor, [2.46, .12, .18], [1.33, 5.2, 0], mats.trim);
  box(seaDoor, [2.46, .12, .18], [1.33, .13, 0], mats.trim);
  cylinder(seaDoor, .065, .065, .1, [.2, 2.55, -.12], mats.brass, [Math.PI / 2, 0, 0], 16);
  cylinder(seaDoor, .042, .042, .25, [.2, 2.55, -.25], mats.brass, [0, 0, Math.PI / 2], 12);

  // Left opening continues into a complete living room rather than ending at a crop.
  box(house, [.22, 6.7, 2.7], [-2.42, 3.25, 1.05], mats.wall);
  box(house, [.22, 6.7, 2.65], [-2.42, 3.25, -3.95], mats.wall);
  box(house, [3.65, 1.05, .22], [-4.28, 6.02, -.6], mats.wall);
  box(house, [.17, 5.55, .15], [-2.55, 2.78, -1.32], mats.trim);
  box(house, [3.55, .17, .15], [-4.3, 5.52, -1.32], mats.trim);

  const living = new THREE.Group();
  living.name = 'complete-living-room';
  house.add(living);
  box(living, [8.1, .2, 9.2], [-6.3, -.13, -1.0], mats.floorDark, [0, 0, 0], false, true);
  box(living, [8.1, 6.7, .22], [-6.3, 3.25, -5.48], mats.wallShade);
  box(living, [.22, 6.7, 9.2], [-10.25, 3.25, -1.0], mats.wallShade);
  box(living, [8.1, 6.7, .22], [-6.3, 3.25, 3.5], mats.wallShade);
  box(living, [7.8, .14, .12], [-6.25, .18, -5.34], mats.trim, [0,0,0], false, false);
  box(living, [.12, .14, 8.8], [-10.1, .18, -1.0], mats.trim, [0,0,0], false, false);

  const sofa = new THREE.Group(); sofa.position.set(-6.65, .12, -3.65); living.add(sofa);
  box(sofa, [3.05, .58, 1.15], [0, .48, 0], mats.red);
  box(sofa, [3.05, 1.22, .32], [0, 1.12, .38], mats.red, [-.08, 0, 0]);
  box(sofa, [.34, .82, 1.15], [-1.5, .66, 0], mats.red);
  box(sofa, [.34, .82, 1.15], [1.5, .66, 0], mats.red);
  for (const x of [-1.18, 1.18]) box(sofa, [.15, .52, .15], [x, .03, -.38], mats.woodDark);

  const bureau = new THREE.Group(); bureau.position.set(-8.3, .08, -.05); living.add(bureau);
  box(bureau, [1.85, 1.52, .72], [0, .8, 0], mats.wood);
  box(bureau, [2.02, .12, .82], [0, 1.6, 0], mats.woodDark);
  for (let row = 0; row < 3; row++) {
    box(bureau, [1.58, .36, .08], [0, .45 + row * .42, -.41], mats.woodDark);
    cylinder(bureau, .034, .034, .05, [0, .45 + row * .42, -.47], mats.brass, [Math.PI / 2, 0, 0], 10);
  }
  box(living, [1.75, 1.22, .11], [-7.25, 4.0, -5.34], mats.woodDark);
  box(living, [1.52, 1.0, .07], [-7.25, 4.0, -5.27], makeMaterial(0x67857a, { roughness: .92 }), [0, 0, 0], false, false);
  box(living, [1.45, .12, .9], [-4.75, .84, -2.15], mats.wood);
  for (const [x,z] of [[-5.25,-2.45],[-4.25,-2.45],[-5.25,-1.85],[-4.25,-1.85]]) cylinder(living,.06,.075,.78,[x,.4,z],mats.woodDark,[0,0,0],10);

  // A rear corridor and service room make the structure navigable from behind the painting.
  const rear = new THREE.Group(); rear.name = 'rear-house-extension'; house.add(rear);
  box(rear, [12.6, .2, 8.3], [0, -.12, 12.7], mats.floorDark, [0, 0, 0], false, true);
  box(rear, [.22, 6.7, 8.3], [-6.2, 3.25, 12.7], mats.wallShade);
  box(rear, [.22, 6.7, 8.3], [6.2, 3.25, 12.7], mats.wallShade);
  box(rear, [4.6, 6.7, .22], [-4.0, 3.25, 8.65], mats.wall);
  box(rear, [4.6, 6.7, .22], [4.0, 3.25, 8.65], mats.wall);
  box(rear, [3.0, 1.1, .22], [0, 6.0, 8.65], mats.wall);
  box(rear, [2.9, .16, .16], [0, 5.48, 8.48], mats.trim);
  box(rear, [.16, 5.5, .16], [-1.47, 2.75, 8.48], mats.trim);
  box(rear, [.16, 5.5, .16], [1.47, 2.75, 8.48], mats.trim);

  // Back wall includes a real service entrance instead of closing the extension with one solid box.
  box(rear, [8.2, 6.7, .22], [-2.2, 3.25, 16.75], mats.wallShade);
  box(rear, [1.25, 6.7, .22], [5.58, 3.25, 16.75], mats.wallShade);
  box(rear, [3.15, 1.15, .22], [3.35, 6.0, 16.75], mats.wallShade);
  const serviceDoor = new THREE.Group(); serviceDoor.position.set(1.82,0,16.56); serviceDoor.rotation.y=.52; rear.add(serviceDoor);
  box(serviceDoor,[2.9,5.35,.16],[1.45,2.68,0],mats.door);
  box(serviceDoor,[.13,5.45,.18],[0,2.72,0],mats.trim);
  cylinder(serviceDoor,.055,.055,.1,[.28,2.5,-.13],mats.brass,[Math.PI/2,0,0],12);

  // Built-in shelves, a narrow stair and a small table establish domestic logic.
  for (let y = .75; y <= 4.9; y += 1.05) box(rear, [2.8, .11, .72], [-4.55, y, 15.95], mats.wood);
  for (let i = 0; i < 9; i++) box(rear, [2.3, .24, .65], [3.9, .12 + i * .24, 15.7 - i * .58], i % 2 ? mats.floorDark : mats.wood);
  box(rear, [1.8, .12, 1.0], [0, 1.05, 13.2], mats.wood);
  cylinder(rear, .08, .1, .95, [-.65, .52, 12.85], mats.woodDark, [0, 0, 0], 12);
  cylinder(rear, .08, .1, .95, [.65, .52, 12.85], mats.woodDark, [0, 0, 0], 12);
  cylinder(rear, .08, .1, .95, [-.65, .52, 13.55], mats.woodDark, [0, 0, 0], 12);
  cylinder(rear, .08, .1, .95, [.65, .52, 13.55], mats.woodDark, [0, 0, 0], 12);

  // Real window holes, frames and exterior siding make the house legible from outside.
  for (const z of [1.2, 6.2, 11.2]) {
    box(house, [.08, 2.0, 2.15], [6.32, 3.4, z], mats.glass, [0, 0, 0], false, false);
    box(house, [.12, 2.25, .14], [6.38, 3.4, z - 1.12], mats.trim);
    box(house, [.12, 2.25, .14], [6.38, 3.4, z + 1.12], mats.trim);
    box(house, [.12, .14, 2.38], [6.38, 4.5, z], mats.trim);
    box(house, [.12, .14, 2.38], [6.38, 2.3, z], mats.trim);
    box(house, [.08, 2.0, .09], [6.4, 3.4, z], mats.trim, [0,0,0], false, false);
  }
  for (let y = .45; y < 6.4; y += .42) {
    box(house, [.06, .07, 21.8], [6.34, y, 5.3], mats.siding, [0, 0, 0], false, false);
    box(house, [.06, .07, 21.8], [-10.38, y, 5.3], mats.siding, [0, 0, 0], false, false);
  }

  // Proper gabled roof: two offset slopes meet at one ridge instead of crossing through the house.
  const leftRoof = box(house, [10.0, .28, 24.4], [-6.75, 7.45, 5.45], mats.roof, [0, 0, .185], false, true);
  const rightRoof = box(house, [10.0, .28, 24.4], [2.75, 7.45, 5.45], mats.roof, [0, 0, -.185], false, true);
  leftRoof.name = 'west-roof-slope'; rightRoof.name = 'east-roof-slope';
  box(house, [.34, .34, 24.65], [-2.0, 8.36, 5.45], mats.roofEdge, [0,0,0], false, true);
  box(house, [19.7, .22, .28], [-2.0, 6.58, -6.68], mats.roofEdge, [0,0,0], false, true);
  box(house, [19.7, .22, .28], [-2.0, 6.58, 17.58], mats.roofEdge, [0,0,0], false, true);
  box(house, [1.15, 3.0, 1.05], [3.45, 8.55, 10.7], mats.rockDark);
  box(house, [1.42, .22, 1.32], [3.45, 10.08, 10.7], mats.roofEdge);

  // Rock foundation follows the footprint but leaves the seaward threshold visually impossible, as in Hopper.
  box(house, [18.0, 3.8, 14], [-1.8, -2.0, 1.1], mats.rockDark, [0, 0, 0], false, true);
  const rocks = new THREE.Group(); house.add(rocks);
  for (let i = 0; i < 46; i++) {
    const material = i % 3 === 0 ? mats.rockDark : mats.rock;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.45 + (i % 5) * .14, 0), material);
    const angle = i * 1.87;
    rock.position.set(Math.cos(angle) * (7 + (i % 4)), -1.2 - (i % 5) * .45, -4.5 + Math.sin(angle) * 5.5);
    rock.rotation.set(angle * .31, angle * .17, angle * .23);
    rock.scale.set(1.4, .65 + (i % 3) * .25, 1.1);
    rocks.add(rock);
  }

  const oceanUniforms = {
    uTime: { value: 0 },
    uDeep: { value: new THREE.Color(0x176b87) },
    uLight: { value: new THREE.Color(0x3c9ab0) },
    uFoam: { value: new THREE.Color(0xaed9d9) }
  };
  const oceanMaterial = new THREE.ShaderMaterial({
    uniforms: oceanUniforms,
    vertexShader: `uniform float uTime;varying float vWave;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float w=sin(p.x*.34+uTime*.52)*.07+cos(p.y*.29-uTime*.37)*.05+sin((p.x+p.y)*.13+uTime*.24)*.025;p.z+=w;vWave=w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: `uniform vec3 uDeep;uniform vec3 uLight;uniform vec3 uFoam;varying float vWave;varying vec2 vUv;void main(){float h=smoothstep(.0,.82,vUv.y);vec3 c=mix(uLight,uDeep,h);float g=smoothstep(.075,.13,abs(vWave))*(1.0-h)*.28;c=mix(c,uFoam,g);gl_FragColor=vec4(c,1.0);}`,
    side: THREE.DoubleSide
  });
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(130, 120, isMobile ? 70 : 120, isMobile ? 70 : 120), oceanMaterial);
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(7, -.17, -62);
  ocean.receiveShadow = true;
  house.add(ocean);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x83b9c6, side: THREE.BackSide, fog: false }));
  sky.position.set(5, -.5, -45);
  house.add(sky);

  // Side deck, rear landing and stairs connect the building to the rocky site.
  box(house, [7.8, .24, 6.2], [9.8, -.02, -1.8], mats.wood, [0, 0, 0], false, true);
  for (const x of [6.5, 9.7, 12.9]) for (const z of [-4.5, 1.0]) cylinder(house, .09, .12, 3.6, [x, -1.8, z], mats.woodDark, [0, 0, 0], 12);
  box(house, [.18, 1.15, 6.4], [13.55, .62, -1.8], mats.woodDark);
  for (let z = -4.5; z <= 1.0; z += .7) box(house, [.12, 1.0, .12], [13.55, .62, z], mats.woodDark);
  box(house,[5.2,.24,2.6],[3.35,-.02,18.0],mats.wood,[0,0,0],false,true);
  for(let i=0;i<6;i++) box(house,[3.0,.22,.72],[3.35,-.15-i*.2,19.1+i*.48],i%2?mats.woodDark:mats.wood);
  for(const x of [1.0,5.7]) cylinder(house,.08,.1,2.8,[x,-1.35,18.0],mats.woodDark,[0,0,0],10);

  // Hard-edged Hopper sunlight layers.
  const sunLayers = new THREE.Group(); house.add(sunLayers);
  const wallSun = shapeMesh([[-6.0,.18],[1.75,.18],[1.75,5.98],[-1.2,5.98]], mats.sun, [0,0,-5.245]);
  world.remove(wallSun); sunLayers.add(wallSun);
  const floorSun = shapeMesh([[-6.0,5.9],[5.85,5.9],[4.5,-4.9],[-2.45,-4.9]], mats.sun, [0,.018,0], [-Math.PI/2,0,0]);
  world.remove(floorSun); sunLayers.add(floorSun);

  // Coastal continuation: islands, a distant headland and a low path beyond the original crop.
  for (let i = 0; i < 7; i++) {
    const island = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5 + i * .7, 1), mats.rockDark);
    island.position.set(-52 + i * 17, -2.7, -72 - (i % 2) * 9);
    island.scale.set(2.4, .34, 1.3);
    house.add(island);
  }
  for(let i=0;i<9;i++){
    const pathRock=new THREE.Mesh(new THREE.DodecahedronGeometry(.65+(i%3)*.18,0),i%2?mats.rock:mats.rockDark);
    pathRock.position.set(-10.5-i*.9,-.55-i*.08,12.5+i*.75);pathRock.scale.set(1.5,.45,1.1);house.add(pathRock);
  }

  scene.background = new THREE.Color(0xa9ced8);
  scene.fog = new THREE.Fog(0xa9ced8, 44, 145);

  return {
    group: house,
    sunLayers,
    update(elapsed, reducedMotion) {
      oceanUniforms.uTime.value = reducedMotion ? 0 : elapsed;
    }
  };
}
