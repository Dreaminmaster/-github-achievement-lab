import * as THREE from 'three';

const fidelity = window.__SUBWAY_FIDELITY__;
if (fidelity?.group) {
  const station = fidelity.group;
  const foyer = new THREE.Group();
  foyer.name = 'connected-entry-concourse';
  station.add(foyer);

  const material = (color, roughness = .92, metalness = .02, options = {}) => new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    side: options.side ?? THREE.FrontSide,
    emissive: options.emissive ?? 0,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    depthWrite: options.depthWrite ?? true
  });
  const tile = material(0xbdb9aa, .97);
  const grout = material(0x85877c, .99);
  const green = material(0x536553, .95);
  const floor = material(0x77776c, .98);
  const floorDark = material(0x5e625d, .99);
  const ceiling = material(0x999a90, .98);
  const metal = material(0x303633, .42, .62);
  const metalDark = material(0x171c1b, .5, .5);
  const glass = material(0xaebeb8, .16, .02, { transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false });
  const glow = material(0xe2dfc8, .3, .01, { emissive: 0xe2dfc8, emissiveIntensity: 1.35 });
  const red = material(0x824434, .92);

  function box(parent, size, position, mat, rotation = [0,0,0], cast = true, receive = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat);
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
  }
  function cylinder(parent, radiusTop, radiusBottom, height, position, mat, rotation = [0,0,0], segments = 18) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat);
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function tiledWall(parent, width, height, depth, position) {
    const group = new THREE.Group(); group.position.set(...position); parent.add(group);
    box(group, [width,height,depth], [0,0,0], tile);
    for(let y=-height/2+.62;y<height/2;y+=.62) box(group,[width,.018,depth+.025],[0,y,.012],grout,[0,0,0],false,false);
    for(let x=-width/2+.82;x<width/2;x+=.82) box(group,[.018,height,depth+.025],[x,0,.012],grout,[0,0,0],false,false);
    return group;
  }

  // A broad entrance concourse extends the painting-facing station toward the viewer.
  // It connects directly to the open front edge at z=9 rather than placing the camera outside a wall.
  box(foyer,[14.4,.2,10.2],[0,-.12,13.8],floor,[0,0,0],false,true);
  box(foyer,[14.4,.24,10.2],[0,6.45,13.8],ceiling,[0,0,0],false,true);
  tiledWall(foyer,.28,6.55,10.2,[-7.05,3.18,13.8]);
  tiledWall(foyer,.28,6.55,10.2,[7.05,3.18,13.8]);
  box(foyer,[.3,1.0,10.0],[-6.88,.92,13.8],green,[0,0,0],false,true);
  box(foyer,[.3,1.0,10.0],[6.88,.92,13.8],green,[0,0,0],false,true);

  // The join between foyer and original concourse is a wide framed opening.
  box(foyer,[.32,6.35,.34],[-7.0,3.18,8.85],grout);
  box(foyer,[.32,6.35,.34],[7.0,3.18,8.85],grout);
  box(foyer,[14.35,.48,.34],[0,6.12,8.85],grout);
  box(foyer,[14.2,.16,.42],[0,.18,8.85],green);

  // Floor scoring continues through the opening so the two spaces read as one station.
  for(let z=9.2;z<=18.5;z+=1.55) box(foyer,[13.9,.018,.045],[0,.015,z],floorDark,[0,0,0],false,false);
  for(let x=-6.5;x<=6.5;x+=1.65) box(foyer,[.045,.018,9.7],[x,.016,13.8],floorDark,[0,0,0],false,false);

  // Lower suspended beams visually compress the entrance before it opens into Tooker's labyrinth.
  for(const z of [9.6,12.6,15.6,18.2]) {
    box(foyer,[13.7,.72,.82],[0,6.0,z],ceiling);
    box(foyer,[11.0,.1,.52],[0,5.55,z],glow,[0,0,0],false,false);
  }

  // A ticket booth, route map and newsstand make the extension operational rather than decorative.
  const booth = new THREE.Group(); booth.position.set(-4.75,0,15.0); foyer.add(booth);
  box(booth,[3.15,2.7,2.1],[0,1.35,0],tile);
  box(booth,[2.6,1.45,.08],[0,2.35,-1.08],glass,[0,0,0],false,false);
  box(booth,[2.75,.18,.58],[0,1.35,-1.18],metalDark);
  for(const x of [-.84,0,.84]) box(booth,[.07,1.42,.12],[x,2.35,-1.12],metal);
  box(booth,[2.3,.52,.08],[0,4.45,-1.12],green,[0,0,0],false,false);
  for(let x=-.75;x<=.75;x+=.25) box(booth,[.12,.07,.1],[x,4.45,-1.17],glow,[0,0,0],false,false);

  const newsstand = new THREE.Group(); newsstand.position.set(4.95,0,15.4); foyer.add(newsstand);
  box(newsstand,[3.0,1.2,1.55],[0,.6,0],metalDark);
  box(newsstand,[3.15,.16,1.7],[0,1.3,0],metal);
  for(let row=0;row<3;row++) for(let col=0;col<5;col++) {
    const color = (row+col)%3===0 ? red : (row+col)%3===1 ? green : tile;
    box(newsstand,[.46,.04,.58],[-1.0+col*.5,1.42+row*.18,-.35+row*.22],color,[-.22,0,0],false,false);
  }

  const routeMap = new THREE.Group(); routeMap.position.set(6.88,3.65,12.5); routeMap.rotation.y=-Math.PI/2; foyer.add(routeMap);
  box(routeMap,[3.2,2.2,.08],[0,0,0],metalDark,[0,0,0],false,false);
  box(routeMap,[2.9,1.9,.06],[0,0,-.08],tile,[0,0,0],false,false);
  for(const [y,color] of [[-.55,red],[-.15,green],[.25,metal],[.62,red]]){
    box(routeMap,[2.35,.055,.07],[0,y,-.13],color,[0,0,.12*y],false,false);
    for(const x of [-.9,-.3,.35,.9]) cylinder(routeMap,.06,.06,.03,[x,y,-.18],tile,[Math.PI/2,0,0],12);
  }

  // Benches, waste bin and maintenance cabinet complete the area from side angles.
  const bench = new THREE.Group(); bench.position.set(2.0,0,17.4); foyer.add(bench);
  box(bench,[4.4,.18,.72],[0,.75,0],red);
  box(bench,[4.4,.92,.16],[0,1.22,.3],red);
  for(const x of [-1.75,0,1.75]) box(bench,[.14,.75,.14],[x,.37,0],metalDark);
  cylinder(foyer,.5,.42,1.1,[-5.7,.55,10.8],metalDark,[0,0,0],18);
  box(foyer,[1.2,2.2,.55],[5.95,1.1,10.8],green);
  for(let y=.35;y<2.0;y+=.42) box(foyer,[.82,.045,.1],[5.95,y,10.5],metal,[0,0,0],false,false);

  // Ceiling pipes continue toward the original station and reinforce the multiple-depth reading.
  for(const x of [-5.8,-2.0,2.0,5.8]) {
    cylinder(foyer,.045,.045,9.4,[x,5.78,13.7],metalDark,[Math.PI/2,0,0],8);
    cylinder(foyer,.09,.09,.55,[x,5.78,9.25],metalDark,[0,0,0],10);
  }
}
