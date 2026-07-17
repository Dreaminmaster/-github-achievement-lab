import * as THREE from 'three';

const fidelity = window.__LAST_SUPPER_FIDELITY__;
if (fidelity?.stage) {
  const groups = fidelity.stage.children.filter((child) => child.isGroup);

  // The table is the largest detail group. Lower it so the disciples' torsos and
  // gestures read above the cloth as they do in Leonardo's composition.
  const table = groups.find((group) => group.children.length > 35 && Math.abs(group.position.z) < .01);
  if (table) {
    table.name = 'lowered-last-supper-table';
    table.position.y -= .34;
  }

  // The thirteen figure groups occupy the narrow band behind the table.
  for (const group of groups) {
    if (group.position.z < -3.7 && group.position.z > -4.8 && group.children.length >= 7 && group.children.length <= 20) {
      group.name ||= 'raised-disciple-figure';
      group.position.y += .32;
    }
  }

  // Prevent the coffered ceiling from collapsing into a black band while keeping
  // the side-light direction visible.
  const scene = fidelity.group.parent?.parent;
  if (scene) {
    const ceilingBounce = new THREE.DirectionalLight(0x9c8b70, .38);
    ceilingBounce.position.set(0, 12, 12);
    ceilingBounce.target.position.set(0, 6.5, -7);
    scene.add(ceilingBounce, ceilingBounce.target);
  }
}
