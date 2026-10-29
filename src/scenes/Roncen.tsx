import * as THREE from 'three';

export interface RoncenHandle {
  group: THREE.Group;
  update: (elapsed: number) => void;
  dispose: () => void;
}

/**
 * Roncen (`src/scenes/Roncen.tsx` — Section 5.3 & Section 6 of Revisi Final)
 * 5 hanging strands of Roncen Melati (jasmine garlands) suspended above the Pelaminan,
 * swaying with a gentle pendulum motion (`sin(t * 0.9 + phase) * 0.025 rad`),
 * plus a foreground central jasmine garland at z = 0.85m used for the `macro-iris` zoom transition.
 */
export function createRoncenScene(): RoncenHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const strands: Array<{ pivot: THREE.Group; phase: number; speed: number }> = [];

  const budGeo = new THREE.SphereGeometry(0.024, 8, 8);
  budGeo.scale(1, 1.35, 1);
  const blossomPetalGeo = new THREE.SphereGeometry(0.032, 8, 8);
  blossomPetalGeo.scale(1.4, 0.6, 0.8);
  const stemLineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#EADFCB'),
    transparent: true,
    opacity: 0.45,
  });
  const melatiMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F2E3C6'),
    emissive: new THREE.Color('#EADFCB'),
    emissiveIntensity: 0.35,
    roughness: 0.4,
    metalness: 0.0,
  });
  disposables.push(budGeo, blossomPetalGeo, stemLineMat, melatiMat);

  function createGarlandStrand(
    x: number,
    topY: number,
    z: number,
    length: number,
    budCount: number,
    phase: number,
    withHeroBlossom = false
  ) {
    const pivot = new THREE.Group();
    pivot.position.set(x, topY, z);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -length, 0),
    ]);
    disposables.push(lineGeo);
    pivot.add(new THREE.Line(lineGeo, stemLineMat));

    for (let i = 0; i < budCount; i++) {
      const yPos = -((i + 1) / budCount) * length;
      const bud = new THREE.Mesh(budGeo, melatiMat);
      bud.position.set(0, yPos, 0);
      pivot.add(bud);
    }

    // Add a 5-petal blooming Melati rosette at the bottom tip (especially for macro-iris zoom)
    if (withHeroBlossom) {
      const rosette = new THREE.Group();
      rosette.position.set(0, -length, 0);
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(blossomPetalGeo, melatiMat);
        petal.position.set(Math.cos(angle) * 0.035, Math.sin(angle) * 0.035, 0);
        petal.rotation.z = angle;
        rosette.add(petal);
      }
      pivot.add(rosette);
    }

    group.add(pivot);
    strands.push({ pivot, phase, speed: 0.9 });
  }

  // 5 main strands suspended above the Pelaminan archway (z = -2.2m, topY = 5.1m)
  const xConfigs = [
    { x: -1.65, len: 1.45, buds: 16, phase: 0.0 },
    { x: -0.82, len: 1.15, buds: 13, phase: 1.1 },
    { x: 0.0, len: 0.95, buds: 11, phase: 2.2 },
    { x: 0.82, len: 1.15, buds: 13, phase: 3.3 },
    { x: 1.65, len: 1.45, buds: 16, phase: 4.4 },
  ];
  for (const cfg of xConfigs) {
    createGarlandStrand(cfg.x, 5.1, -2.2, cfg.len, cfg.buds, cfg.phase, true);
  }

  // Foreground hanging Roncen Melati strand at [0, 3.85, 0.85] (bottom blossom at y = 2.75m, z = 0.85m)
  // This is the exact blossom the camera zooms into during Section 5 -> Section 6 (`macro-iris`)
  createGarlandStrand(0, 3.85, 0.85, 1.1, 12, 0.5, true);

  return {
    group,
    update: (elapsed: number) => {
      for (const s of strands) {
        s.pivot.rotation.z = Math.sin(elapsed * s.speed + s.phase) * 0.025;
        s.pivot.rotation.x = Math.cos(elapsed * (s.speed * 0.8) + s.phase) * 0.012;
      }
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
