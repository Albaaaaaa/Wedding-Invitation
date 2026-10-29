import * as THREE from 'three';

export interface LenteraHandle {
  group: THREE.Group;
  update: (elapsed: number, dimFactor: number) => void;
  dispose: () => void;
}

/**
 * Lentera (`src/scenes/Lentera.tsx` — Section 5.3 & 5.4 of Revisi Final)
 * 4 hanging Javanese glass lanterns suspended above the Pelaminan stairs and dais,
 * emitting warm ivory light (#F2E3C6) that backlights the couple and illuminates the Gebyok.
 */
export function createLenteraScene(): LenteraHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const lanterns: Array<{
    pivot: THREE.Group;
    coreMat: THREE.MeshBasicMaterial;
    light: THREE.PointLight;
    baseIntensity: number;
    phase: number;
  }> = [];

  const frameMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1A0C0A'),
    roughness: 0.5,
    metalness: 0.0,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#EADFCB'),
    emissive: new THREE.Color('#F2E3C6'),
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.55,
    roughness: 0.25,
    metalness: 0.0,
  });
  disposables.push(frameMat, glassMat);

  const chainGeo = new THREE.CylinderGeometry(0.008, 0.008, 1.1, 6);
  const capGeo = new THREE.ConeGeometry(0.18, 0.14, 6);
  const bodyGeo = new THREE.CylinderGeometry(0.13, 0.1, 0.34, 6);
  const finialGeo = new THREE.ConeGeometry(0.08, 0.12, 6);
  const coreGeo = new THREE.SphereGeometry(0.065, 10, 10);
  disposables.push(chainGeo, capGeo, bodyGeo, finialGeo, coreGeo);

  const lanternPositions: Array<{
    x: number;
    y: number;
    z: number;
    intensity: number;
    phase: number;
  }> = [
    { x: -1.15, y: 4.55, z: -1.35, intensity: 1.35, phase: 0.2 },
    { x: 1.15, y: 4.55, z: -1.35, intensity: 1.35, phase: 1.7 },
    { x: -2.15, y: 4.35, z: -2.55, intensity: 1.15, phase: 3.1 },
    { x: 2.15, y: 4.35, z: -2.55, intensity: 1.15, phase: 4.5 },
  ];

  for (const cfg of lanternPositions) {
    const pivot = new THREE.Group();
    pivot.position.set(cfg.x, cfg.y, cfg.z);

    const chain = new THREE.Mesh(chainGeo, frameMat);
    chain.position.y = -0.55;
    pivot.add(chain);

    const housing = new THREE.Group();
    housing.position.y = -1.15;

    const topCap = new THREE.Mesh(capGeo, frameMat);
    topCap.position.y = 0.22;
    housing.add(topCap);

    const glassBody = new THREE.Mesh(bodyGeo, glassMat);
    housing.add(glassBody);

    const bottomFinial = new THREE.Mesh(finialGeo, frameMat);
    bottomFinial.rotation.x = Math.PI;
    bottomFinial.position.y = -0.22;
    housing.add(bottomFinial);

    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#F2E3C6'),
    });
    disposables.push(coreMat);
    const core = new THREE.Mesh(coreGeo, coreMat);
    housing.add(core);

    const light = new THREE.PointLight(new THREE.Color('#F2E3C6'), cfg.intensity, 7.5, 1.6);
    light.position.set(0, -0.05, 0);
    housing.add(light);

    pivot.add(housing);
    group.add(pivot);

    lanterns.push({
      pivot,
      coreMat,
      light,
      baseIntensity: cfg.intensity,
      phase: cfg.phase,
    });
  }

  return {
    group,
    update: (elapsed: number, dimFactor: number) => {
      for (const l of lanterns) {
        l.pivot.rotation.z = Math.sin(elapsed * 0.75 + l.phase) * 0.018;
        const flicker = Math.sin(elapsed * 2.8 + l.phase) * 0.06;
        l.light.intensity = Math.max(0.25, (l.baseIntensity + flicker) * (1 - dimFactor * 0.55));
      }
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
