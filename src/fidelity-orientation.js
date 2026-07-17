const { fidelityDistrict, interiorLights } = window.NH;

// The original painting reads from the rounded glass corner at the left toward the
// server and equipment at the right. The procedural footprint was constructed in
// world coordinates with that sequence reversed from the composition camera, so
// mirror the complete district and its light rig as one coherent correction.
if (fidelityDistrict) fidelityDistrict.scale.x = -1;
if (interiorLights) interiorLights.scale.x = -1;
