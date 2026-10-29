import * as THREE from 'three';

export interface ArticulatedWayangPuppet {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  upperArmGroup: THREE.Group;
  lowerArmGroup: THREE.Group;
  gapitGroup: THREE.Group;
}

export interface WayangStageRig {
  group: THREE.Group;
  kamajaya: ArticulatedWayangPuppet;
  kamaratih: ArticulatedWayangPuppet;
  update: (
    elapsed: number,
    timeSinceOpened: number,
    phase: 'kayon' | 'jejer' | 'sembah' | 'kiprah' | 'closing-sembah',
    reducedMotion: boolean
  ) => void;
}

function buildSingleWayangPuppet(role: 'Kamajaya' | 'Kamaratih'): ArticulatedWayangPuppet {
  const isMale = role === 'Kamajaya';
  const dir = isMale ? 1 : -1; // Kamajaya on left facing right (+1), Kamaratih on right facing left (-1)

  const root = new THREE.Group();
  root.name = `Wayang_${role}`;

  const silhouetteMat = new THREE.MeshBasicMaterial({
    color: 0x0b0506,
    side: THREE.DoubleSide,
  });

  const sungginganMat = new THREE.MeshBasicMaterial({
    color: 0xf2e3c6,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
  });

  // 1. Gapit (Central Horn Rod with slight spring lag)
  const gapitGroup = new THREE.Group();
  const gapitGeo = new THREE.CylinderGeometry(0.008, 0.01, 1.65, 8);
  const gapitMesh = new THREE.Mesh(gapitGeo, silhouetteMat);
  gapitMesh.position.y = 0.82;
  gapitGroup.add(gapitMesh);
  root.add(gapitGroup);

  // 2. Body Group (Torso + Kain Dodot/Jarik + Sunggingan perforations)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.set(0, 0.35, 0.01);

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.18 * dir, 0);
  bodyShape.bezierCurveTo(-0.24 * dir, 0.25, -0.14 * dir, 0.55, -0.08 * dir, 0.72);
  bodyShape.lineTo(-0.2 * dir, 1.05);
  bodyShape.lineTo(0.18 * dir, 1.08);
  bodyShape.bezierCurveTo(0.12 * dir, 0.82, 0.1 * dir, 0.65, 0.24 * dir, 0.15);
  bodyShape.lineTo(0.16 * dir, 0);
  bodyShape.closePath();

  const bodyMesh = new THREE.Mesh(new THREE.ShapeGeometry(bodyShape), silhouetteMat);
  bodyGroup.add(bodyMesh);

  // Perforated Sunggingan filigree dots on Kain & Chest
  const dotGeo = new THREE.CircleGeometry(0.012, 8);
  for (let row = 0; row < 5; row++) {
    for (let col = -1; col <= 1; col++) {
      const dot = new THREE.Mesh(dotGeo, sungginganMat);
      dot.position.set(col * 0.045, 0.18 + row * 0.11, 0.004);
      bodyGroup.add(dot);
    }
  }
  root.add(bodyGroup);

  // 3. Head Group (Profile + Gelung Supit Urang / Makuta Putri + Eye Slit)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.08, 0.005);

  const headShape = new THREE.Shape();
  headShape.moveTo(-0.06 * dir, 0);
  // Crown / Gelung curving back
  headShape.bezierCurveTo(
    -0.26 * dir,
    0.08,
    -0.3 * dir,
    isMale ? 0.42 : 0.34,
    -0.06 * dir,
    isMale ? 0.44 : 0.36
  );
  // Forehead & elongated Javanese wayang nose pointing forward
  headShape.bezierCurveTo(0.08 * dir, 0.3, 0.18 * dir, 0.22, 0.24 * dir, 0.16);
  headShape.lineTo(0.14 * dir, 0.12);
  headShape.lineTo(0.12 * dir, 0.03);
  headShape.closePath();

  const headMesh = new THREE.Mesh(new THREE.ShapeGeometry(headShape), silhouetteMat);
  headGroup.add(headMesh);

  // Sunggingan Crown & Eye Perforations
  const eyeDot = new THREE.Mesh(new THREE.CircleGeometry(0.011, 8), sungginganMat);
  eyeDot.position.set(0.1 * dir, 0.17, 0.005);
  headGroup.add(eyeDot);

  for (let i = 0; i < 4; i++) {
    const crownDot = new THREE.Mesh(dotGeo, sungginganMat);
    crownDot.position.set((-0.12 - i * 0.025) * dir, 0.16 + i * 0.045, 0.005);
    headGroup.add(crownDot);
  }
  bodyGroup.add(headGroup);

  // 4. Articulated Upper Arm (hinged at front shoulder)
  const upperArmGroup = new THREE.Group();
  upperArmGroup.position.set(0.14 * dir, 0.98, 0.008);

  const upperArmGeo = new THREE.PlaneGeometry(0.045, 0.38);
  upperArmGeo.translate(0, -0.19, 0);
  const upperArmMesh = new THREE.Mesh(upperArmGeo, silhouetteMat);
  upperArmGroup.add(upperArmMesh);
  bodyGroup.add(upperArmGroup);

  // 5. Articulated Lower Arm + Sampur Sash + Tuding Rod (hinged at elbow)
  const lowerArmGroup = new THREE.Group();
  lowerArmGroup.position.set(0, -0.36, 0.004);

  const lowerArmGeo = new THREE.PlaneGeometry(0.038, 0.42);
  lowerArmGeo.translate(0, -0.2, 0);
  const lowerArmMesh = new THREE.Mesh(lowerArmGeo, silhouetteMat);
  lowerArmGroup.add(lowerArmMesh);

  // Flowing Sampur (dance sash hanging from wrist)
  const sampurGeo = new THREE.PlaneGeometry(0.055, 0.45);
  sampurGeo.translate(0, -0.22, -0.002);
  const sampurMesh = new THREE.Mesh(sampurGeo, silhouetteMat);
  sampurMesh.position.set(0, -0.36, 0);
  lowerArmGroup.add(sampurMesh);

  // Tuding control stick attached to hand
  const tudingGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.95, 6);
  tudingGeo.translate(0, -0.47, 0);
  const tudingMesh = new THREE.Mesh(tudingGeo, silhouetteMat);
  tudingMesh.position.set(0, -0.38, 0);
  lowerArmGroup.add(tudingMesh);

  upperArmGroup.add(lowerArmGroup);

  return {
    root,
    bodyGroup,
    headGroup,
    upperArmGroup,
    lowerArmGroup,
    gapitGroup,
  };
}

