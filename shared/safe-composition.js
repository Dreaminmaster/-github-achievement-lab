export function createSafeComposition({
  THREE,
  root,
  targetTolerance = 1.05,
  allowRelocation = true,
  explicitCutaway = []
}) {
  const raycaster = new THREE.Raycaster();
  const worldBox = new THREE.Box3();
  const size = new THREE.Vector3();
  const hidden = new Map();

  function cutawayObjects() {
    const value = typeof explicitCutaway === 'function' ? explicitCutaway() : explicitCutaway;
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function isOpaqueMaterial(material) {
    if (!material) return false;
    const materials = Array.isArray(material) ? material : [material];
    return materials.some((entry) => {
      if (!entry || entry.visible === false) return false;
      if (entry.transparent && (entry.opacity ?? 1) < 0.72) return false;
      if ((entry.transmission ?? 0) > 0.08) return false;
      return true;
    });
  }

  function isStructuralBlocker(object) {
    if (!object?.isMesh || !object.visible || !object.geometry || !isOpaqueMaterial(object.material)) return false;
    worldBox.setFromObject(object);
    if (worldBox.isEmpty()) return false;
    worldBox.getSize(size);
    const dimensions = [size.x, size.y, size.z].sort((a, b) => a - b);
    const isLargeSurface = dimensions[0] < 1.45 && dimensions[1] > 2.15 && dimensions[2] > 3.8;
    const isLargeSolid = dimensions[0] > 1.45 && dimensions[1] > 3.8 && dimensions[2] > 3.8;
    const isFloorBelowView = size.y < .5 && worldBox.max.y < .48;
    return (isLargeSurface || isLargeSolid) && !isFloorBelowView;
  }

  function collectBlockers() {
    const blockers = [];
    root?.traverse((object) => {
      if (isStructuralBlocker(object)) blockers.push(object);
    });
    return blockers;
  }

  function restore() {
    for (const [object, visible] of hidden) object.visible = visible;
    hidden.clear();
    document.documentElement.dataset.compositionCutaway = '0';
  }

  function temporarilyHide(object) {
    if (!object || hidden.has(object)) return;
    hidden.set(object, object.visible);
    object.visible = false;
  }

  function applyExplicitCutaway() {
    for (const object of cutawayObjects()) temporarilyHide(object);
  }

  function obstruction(position, target, blockers) {
    for (const blocker of blockers) {
      worldBox.setFromObject(blocker).expandByScalar(.035);
      if (worldBox.containsPoint(position)) return { blocker, distance: 0 };
    }

    const direction = target.clone().sub(position);
    const distance = direction.length();
    if (distance <= targetTolerance) return null;
    raycaster.set(position, direction.normalize());
    const hit = raycaster.intersectObjects(blockers, false)
      .find((entry) => entry.distance < distance - targetTolerance);
    return hit ? { blocker: hit.object, distance: hit.distance } : null;
  }

  function candidatePositions(base, target) {
    const forward = target.clone().sub(base).normalize();
    const horizontalForward = new THREE.Vector3(forward.x, 0, forward.z);
    if (horizontalForward.lengthSq() < .001) horizontalForward.set(0, 0, -1);
    horizontalForward.normalize();
    const right = new THREE.Vector3(horizontalForward.z, 0, -horizontalForward.x).normalize();
    const offsets = [
      [0, 0, 0],
      [1.2, 0, 0], [2.4, 0, 0], [3.8, 0, 0],
      [1.4, 0, 1.35], [1.4, 0, -1.35],
      [2.6, .45, 1.8], [2.6, .45, -1.8],
      [.8, 1.05, 0], [2.0, 1.15, 0],
      [3.6, .65, 2.6], [3.6, .65, -2.6]
    ];
    return offsets.map(([forwardAmount, upAmount, sideAmount]) => base.clone()
      .addScaledVector(horizontalForward, forwardAmount)
      .addScaledVector(right, sideAmount)
      .add(new THREE.Vector3(0, upAmount, 0)));
  }

  function resolve(preset) {
    restore();
    applyExplicitCutaway();

    if (!allowRelocation) {
      document.documentElement.dataset.compositionAdjusted = '0';
      document.documentElement.dataset.compositionCutaway = String(hidden.size);
      document.documentElement.dataset.compositionStrategy = 'anchored';
      return { ...preset, position: [...preset.position], target: [...preset.target], safetyAdjusted: false, cutawayCount: hidden.size };
    }

    const base = new THREE.Vector3(...preset.position);
    const target = new THREE.Vector3(...preset.target);
    let blockers = collectBlockers().filter((object) => !hidden.has(object));
    const candidates = candidatePositions(base, target);

    for (let index = 0; index < candidates.length; index++) {
      if (!obstruction(candidates[index], target, blockers)) {
        document.documentElement.dataset.compositionAdjusted = index === 0 ? '0' : '1';
        document.documentElement.dataset.compositionCutaway = String(hidden.size);
        document.documentElement.dataset.compositionStrategy = index === 0 ? 'original' : 'relocated';
        return { ...preset, position: candidates[index].toArray(), safetyAdjusted: index !== 0, cutawayCount: hidden.size };
      }
    }

    const position = candidates[Math.min(3, candidates.length - 1)];
    for (let pass = 0; pass < 5; pass++) {
      const blocked = obstruction(position, target, blockers);
      if (!blocked) break;
      temporarilyHide(blocked.blocker);
      blockers = blockers.filter((object) => object !== blocked.blocker);
    }

    document.documentElement.dataset.compositionAdjusted = '1';
    document.documentElement.dataset.compositionCutaway = String(hidden.size);
    document.documentElement.dataset.compositionStrategy = 'fallback-cutaway';
    return { ...preset, position: position.toArray(), safetyAdjusted: true, cutawayCount: hidden.size };
  }

  return { resolve, exit: restore };
}
