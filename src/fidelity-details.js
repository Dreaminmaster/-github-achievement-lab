const {
  THREE, fidelityDistrict: district, fidelityDiner: diner, makeMaterial, box, cylinder, sphere, panelAlong, mats
} = window.NH;

if (district && diner) {
  const details = new THREE.Group();
  details.name = 'nighthawks-detail-layer';
  district.add(details);

  const iron = makeMaterial(0x172326, { roughness: .62, metalness: .48 });
  const ironWet = makeMaterial(0x33484a, { roughness: .42, metalness: .34 });
  const brickLine = makeMaterial(0x201816, { roughness: 1 });
  const concreteDark = makeMaterial(0x4c5651, { roughness: .98 });
  const utilityGreen = makeMaterial(0x203a37, { roughness: .82 });
  const paper = makeMaterial(0xd9d1aa, { roughness: .95 });
  const coffee = makeMaterial(0x2a1711, { roughness: .58 });
  const chrome = makeMaterial(0x89918c, { roughness: .24, metalness: .8 });

  // Street infrastructure gives the broad empty foreground physical scale without filling its silence.
  for (const x of [-1.4, 5.8, 12.1]) {
    const drain = new THREE.Group(); drain.position.set(x, .012, 1.12); details.add(drain);
    box(drain, [1.18, .035, .42], [0, 0, 0], ironWet, [0,0,0], false, false);
    for (let i = -4; i <= 4; i++) box(drain, [.055, .045, .38], [i * .12, .02, 0], iron, [0,0,0], false, false);
  }
  for (const [x,z,r] of [[-1.8,-7.2,.72],[14.5,-5.2,.62]]) {
    cylinder(details, r, r, .035, [x,.01,z], ironWet, [0,0,0], 32, false);
    cylinder(details, r*.72, r*.72, .045, [x,.025,z], iron, [0,0,0], 28, false);
    for(let a=0;a<Math.PI*2;a+=Math.PI/4) box(details,[.05,.055,r*.9],[x+Math.cos(a)*r*.35,.05,z+Math.sin(a)*r*.35],ironWet,[0,-a,0],false,false);
  }
  panelAlong(details, [-28,-1.0], [30,-1.0], .002, .025, .035, concreteDark, { cast:false });
  panelAlong(details, [-28,-13.2], [30,-13.2], .002, .025, .035, concreteDark, { cast:false });

  // Sparse rear-alley service elements make the host building work from side and back views.
  box(details, [2.25, 3.2, .18], [11.3, 1.65, 13.18], utilityGreen);
  box(details, [2.02, 2.85, .08], [11.3, 1.62, 13.06], iron);
  cylinder(details, .075, .075, 8.6, [12.05, 5.05, 13.02], ironWet, [0,0,0], 10);
  for (const y of [2.1, 4.4, 6.7]) box(details, [.55, .055, .12], [11.78,y,13.0], iron);
  box(details, [1.15, 1.35, .5], [8.8, .72, 13.4], utilityGreen);
  box(details, [.78, .9, .08], [8.8, .75, 13.13], ironWet);

  // Roof vents, ducts and a restrained fire escape continue the architecture above the original crop.
  for (const [x,z,h] of [[1.0,9.4,1.15],[5.4,10.6,.82],[9.2,9.1,1.42]]) {
    cylinder(details, .3, .38, h, [x,10.15+h/2,z], ironWet, [0,0,0], 16);
    cylinder(details, .46, .46, .12, [x,10.75+h/2,z], iron, [0,0,0], 18);
  }
  const escape = new THREE.Group(); escape.position.set(-12.48,0,14.0); details.add(escape);
  for (const y of [3.4,5.9,8.0]) {
    box(escape,[.18,.12,3.0],[0,y,0],iron);
    box(escape,[1.35,.12,3.0],[-.65,y,0],ironWet);
    for(let z=-1.35;z<=1.35;z+=.45) box(escape,[1.2,.055,.055],[-.65,y+.58,z],iron);
  }
  for(const z of [-1.35,1.35]) box(escape,[.06,5.3,.06],[-1.25,5.7,z],iron);
  for(let i=0;i<10;i++) box(escape,[.9,.055,.09],[-.55,2.8+i*.38,-1.05+i*.22],iron,[0,0,.62]);

  // Brick courses and sills remain nearly invisible head-on but reward close exploration.
  for(let y=1.1;y<8.8;y+=.55) box(details,[15.6,.025,.035],[5.0,y,13.15],brickLine,[0,0,0],false,false);
  for(const x of [-1.1,1.8,4.7,7.6,10.5]) box(details,[1.55,.12,.28],[x,5.35,6.72],concreteDark,[0,0,0],false,false);

  // Additional diner equipment, shelves, napkin dispensers and service clutter.
  box(diner, [4.1, .11, .36], [8.3, 3.42, 6.72], mats.steel, [0,0,0], true, true);
  for (const x of [6.7, 7.35, 8.0, 8.65, 9.3]) {
    cylinder(diner, .11, .13, .28, [x, 3.6, 6.6], chrome, [0,0,0], 16, false);
    cylinder(diner, .08, .08, .2, [x, 3.78, 6.6], coffee, [0,0,0], 14, false);
  }
  for(const x of [1.2,3.45,7.25]){
    box(diner,[.24,.3,.18],[x,1.98,4.05],chrome,[0,0,0],false,false);
    box(diner,[.2,.16,.02],[x,2.08,3.95],paper,[0,0,0],false,false);
  }
  for(const [x,z] of [[2.1,4.12],[3.0,4.08],[7.05,4.05],[7.7,4.08]]){
    cylinder(diner,.055,.065,.12,[x,1.9,z],cream,[0,0,0],14,false);
    box(diner,[.18,.018,.18],[x,1.82,z],chrome,[0,0,0],false,false);
  }
  box(diner,[1.1,.08,.52],[10.65,1.92,5.95],paper,[0,-.18,0],false,false);
  for(let i=0;i<5;i++) box(diner,[.14,.025,.32],[10.25+i*.2,1.98,5.92],paper,[0,-.18,0],false,false);

  // A few curb chips and patched slabs keep the pavement from reading as one giant plane.
  for(const [x,z,w] of [[-3.8,1.05,.7],[2.6,1.02,.55],[9.8,1.03,.82],[-12.3,5.2,.6]]){
    box(details,[w,.035,.12],[x,.095,z],concreteDark,[0,0,.03],false,false);
  }
}
