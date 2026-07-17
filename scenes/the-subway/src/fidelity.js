export function rebuildSubway(api) {
  const { THREE, scene, world, makeMaterial, box, cylinder, sphere, limbBetween, isMobile } = api;
  for (const child of world.children) child.visible = false;

  const station = new THREE.Group();
  station.name = 'the-subway-fidelity-rebuild';
  world.add(station);

  const mats = {
    tile: makeMaterial(0xc7c3b2, { roughness: .96, emissive: 0x31322d, emissiveIntensity: .035 }),
    tileShade: makeMaterial(0x8c8c7f, { roughness: .98 }),
    green: makeMaterial(0x586957, { roughness: .94 }),
    floor: makeMaterial(0x8b8879, { roughness: .98 }),
    floorDark: makeMaterial(0x666962, { roughness: .99 }),
    ceiling: makeMaterial(0xa7a69a, { roughness: .98 }),
    metal: makeMaterial(0x303633, { roughness: .4, metalness: .65 }),
    metalDark: makeMaterial(0x171c1b, { roughness: .46, metalness: .52 }),
    light: makeMaterial(0xdad6b8, { roughness: .34, emissive: 0xdad6b8, emissiveIntensity: 1.25 }),
    rust: makeMaterial(0x8b4b35, { roughness: .93, flatShading: true }),
    ochre: makeMaterial(0x9a7449, { roughness: .93, flatShading: true }),
    red: makeMaterial(0x934737, { roughness: .93, flatShading: true }),
    blueGrey: makeMaterial(0x53616a, { roughness: .94, flatShading: true }),
    charcoal: makeMaterial(0x3e4541, { roughness: .95, flatShading: true }),
    olive: makeMaterial(0x66705a, { roughness: .95, flatShading: true }),
    skin: makeMaterial(0xc69a7c, { roughness: .92, flatShading: true }),
    skinPale: makeMaterial(0xd2af95, { roughness: .92, flatShading: true }),
    hair: makeMaterial(0x554239, { roughness: 1, flatShading: true }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xb7c4bc, roughness: .18, transmission: .22, transparent: true, opacity: .3, side: THREE.DoubleSide, depthWrite: false }),
    shadow: makeMaterial(0x303632, { roughness: 1, transparent: true, opacity: .2, depthWrite: false })
  };

  function tiledWall(parent, size, position, rotation = [0,0,0], base = mats.tile) {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.set(...rotation); parent.add(group);
    box(group, size, [0,0,0], base);
    const [w,h,d] = size;
    if (d < .5) {
      for (let y = -h/2 + .62; y < h/2; y += .62) box(group, [w, .018, d + .025], [0,y,d > 0 ? .012 : 0], mats.tileShade, [0,0,0], false, false);
      for (let x = -w/2 + .82; x < w/2; x += .82) box(group, [.018,h,d + .025], [x,0,d > 0 ? .012 : 0], mats.tileShade, [0,0,0], false, false);
    }
    return group;
  }

  function portalFrame(parent, position, rotationY, width, height = 6.2) {
    const frame = new THREE.Group(); frame.position.set(...position); frame.rotation.y = rotationY; parent.add(frame);
    box(frame,[.28,height,.34],[-width/2, height/2, 0],mats.tileShade);
    box(frame,[.28,height,.34],[width/2, height/2, 0],mats.tileShade);
    box(frame,[width+.28,.42,.34],[0,height-.18,0],mats.tileShade);
    box(frame,[width+.6,.16,.42],[0,.18,0],mats.green);
    return frame;
  }

  function createGate(parent, position, rotationY, width, height = 5.7, spacing = .52) {
    const gate = new THREE.Group(); gate.position.set(...position); gate.rotation.y = rotationY; parent.add(gate);
    box(gate, [width,.14,.16], [0,height,0], mats.metalDark);
    box(gate, [width,.14,.16], [0,.08,0], mats.metalDark);
    for (let x = -width/2; x <= width/2; x += spacing) box(gate,[.055,height,.055],[x,height/2,0],mats.metal,[0,0,0],true,false);
    for (let y = .82; y < height; y += 1.05) box(gate,[width,.045,.045],[0,y,0],mats.metal,[0,0,0],true,false);
    return gate;
  }

  function createPassage({ position, rotationY = 0, width = 5.8, length = 20, height = 6.25, lights = true }) {
    const passage = new THREE.Group(); passage.position.set(...position); passage.rotation.y = rotationY; station.add(passage);
    box(passage,[width,.18,length],[0,-.08,-length/2],mats.floorDark,[0,0,0],false,true);
    tiledWall(passage,[.24,height,length],[-width/2, height/2, -length/2]);
    tiledWall(passage,[.24,height,length],[width/2, height/2, -length/2]);
    box(passage,[width,.22,length],[0,height+.02,-length/2],mats.ceiling,[0,0,0],false,true);
    box(passage,[.28,1.0,length],[-width/2+.18,.92,-length/2],mats.green,[0,0,0],false,true);
    box(passage,[.28,1.0,length],[width/2-.18,.92,-length/2],mats.green,[0,0,0],false,true);
    if (lights) for (let z=-2; z>-length+2; z-=3.5) box(passage,[2.9,.11,.52],[0,height-.18,z],mats.light,[0,0,0],false,false);
    for(let z=-3;z>-length+2;z-=5.2) cylinder(passage,.055,.055,width-.7,[-width/2+.35,height-.55,z],mats.metalDark,[0,0,Math.PI/2],8,false);
    return passage;
  }

  function createStairs(parent, position, rotationY, width = 3.8, steps = 12) {
    const stairs = new THREE.Group(); stairs.position.set(...position); stairs.rotation.y = rotationY; parent.add(stairs);
    for (let i=0;i<steps;i++) box(stairs,[width,.27,.7],[0,.135+i*.26,-i*.61],i%2?mats.floor:mats.tileShade);
    for (const side of [-1,1]) {
      box(stairs,[.16,3.15,steps*.64],[side*(width/2+.18),1.55,-steps*.305],mats.metalDark);
      for (let i=0;i<steps;i+=2) box(stairs,[.055,1.45,.055],[side*(width/2+.22),1.55,-i*.61],mats.metal);
    }
    return stairs;
  }

  // The painted concourse is shallow and wide, but its five exits are now physically open.
  box(station,[25,.2,25],[0,-.12,-3.5],mats.floor,[0,0,0],false,true);
  box(station,[25,.25,25],[0,6.45,-3.5],mats.ceiling,[0,0,0],false,true);

  // Left wall: opening at z=5.1 for the transverse passage.
  tiledWall(station,[.28,6.55,18.7],[-12.35,3.18,-6.5]);
  tiledWall(station,[.28,6.55,1.7],[-12.35,3.18,8.15]);
  // Right wall: opening around z=-1.8.
  tiledWall(station,[.28,6.55,11.6],[12.35,3.18,-10.05]);
  tiledWall(station,[.28,6.55,8.6],[12.35,3.18,4.7]);
  // Rear wall: broad central opening; diagonal passages slip behind the two side blocks.
  tiledWall(station,[9.5,6.55,.28],[-7.75,3.18,-15.85]);
  tiledWall(station,[9.5,6.55,.28],[7.75,3.18,-15.85]);

  // Green dado follows the segmented walls and stops at every doorway.
  box(station,[.32,1.0,18.5],[-12.18,.92,-6.55],mats.green,[0,0,0],false,true);
  box(station,[.32,1.0,1.55],[-12.18,.92,8.2],mats.green,[0,0,0],false,true);
  box(station,[.32,1.0,11.45],[12.18,.92,-10.05],mats.green,[0,0,0],false,true);
  box(station,[.32,1.0,8.45],[12.18,.92,4.75],mats.green,[0,0,0],false,true);

  portalFrame(station,[-12.18,0,5.1],Math.PI/2,4.8);
  portalFrame(station,[12.18,0,-1.8],-Math.PI/2,4.8);
  portalFrame(station,[0,0,-15.68],0,5.8);

  for (let z=-15;z<=8;z+=1.65) box(station,[24.5,.018,.045],[0,.015,z],mats.floorDark,[0,0,0],false,false);
  for (let x=-11.5;x<=11.5;x+=1.72) box(station,[.045,.018,24.5],[x,.016,-3.5],mats.floorDark,[0,0,0],false,false);

  // Specific columns from the painting, leaving the middle visually open but trapped.
  const columnPositions = [[-5.15,-3.1],[-5.15,4.8],[4.45,-4.8],[4.45,3.1],[8.75,-9.8],[-8.8,-10.2]];
  for (const [x,z] of columnPositions) {
    const g = new THREE.Group(); g.position.set(x,0,z); station.add(g);
    tiledWall(g,[1.08,6.4,1.08],[0,3.2,0]);
    box(g,[1.13,1.0,1.13],[0,.92,0],mats.green);
    box(g,[1.22,.18,1.22],[0,5.65,0],mats.tileShade);
  }
  for (const z of [-10.2,-4.8,3.15]) box(station,[20,.82,1.0],[0,6.02,z],mats.ceiling);

  // Left-side narrow cubicles: figures are enclosed like telephone users or prisoners.
  const booths = new THREE.Group(); booths.position.set(-8.55,0,-2.2); station.add(booths);
  for (let i=0;i<3;i++) {
    const z = 3.5 - i*3.35;
    tiledWall(booths,[3.8,6.2,.22],[0,3.1,z-1.65]);
    tiledWall(booths,[.22,6.2,3.3],[-1.9,3.1,z]);
    tiledWall(booths,[.22,6.2,3.3],[1.9,3.1,z]);
    box(booths,[3.8,.22,3.3],[0,6.12,z],mats.ceiling);
    box(booths,[3.1,.15,.65],[0,1.25,z-1.38],mats.metalDark);
    box(booths,[.38,.58,.18],[-.85,1.7,z-1.46],mats.metal);
    box(booths,[2.9,3.6,.06],[0,3.25,z+1.58],mats.glass,[0,0,0],false,false);
    createGate(booths,[1.72,.02,z],Math.PI/2,3.1,5.5,.58);
  }

  // Right foreground cage and turnstile zone dominates the original composition.
  const cage = new THREE.Group(); cage.position.set(7.3,0,1.5); station.add(cage);
  createGate(cage,[0,0,0],0,7.0,5.8,.5);
  createGate(cage,[-3.45,0,-3.15],Math.PI/2,6.3,5.8,.5);
  createGate(cage,[3.45,0,-3.15],Math.PI/2,6.3,5.8,.5);
  createGate(cage,[0,0,-6.3],0,7.0,5.8,.5);

  function turnstile(parent,x,z,rotationY=0) {
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotationY;parent.add(g);
    cylinder(g,.18,.22,1.35,[0,.68,0],mats.metalDark,[0,0,0],16);
    for(let i=0;i<3;i++){
      const arm=new THREE.Group();arm.rotation.y=i*Math.PI*2/3;g.add(arm);
      cylinder(arm,.045,.045,1.25,[.55,1.18,0],mats.metal,[0,0,Math.PI/2],10);
    }
    box(g,[.62,.32,.62],[0,1.65,0],mats.tileShade);
  }
  for (const x of [-2.2,-.75,.7,2.15]) turnstile(cage,x,-1.1);

  // Multiple competing vanishing directions: central, left diagonal, right diagonal and transverse.
  createPassage({ position:[0,0,-12.7], rotationY:0, width:5.6, length:27 });
  createPassage({ position:[-4.9,0,-9.2], rotationY:.58, width:5.3, length:23 });
  createPassage({ position:[5.0,0,-8.0], rotationY:-.61, width:5.2, length:24 });
  createPassage({ position:[-10.1,0,5.1], rotationY:Math.PI/2, width:4.8, length:20 });
  createPassage({ position:[10.0,0,-1.8], rotationY:-Math.PI/2, width:4.8, length:22 });
  createStairs(station,[-5.8,.02,-13.4],.06,4.1,13);
  createStairs(station,[9.0,.02,-5.4],-Math.PI/2,3.7,11);

  // Fluorescent fixtures are lower and fragmented rather than a generic modern grid.
  for (const [x,z,w] of [[0,5.4,6.8],[-2.8,.4,4.4],[3.1,-2.0,4.6],[0,-8.6,5.8],[-8.4,1.4,2.8],[8.0,-8.8,3.0]]) {
    box(station,[w,.1,.48],[x,6.23,z],mats.light,[0,0,0],false,false);
  }

  // Ticket window, benches, clock, ventilation and maintenance details complete the station logic.
  const ticket = new THREE.Group(); ticket.position.set(-1.0,0,6.65); station.add(ticket);
  box(ticket,[4.2,2.65,.3],[0,1.35,0],mats.tileShade);
  box(ticket,[3.55,1.55,.08],[0,2.45,-.18],mats.glass,[0,0,0],false,false);
  box(ticket,[3.9,.18,.55],[0,1.35,-.25],mats.metalDark);
  for(const x of [-1.15,0,1.15]) box(ticket,[.08,1.5,.12],[x,2.45,-.22],mats.metal);
  for(const [x,z,rot] of [[-2.7,5.55,0],[2.65,-7.2,Math.PI],[9.8,5.4,-Math.PI/2]]){
    const bench=new THREE.Group();bench.position.set(x,0,z);bench.rotation.y=rot;station.add(bench);
    box(bench,[3.2,.18,.68],[0,.72,0],mats.wood||mats.rust);
    box(bench,[3.2,.85,.16],[0,1.2,.28],mats.rust);
    for(const bx of [-1.25,1.25]) box(bench,[.14,.72,.14],[bx,.35,0],mats.metalDark);
  }
  const clock=new THREE.Group();clock.position.set(-4.45,4.65,4.05);station.add(clock);
  cylinder(clock,.58,.58,.12,[0,0,0],mats.tileShade,[Math.PI/2,0,0],32,false);
  cylinder(clock,.49,.49,.13,[0,0,-.03],mats.light,[Math.PI/2,0,0],32,false);
  box(clock,[.04,.34,.04],[0,.11,-.13],mats.metalDark,[0,0,-.25],false,false);
  box(clock,[.04,.24,.04],[.09,-.03,-.14],mats.metalDark,[0,0,1.0],false,false);
  for(const x of [-9.5,-2.8,3.7,9.4]) cylinder(station,.055,.055,19,[x,5.82,-3.4],mats.metalDark,[Math.PI/2,0,0],8,false);
  for(const [x,z] of [[-10.9,-8.2],[10.9,5.8],[2.8,-14.9]]){
    box(station,[1.7,.9,.12],[x,4.8,z],mats.metalDark,[0,0,0],false,false);
    for(let k=-.55;k<=.55;k+=.22) box(station,[.08,.65,.14],[x+k,4.8,z-.02],mats.tileShade,[0,0,0],false,false);
  }

  const figures=[];
  function figure({ position, coat=mats.rust, dress=null, rotationY=0, scale=1, hat=false, bag=false, central=false, gaze=0, pose='closed' }) {
    const person=new THREE.Group();person.position.set(...position);person.rotation.y=rotationY;person.scale.setScalar(scale);station.add(person);
    const skin=central?mats.skinPale:mats.skin;const body=dress||coat;
    cylinder(person,.34,.48,1.7,[0,1.67,0],body,[0,0,central?-.02:.02],12);
    box(person,[.86,1.68,.3],[0,1.68,.04],coat);
    sphere(person,.29,[0,2.82,0],skin,[.86,1.1,.92],20);
    sphere(person,.31,[0,2.94,-.06],mats.hair,[1,.62,.96],18);
    sphere(person,.025,[-.085+gaze,2.86,.255],mats.metalDark,[1,.5,.5],9);
    sphere(person,.025,[.085+gaze,2.86,.255],mats.metalDark,[1,.5,.5],9);
    box(person,[.13,.022,.012],[0,2.7,.267],mats.rust,[0,0,-.06],false,false);
    if(hat){cylinder(person,.37,.37,.04,[0,3.11,-.02],coat,[0,0,0],24);cylinder(person,.23,.28,.2,[0,3.21,-.02],coat,[0,0,0],18);}
    const left=pose==='frozen'?[-.14,1.5,.4]:pose==='phone'?[-.04,2.55,.22]:[-.38,1.48,.25];
    const right=pose==='frozen'?[.14,1.46,.41]:pose==='phone'?[.28,1.62,.22]:[.38,1.52,.25];
    limbBetween(person,[-.28,2.15,.02],left,.09,coat);limbBetween(person,[.28,2.15,.02],right,.09,coat);
    sphere(person,.1,left,skin,[1,.75,1],12);sphere(person,.1,right,skin,[1,.75,1],12);
    limbBetween(person,[-.18,.9,0],[-.2,.12,.04],.12,coat);limbBetween(person,[.18,.9,0],[.2,.12,.04],.12,coat);
    box(person,[.38,.12,.72],[-.22,.06,.2],mats.metalDark);box(person,[.38,.12,.72],[.22,.06,.2],mats.metalDark);
    if(bag){box(person,[.62,.78,.18],[.62,1.18,.08],mats.metalDark);cylinder(person,.03,.03,.62,[.62,1.73,.08],mats.metalDark,[0,0,Math.PI/2],8);}
    figures.push(person);return person;
  }

  const centralWoman=figure({position:[0,.02,2.25],coat:mats.blueGrey,dress:mats.red,central:true,scale:1.14,rotationY:-.02,pose:'frozen'});
  figure({position:[-2.05,.04,1.4],coat:mats.rust,hat:true,bag:true,rotationY:.1,scale:1.04,gaze:-.016});
  figure({position:[1.65,.04,.95],coat:mats.ochre,hat:true,rotationY:-.1,scale:1.04,gaze:.018});
  figure({position:[3.35,.04,1.55],coat:mats.rust,bag:true,rotationY:-.42,scale:.98});
  figure({position:[6.55,.04,2.4],coat:mats.charcoal,rotationY:-.58,scale:.94});
  figure({position:[-5.55,.04,.15],coat:mats.ochre,rotationY:.68,scale:.9});
  figure({position:[-3.8,.04,-4.3],coat:mats.red,rotationY:.08,scale:.78});
  figure({position:[4.65,.04,-3.65],coat:mats.blueGrey,hat:true,rotationY:-.28,scale:.82});
  figure({position:[8.5,.04,-6.1],coat:mats.rust,rotationY:-.82,scale:.72});
  figure({position:[1.0,.04,-11.0],coat:mats.ochre,hat:true,scale:.66});
  figure({position:[-8.55,.04,1.3],coat:mats.charcoal,rotationY:Math.PI,scale:.88,pose:'phone'});
  figure({position:[-8.55,.04,-2.05],coat:mats.olive,rotationY:Math.PI,scale:.84,pose:'phone'});
  figure({position:[-8.55,.04,-5.4],coat:mats.rust,rotationY:Math.PI,scale:.8,pose:'phone'});
  figure({position:[-1.0,.04,-7.8],coat:mats.charcoal,hat:true,rotationY:.3,scale:.72});
  figure({position:[9.6,.04,-1.8],coat:mats.olive,bag:true,rotationY:-Math.PI/2,scale:.78});

  const shadowGrid=new THREE.Group();shadowGrid.position.set(.4,.022,1.7);shadowGrid.rotation.y=.12;station.add(shadowGrid);
  for(let x=-4.8;x<=4.8;x+=.58)box(shadowGrid,[.065,.018,8.0],[x,0,0],mats.shadow,[0,0,0],false,false);
  for(let z=-3.5;z<=3.5;z+=.92)box(shadowGrid,[10.0,.018,.065],[0,0,z],mats.shadow,[0,0,0],false,false);

  // Direction signs point into each real opening.
  for (const [x,z,rot] of [[-5.15,-1.3,0],[4.45,-2.8,0],[-10.1,6.2,Math.PI/2],[10.05,-3.3,-Math.PI/2],[0,-14.9,0]]) {
    box(station,[2.2,.7,.08],[x,5.25,z],mats.green,[0,rot,0],false,false);
    box(station,[1.45,.08,.1],[x,5.25,z-.06],mats.light,[0,rot,0],false,false);
  }

  scene.background=new THREE.Color(0x747b72);
  scene.fog=new THREE.Fog(0x747b72,28,105);
  return {group:station,centralWoman,figures};
}
