const fidelity = window.__SUBWAY_FIDELITY__;
if (fidelity?.group) {
  const station = fidelity.group;

  // The near-left support was reading as a generic modern station column and
  // concealed the three claustrophobic cubicles that define Tooker's left side.
  const blockingColumn = station.children.find((child) =>
    child.isGroup && Math.abs(child.position.x + 5.15) < .08 && Math.abs(child.position.z - 4.8) < .08
  );
  if (blockingColumn) blockingColumn.visible = false;

  // Pull the cubicle bank into the painted field while retaining enough depth for
  // the viewer to enter it during exploration.
  const boothBank = station.children.find((child) =>
    child.isGroup && Math.abs(child.position.x + 8.55) < .08 && Math.abs(child.position.z + 2.2) < .08
  );
  if (boothBank) {
    boothBank.name = 'visible-left-cubicle-bank';
    boothBank.position.x = -7.35;
    boothBank.position.z = -1.6;
  }

  for (const figure of fidelity.figures || []) {
    if (Math.abs(figure.position.x + 8.55) < .08) {
      figure.position.x = -7.35;
      figure.position.z += .6;
    }
  }
}