export function createWayangStageRig(zOffset = 0.12): WayangStageRig {
  const group = new THREE.Group();
  group.name = 'WayangStageRig';
  group.position.set(0, 0.25, zOffset);

  const kamajaya = buildSingleWayangPuppet('Kamajaya');
  const kamaratih = buildSingleWayangPuppet('Kamaratih');

  kamajaya.root.position.set(-0.92, 0, 0);
  kamaratih.root.position.set(0.92, 0, 0.02);

  group.add(kamajaya.root);
  group.add(kamaratih.root);

  const update = (
    elapsed: number,
    timeSinceOpened: number,
    scrollPhase: 'kayon' | 'jejer' | 'sembah' | 'kiprah' | 'closing-sembah',
    reducedMotion: boolean
  ) => {
    if (reducedMotion) {
      // Static dignified Sembah pose when prefers-reduced-motion is active
      kamajaya.root.position.x = -0.78;
      kamaratih.root.position.x = 0.78;
      kamajaya.headGroup.rotation.z = -0.1;
      kamaratih.headGroup.rotation.z = 0.1;
      kamajaya.upperArmGroup.rotation.z = 0.45;
      kamajaya.lowerArmGroup.rotation.z = 1.45;
      kamaratih.upperArmGroup.rotation.z = -0.45;
      kamaratih.lowerArmGroup.rotation.z = -1.45;
      return;
    }

    // Determine active choreography phase from timeSinceOpened & scrollPhase (Section 5.3)
    // 0..2s: Tancep Kayon, 2..5s: Jejer (enter), 5..7.5s: Sembah, >7.5s: Kiprah loop (or Closing Sembah)
    let activePhase = scrollPhase;
    if (scrollPhase !== 'closing-sembah') {
      if (timeSinceOpened < 1.8) activePhase = 'kayon';
      else if (timeSinceOpened < 4.8) activePhase = 'jejer';
      else if (timeSinceOpened < 7.3) activePhase = 'sembah';
      else activePhase = 'kiprah';
    }

    let targetXLeft = -0.82;
    let targetXRight = 0.82;
    let bodySway = 0;
    let headBow = 0;
    let upperArmAngle = 0.35;
    let lowerArmAngle = 1.1;

    if (activePhase === 'kayon') {
      targetXLeft = -1.65;
      targetXRight = 1.65;
    } else if (activePhase === 'jejer') {
      // Glide in from sides with ±2 deg (0.035 rad) gentle swing
      targetXLeft = -0.82;
      targetXRight = 0.82;
      bodySway = Math.sin(elapsed * 3.2) * 0.035;
      upperArmAngle = 0.28 + Math.sin(elapsed * 3.2) * 0.12;
      lowerArmAngle = 0.95;
    } else if (activePhase === 'sembah' || activePhase === 'closing-sembah') {
      // Both arms raised to chest in Sembah, head bowed ±8 deg (0.14 rad)
      targetXLeft = -0.72;
      targetXRight = 0.72;
      headBow = THREE.MathUtils.degToRad(8);
      upperArmAngle = 0.62;
      lowerArmAngle = 1.68;
      bodySway = Math.sin(elapsed * 1.2) * 0.015;
    } else {
      // Kiprah (slow graceful dance loop: arms swing ±15 deg, body sways ±3 deg, 2s cycle)
      const cycle = (elapsed * Math.PI * 2) / 2.0;
      targetXLeft = -0.78 + Math.sin(cycle * 0.5) * 0.06;
      targetXRight = 0.78 - Math.sin(cycle * 0.5) * 0.06;
      bodySway = Math.sin(cycle) * THREE.MathUtils.degToRad(3);
      headBow = THREE.MathUtils.degToRad(3) + Math.cos(cycle) * 0.03;
      upperArmAngle = 0.4 + Math.sin(cycle) * THREE.MathUtils.degToRad(15);
      lowerArmAngle = 1.25 + Math.cos(cycle) * THREE.MathUtils.degToRad(15);
    }

    // Apply smooth damping to Kamajaya (left, facing +X)
    kamajaya.root.position.x = THREE.MathUtils.lerp(kamajaya.root.position.x, targetXLeft, 0.05);
    kamajaya.bodyGroup.rotation.z = THREE.MathUtils.lerp(kamajaya.bodyGroup.rotation.z, bodySway, 0.08);
    kamajaya.headGroup.rotation.z = THREE.MathUtils.lerp(kamajaya.headGroup.rotation.z, -headBow, 0.08);
    kamajaya.upperArmGroup.rotation.z = THREE.MathUtils.lerp(
      kamajaya.upperArmGroup.rotation.z,
      upperArmAngle,
      0.08
    );
    kamajaya.lowerArmGroup.rotation.z = THREE.MathUtils.lerp(
      kamajaya.lowerArmGroup.rotation.z,
      lowerArmAngle,
      0.08
    );
    // Gapit rod lags slightly behind body like a Dalang's hand
    kamajaya.gapitGroup.rotation.z = THREE.MathUtils.lerp(
      kamajaya.gapitGroup.rotation.z,
      bodySway * 0.65,
      0.04
    );

    // Apply smooth mirrored damping to Kamaratih (right, facing -X)
    kamaratih.root.position.x = THREE.MathUtils.lerp(kamaratih.root.position.x, targetXRight, 0.05);
    kamaratih.bodyGroup.rotation.z = THREE.MathUtils.lerp(kamaratih.bodyGroup.rotation.z, -bodySway, 0.08);
    kamaratih.headGroup.rotation.z = THREE.MathUtils.lerp(kamaratih.headGroup.rotation.z, headBow, 0.08);
    kamaratih.upperArmGroup.rotation.z = THREE.MathUtils.lerp(
      kamaratih.upperArmGroup.rotation.z,
      -upperArmAngle,
      0.08
    );
    kamaratih.lowerArmGroup.rotation.z = THREE.MathUtils.lerp(
      kamaratih.lowerArmGroup.rotation.z,
      -lowerArmAngle,
      0.08
    );
    kamaratih.gapitGroup.rotation.z = THREE.MathUtils.lerp(
      kamaratih.gapitGroup.rotation.z,
      -bodySway * 0.65,
      0.04
    );
  };

  return {
    group,
    kamajaya,
    kamaratih,
    update,
  };
}
