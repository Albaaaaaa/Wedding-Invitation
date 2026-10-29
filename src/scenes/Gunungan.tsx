import * as THREE from 'three';

export interface GununganRig {
  group: THREE.Group;
  update: (elapsed: number, heroActive: boolean, wayangPhase: string) => void;
}

/**
 * Kayon / Gunungan kecil di kelir (Tancep Kayon - Section 5.3)
 * Maroon-sogan (#8E2233) with warm ivory (#EADFCB) Kalpataru tree filigree.
 * Sways gently for ~2 seconds at the start of Hero, then descends gracefully as Wayang enter.
 */
export function createGununganRig(): GununganRig {
  const group = new THREE.Group();
  group.name = 'GununganKayon';

  const shape = new THREE.Shape();
  shape.moveTo(0, 1.15);
  shape.bezierCurveTo(0.22, 0.82, 0.48, 0.45, 0.42, -0.05);
  shape.bezierCurveTo(0.38, -0.35, 0.28, -0.58, 0.22, -0.78);
  shape.lineTo(-0.22, -0.78);
  shape.bezierCurveTo(-0.28, -0.58, -0.38, -0.35, -0.42, -0.05);
  shape.bezierCurveTo(-0.48, 0.45, -0.22, 0.82, 0, 1.15);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });

  const mat = new THREE.MeshStandardMaterial({
    color: 0x8e2233,
    roughness: 0.65,
    metalness: 0.05,
    emissive: 0x3b0a14,
    emissiveIntensity: 0.35,
  });

  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Ivory filigree outline & Kalpataru central axis
  const outlinePts = shape.getPoints(36).map((p) => new THREE.Vector3(p.x, p.y, 0.016));
  const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePts);
  const outlineMat = new THREE.LineBasicMaterial({
    color: 0xeadfcb,
    transparent: true,
    opacity: 0.65,
  });
  group.add(new THREE.Line(outlineGeo, outlineMat));

  // Gapit rod
  const rodGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.9, 8);
  const rodMat = new THREE.MeshBasicMaterial({ color: 0xeadfcb, transparent: true, opacity: 0.5 });
  const rod = new THREE.Mesh(rodGeo, rodMat);
  rod.position.set(0, -0.1, 0.015);
  group.add(rod);

  group.position.set(0, 1.25, 0.14);
  group.scale.setScalar(0.58);

  const update = (elapsed: number, heroActive: boolean, wayangPhase: string) => {
    // Gentle 2s sway at Tancep Kayon, then lowers slightly into the gedebog banana-trunk base
    const isPlantedCenter = wayangPhase === 'kayon' && heroActive;
    const targetY = isPlantedCenter ? 1.32 : 0.72;
    const targetScale = isPlantedCenter ? 0.65 : 0.42;
    group.position.y = THREE.MathUtils.lerp(group.position.y, targetY, 0.05);
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, 0.05));
    group.rotation.z = Math.sin(elapsed * 1.8) * (isPlantedCenter ? 0.06 : 0.025);
  };

  return { group, update };
}
