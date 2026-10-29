import * as THREE from 'three';

export interface KembarMayangHandle {
  group: THREE.Group;
  update: (elapsed: number) => void;
  dispose: () => void;
}

/**
 * KembarMayang (`src/scenes/KembarMayang.tsx` — Section 5.3 of Revisi Final)
 * Pair of 1.6m tall ceremonial Javanese Janur palm-leaf bouquets on carved wooden bokor pedestals
 * flanking the Pelaminan dais (x = ±1.72m), plus smaller janur accents flanking the middle stairs.
 */
export function createKembarMayangScene(daisHeight = 1.54, daisFrontZ = -2.8): KembarMayangHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const plumeGroups: THREE.Group[] = [];

  const bokorWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#24100E'),
    roughness: 0.52,
    metalness: 0.0,
  });
  const bokorMaroonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#6B1424'),
    roughness: 0.65,
    metalness: 0.0,
  });
  const janurIvoryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#EADFCB'),
    emissive: new THREE.Color('#3B0A14'),
    emissiveIntensity: 0.25,
    roughness: 0.48,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  disposables.push(bokorWoodMat, bokorMaroonMat, janurIvoryMat);

  // Pedestal geometry (Lathe)
  const lathePoints = [
    new THREE.Vector2(0.01, 0),
    new THREE.Vector2(0.24, 0),
    new THREE.Vector2(0.18, 0.08),
    new THREE.Vector2(0.07, 0.22),
    new THREE.Vector2(0.06, 0.44),
    new THREE.Vector2(0.26, 0.56),
    new THREE.Vector2(0.22, 0.66),
    new THREE.Vector2(0.08, 0.66),
  ];
  const bokorGeo = new THREE.LatheGeometry(lathePoints, 18);
  const coreStemGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.92, 10);
  const spireGeo = new THREE.ConeGeometry(0.065, 0.38, 10);
  disposables.push(bokorGeo, coreStemGeo, spireGeo);

  // Create curved Janur frond geometry
  const frondCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.18, 0.22, 0),
    new THREE.Vector3(0.38, 0.14, 0),
    new THREE.Vector3(0.48, -0.14, 0)
  );
  const frondGeo = new THREE.TubeGeometry(frondCurve, 14, 0.016, 5, false);
  disposables.push(frondGeo);

  function buildBouquet(scale = 1.0): THREE.Group {
    const bGroup = new THREE.Group();
    bGroup.scale.setScalar(scale);

    const bokor = new THREE.Mesh(bokorGeo, bokorWoodMat);
    bGroup.add(bokor);

    const stem = new THREE.Mesh(coreStemGeo, bokorMaroonMat);
    stem.position.y = 0.92;
    bGroup.add(stem);

    const plumes = new THREE.Group();
    plumes.position.y = 0.72;

    // 3 tiers of radiating janur palm fronds (8 fronds per tier)
    const tiers = [
      { y: 0.05, s: 1.05, tilt: -0.15 },
      { y: 0.28, s: 0.88, tilt: 0.08 },
      { y: 0.52, s: 0.68, tilt: 0.28 },
    ];
    for (const tier of tiers) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const frondHolder = new THREE.Group();
        frondHolder.position.y = tier.y;
        frondHolder.rotation.y = angle;
        frondHolder.rotation.z = tier.tilt;
        frondHolder.scale.setScalar(tier.s);

        const frond = new THREE.Mesh(frondGeo, janurIvoryMat);
        frondHolder.add(frond);
        plumes.add(frondHolder);
      }
    }

    const spire = new THREE.Mesh(spireGeo, janurIvoryMat);
    spire.position.y = 0.82;
    plumes.add(spire);

    bGroup.add(plumes);
    plumeGroups.push(plumes);
    return bGroup;
  }

  // Main pair of 1.6m Kembar Mayang on the Pelaminan dais flanking the stairs
  const leftKembar = buildBouquet(1.0);
  leftKembar.position.set(-1.68, daisHeight, daisFrontZ - 0.18);
  group.add(leftKembar);

  const rightKembar = buildBouquet(1.0);
  rightKembar.position.set(1.68, daisHeight, daisFrontZ - 0.18);
  group.add(rightKembar);

  // Secondary pair flanking Step 3 (gives depth during whip-pan and stair climb)
  const midLeftKembar = buildBouquet(0.76);
  midLeftKembar.position.set(-1.78, 0.66, -1.2);
  group.add(midLeftKembar);

  const midRightKembar = buildBouquet(0.76);
  midRightKembar.position.set(1.78, 0.66, -1.2);
  group.add(midRightKembar);

  return {
    group,
    update: (elapsed: number) => {
      for (let i = 0; i < plumeGroups.length; i++) {
        const pg = plumeGroups[i];
        pg.rotation.z = Math.sin(elapsed * 1.1 + i * 1.3) * 0.022;
        pg.rotation.x = Math.cos(elapsed * 0.85 + i) * 0.015;
      }
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
