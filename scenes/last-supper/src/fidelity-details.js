import * as THREE from 'three';

const fidelity = window.__LAST_SUPPER_FIDELITY__;
if (fidelity?.group && fidelity?.stage) {
  const hall = fidelity.group;
  const stage = fidelity.stage;
  const details = new THREE.Group();
  details.name = 'last-supper-detail-layer';
  hall.add(details);

  const mat = (color, roughness = .9, metalness = .02) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const stone = mat(0x6f6455, .96);
  const plaster = mat(0xa99a7f, .98);
  const darkWood = mat(0x3a281f, .9);
  const wood = mat(0x68452e, .82);
  const iron = mat(0x292723, .55, .52);
  const ceramic = mat(0xb9ad96, .75);
  const copper = mat(0x8b5b3b, .44, .42);
  const linen = mat(0xd2c7b3, .96);
  const wine = new THREE.MeshPhysicalMaterial({ color: 0x4b1715, roughness: .25, transmission: .08, transparent: true, opacity: .82, thickness: .05 });
  const darkness = new THREE.MeshBasicMaterial({ color: 0x15110f, side: THREE.DoubleSide });

  function box(parent, size, position, material, rotation = [0,0,0], cast = true, receive = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = cast; mesh.receiveShadow = receive; parent.add(mesh); return mesh;
  }
  function cylinder(parent, radiusTop, radiusBottom, height, position, material, rotation = [0,0,0], segments = 20) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
    mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function sphere(parent, radius, position, material, scale = [1,1,1]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 14), material);
    mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }

  // The real refectory continues behind the painted room with rafters, service furniture and wall niches.
  for (let z = -1.0; z <= 21.0; z += 3.7) {
    box(details, [20.2, .22, .34], [0, 7.7, z], darkWood);
    for (const x of [-8.8,-5.9,-3.0,0,3.0,5.9,8.8]) box(details, [.16,.55,.34], [x,7.38,z], darkWood);
  }
  for (const side of [-1,1]) {
    for (const z of [1.0,7.3,13.6,19.5]) {
      const x = side * 10.28;
      box(details, [.12, 2.9, 2.05], [x,4.55,z], darkness, [0,0,0], false, false);
      box(details, [.22,3.25,.18], [x-side*.04,4.55,z-1.12], stone);
      box(details, [.22,3.25,.18], [x-side*.04,4.55,z+1.12], stone);
      box(details, [.22,.2,2.45], [x-side*.04,6.17,z], stone);
      box(details, [.22,.2,2.45], [x-side*.04,2.93,z], stone);
      if (side > 0 && z > 15) {
        const door = new THREE.Group(); door.position.set(x-.12,2.45,z+1.05); door.rotation.y=-.58; details.add(door);
        box(door,[.14,4.75,2.0],[0,0,0],wood);
        for(let y=-1.7;y<=1.7;y+=.85) box(door,[.17,.05,1.7],[0,y,0],darkWood);
        cylinder(door,.06,.06,.14,[-.12,0,-.65],copper,[0,0,Math.PI/2],14);
      }
    }
  }

  // Service tables and monastery cupboards make the reverse view read as a working dining hall.
  for (const [x,z,rot] of [[-8.65,4.6,Math.PI/2],[8.65,9.8,-Math.PI/2],[-8.65,16.2,Math.PI/2]]) {
    const service = new THREE.Group(); service.position.set(x,0,z); service.rotation.y=rot; details.add(service);
    box(service,[3.0,.18,.9],[0,1.12,0],wood);
    for(const sx of [-1.25,1.25]) for(const sz of [-.32,.32]) box(service,[.16,1.05,.16],[sx,.55,sz],darkWood);
    cylinder(service,.28,.32,.58,[-.75,1.52,0],ceramic,[0,0,0],18);
    cylinder(service,.2,.24,.4,[.05,1.43,.05],copper,[0,0,0],18);
    sphere(service,.16,[.72,1.34,.02],ceramic,[1.25,.7,1.0]);
  }
  const cupboard = new THREE.Group(); cupboard.position.set(7.8,0,20.7); details.add(cupboard);
  box(cupboard,[3.6,4.4,.92],[0,2.2,0],darkWood);
  for(const x of [-.9,.9]) {
    box(cupboard,[1.55,3.65,.1],[x,2.35,-.52],wood);
    for(let y=.9;y<4.0;y+=.75) box(cupboard,[1.35,.06,.12],[x,y,-.59],darkWood);
    cylinder(cupboard,.045,.045,.09,[x+(x<0?.5:-.5),2.25,-.64],copper,[Math.PI/2,0,0],12);
  }

  // Floor drains, worn threshold stones and side tables add believable scale during free exploration.
  for (const [x,z] of [[-4.8,3.2],[4.8,11.0],[0,18.8]]) {
    cylinder(details,.42,.42,.035,[x,.015,z],iron,[0,0,0],28);
    for(let a=0;a<Math.PI*2;a+=Math.PI/4) box(details,[.04,.045,.5],[x+Math.cos(a)*.15,.04,z+Math.sin(a)*.15],stone,[0,-a,0],false,false);
  }
  for(let z=-4;z<22;z+=4.2) box(details,[.18,.035,1.9],[-9.8,.08,z],stone,[0,0,0],false,false);

  // Enrich Leonardo's table without changing the painted grouping or silhouette.
  const tableGroups = stage.children.filter((child) => child.isGroup);
  const table = tableGroups.find((group) => group.children.length > 35 && Math.abs(group.position.z) < .01);
  if (table) {
    for (let x = -7.2; x <= 7.2; x += 1.2) {
      box(table,[.035,.3,.46],[x,2.42,-1.2],linen,[0,0,.06*Math.sin(x)],false,false);
    }
    for(const [x,z,r] of [[-4.7,-2.35,.42],[-1.9,-2.65,.34],[1.55,-2.42,.4],[4.65,-2.6,.36]]){
      cylinder(table,r,r,.055,[x,2.64,z],ceramic,[0,0,0],24);
      sphere(table,r*.55,[x,2.72,z],mat(0x8f7145,.9),[1.1,.28,.85]);
    }
    for(const [x,z] of [[-6.1,-2.85],[0,-2.78],[5.8,-2.86]]){
      cylinder(table,.14,.18,.55,[x,2.9,z],wine,[0,0,0],20);
      cylinder(table,.055,.075,.22,[x,3.27,z],copper,[0,0,0],16);
    }
    for(const x of [-5.2,-2.6,2.7,5.1]){
      box(table,[.7,.025,.42],[x,2.68,-1.65],linen,[0,.1*Math.sign(x),0],false,false);
      box(table,[.36,.02,.025],[x,2.72,-1.9],copper,[0,.25*Math.sign(x),0],false,false);
    }
  }

  // Landscape depth behind the three windows prevents the back wall from reading as a flat card from oblique views.
  const landscapeMat = mat(0x69715e,.98);
  for(const [x,z,s] of [[-4.2,-12.8,1.1],[0,-13.5,.85],[4.3,-12.6,1.0]]){
    const hill=new THREE.Mesh(new THREE.DodecahedronGeometry(1.6,1),landscapeMat);
    hill.position.set(x,-.15,z);hill.scale.set(2.2*s,.45*s,1.25*s);stage.add(hill);
  }
}
