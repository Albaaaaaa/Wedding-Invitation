import * as THREE from 'three';

export interface PengantinHandle {
  group: THREE.Group;
  update: (elapsed: number, coupleStep: number) => void;
  dispose: () => void;
}

function createParangBatikTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2B0910';
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal Parang Rusak stripes in warm ivory (#EADFCB) & sogan (#8E2233)
    ctx.strokeStyle = '#8E2233';
    ctx.lineWidth = 14;
    for (let i = -256; i < 512; i += 42) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(234, 223, 203, 0.55)';
    ctx.lineWidth = 3;
    for (let i = -256; i < 512; i += 42) {
      ctx.beginPath();
      ctx.moveTo(i + 10, 0);
      ctx.lineTo(i + 266, 256);
      ctx.stroke();

      // Mlinjon diamond dots
      for (let d = 0; d < 256; d += 32) {
        ctx.fillStyle = 'rgba(234, 223, 203, 0.65)';
        ctx.fillRect((i + d + 256) % 256, d, 4, 4);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  tex.needsUpdate = true;
  return tex;
}

function createKebayaLaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#4A0E1B';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#7A1B2E';
    ctx.lineWidth = 2;
    for (let y = 32; y < 256; y += 64) {
      for (let x = 32; x < 256; x += 64) {
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Pengantin (`src/scenes/Pengantin.tsx` — Section 5.3 of Revisi Final)
 * Builds the 3D Javanese Bride & Groom seen from behind ascending the 7 Pelaminan stairs:
 *
 * - **Bride (left, x = -0.32m, height 1.62m)**:
 *   - Black Javanese *sanggul* bun with ivory hairpins & hanging *roncen melati* down to her right shoulder
 *     (swaying gently like a pendulum).
 *   - Deep maroon brokat lace *kebaya* (`#4A0E1B`) with tailored silhouette.
 *   - *Kain jarik* batik Parang with a trailing *slepe* cloth extending 1 step down behind her.
 *   - Left hand slightly lifting the side of her jarik (*nyincing*) while climbing; right hand holding the groom's left hand.
 *
 * - **Groom (right, x = +0.32m, height 1.72m)**:
 *   - Batik *blangkon* with the rounded rear *mondholan* bun.
 *   - Jet-black Javanese *beskap* (`#0E0708`).
 *   - Matching *kain jarik* batik Parang.
 *   - *Keris* tucked at his rear waist with a carved wooden hilt (`#2A1410`) and diagonal *warangka* sheath clearly visible from behind.
 *
 * - **Stair Progression (`coupleStep` 0..8)**:
 *   - `0`: Standing at the base of the stairs (`z = 0.28m, y = 0.0m`).
 *   - `1..6`: Climbing steps 1..6 (`y = step * 0.22m`, `z = 0.20 - step * 0.40m`).
 *   - `7..8`: Climbing onto the Dais (`y = 1.54m, z = -3.42m`), turning 180° in backlit silhouette, and sitting on the two bridal chairs.
 */
export function createPengantinScene(): PengantinHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const parangTex = createParangBatikTexture();
  const kebayaTex = createKebayaLaceTexture();
  disposables.push(parangTex, kebayaTex);

  // Shared materials with warm rim sheen (roughness tuned to catch the #F2E3C6 lantern backlight)
  const hairBlackMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#090506'),
    roughness: 0.38,
    metalness: 0.0,
  });
  const skinWarmMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#5C3828'),
    roughness: 0.55,
    metalness: 0.0,
  });
  const kebayaMaroonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#4A0E1B'),
    bumpMap: kebayaTex,
    bumpScale: 0.015,
    roughness: 0.48,
    metalness: 0.0,
  });
  const beskapBlackMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0E0708'),
    roughness: 0.42,
    metalness: 0.0,
  });
  const jarikParangMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#EADFCB'),
    map: parangTex,
    roughness: 0.55,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const melatiIvoryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#F2E3C6'),
    emissive: new THREE.Color('#EADFCB'),
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.0,
  });
  const kerisWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#2A1410'),
    roughness: 0.35,
    metalness: 0.0,
  });
  const kerisSheathMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8E2233'),
    roughness: 0.4,
    metalness: 0.0,
  });
  disposables.push(
    hairBlackMat,
    skinWarmMat,
    kebayaMaroonMat,
    beskapBlackMat,
    jarikParangMat,
    melatiIvoryMat,
    kerisWoodMat,
    kerisSheathMat
  );

  // ============================================================================
  // 1. BRIDE FIGURE (Left, x = -0.32m, total height = 1.62m)
  // ============================================================================
  const brideGroup = new THREE.Group();
  brideGroup.position.set(-0.32, 0, 0);

  // Jarik Skirt (Ankle to Waist: y = 0.02..0.92m)
  const brideSkirtGeo = new THREE.CylinderGeometry(0.135, 0.19, 0.9, 20);
  brideSkirtGeo.scale(1.08, 1, 0.82);
  disposables.push(brideSkirtGeo);
  const brideSkirt = new THREE.Mesh(brideSkirtGeo, jarikParangMat);
  brideSkirt.position.set(0, 0.46, 0);
  brideGroup.add(brideSkirt);

  // Trailing Jarik "Slepe" Train extending 1 step down behind her (+Z when facing -Z)
  const slepeCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.02, 0.86, 0.11),
    new THREE.Vector3(0.03, 0.48, 0.22),
    new THREE.Vector3(0.04, 0.12, 0.34),
    new THREE.Vector3(0.05, -0.18, 0.52)
  );
  const slepeGeo = new THREE.TubeGeometry(slepeCurve, 18, 0.085, 8, false);
  slepeGeo.scale(1.3, 0.28, 1.0);
  disposables.push(slepeGeo);
  const slepeMesh = new THREE.Mesh(slepeGeo, jarikParangMat);
  brideGroup.add(slepeMesh);

  // Maroon Lace Kebaya Torso & Peplum (y = 0.84..1.34m)
  const peplumGeo = new THREE.CylinderGeometry(0.13, 0.175, 0.22, 18);
  peplumGeo.scale(1.1, 1, 0.8);
  const brideTorsoGeo = new THREE.CylinderGeometry(0.155, 0.125, 0.38, 18);
  brideTorsoGeo.scale(1.12, 1, 0.76);
  const shoulderGeo = new THREE.SphereGeometry(0.165, 16, 12);
  shoulderGeo.scale(1.18, 0.45, 0.72);
  disposables.push(peplumGeo, brideTorsoGeo, shoulderGeo);

  const peplum = new THREE.Mesh(peplumGeo, kebayaMaroonMat);
  peplum.position.set(0, 0.88, 0);
  brideGroup.add(peplum);

  const brideTorso = new THREE.Mesh(brideTorsoGeo, kebayaMaroonMat);
  brideTorso.position.set(0, 1.13, 0);
  brideGroup.add(brideTorso);

  const brideShoulders = new THREE.Mesh(shoulderGeo, kebayaMaroonMat);
  brideShoulders.position.set(0, 1.31, 0);
  brideGroup.add(brideShoulders);

  // Neck & Head + Javanese Sanggul Tekuk (y = 1.34..1.62m)
  const brideHeadGroup = new THREE.Group();
  brideHeadGroup.position.set(0, 1.36, 0);
  // Subtle 3 deg tilt toward Groom (right)
  brideHeadGroup.rotation.z = -0.052;

  const neckGeo = new THREE.CylinderGeometry(0.048, 0.056, 0.1, 12);
  const headGeo = new THREE.SphereGeometry(0.105, 18, 16);
  headGeo.scale(0.92, 1.12, 0.96);
  const sanggulGeo = new THREE.SphereGeometry(0.115, 18, 14);
  sanggulGeo.scale(1.22, 0.88, 0.78);
  disposables.push(neckGeo, headGeo, sanggulGeo);

  const brideNeck = new THREE.Mesh(neckGeo, skinWarmMat);
  brideNeck.position.set(0, 0.03, 0);
  brideHeadGroup.add(brideNeck);

  const brideHead = new THREE.Mesh(headGeo, hairBlackMat);
  brideHead.position.set(0, 0.14, 0);
  brideHeadGroup.add(brideHead);

  // Sanggul bun at the back of the head (+Z)
  const sanggul = new THREE.Mesh(sanggulGeo, hairBlackMat);
  sanggul.position.set(0, 0.11, 0.085);
  brideHeadGroup.add(sanggul);

  // Melati Peger & Cundhuk Mentul pins crowning the sanggul
  const cundhukGeo = new THREE.SphereGeometry(0.016, 8, 8);
  disposables.push(cundhukGeo);
  for (let c = -2; c <= 2; c++) {
    const pin = new THREE.Mesh(cundhukGeo, melatiIvoryMat);
    pin.position.set(c * 0.036, 0.24 - Math.abs(c) * 0.012, 0.05);
    brideHeadGroup.add(pin);
  }

  // Hanging Roncen Melati Tiba Dhadha from right side of sanggul down to shoulder (pendulum)
  const brideMelatiPivot = new THREE.Group();
  brideMelatiPivot.position.set(0.085, 0.11, 0.09);
  for (let m = 0; m < 9; m++) {
    const bud = new THREE.Mesh(cundhukGeo, melatiIvoryMat);
    bud.scale.set(0.85, 1.2, 0.85);
    bud.position.set(0, -m * 0.032, 0);
    brideMelatiPivot.add(bud);
  }
  brideHeadGroup.add(brideMelatiPivot);
  brideGroup.add(brideHeadGroup);

  // Bride Left Arm: Slightly lifting the side of her jarik ("nyincing")
  const leftArmCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.17, 1.29, 0),
    new THREE.Vector3(-0.24, 1.08, 0.03),
    new THREE.Vector3(-0.21, 0.88, 0.02),
    new THREE.Vector3(-0.17, 0.76, -0.02)
  );
  const leftArmGeo = new THREE.TubeGeometry(leftArmCurve, 14, 0.036, 8, false);
  disposables.push(leftArmGeo);
  const brideLeftArm = new THREE.Mesh(leftArmGeo, kebayaMaroonMat);
  brideGroup.add(brideLeftArm);

  // Small lifted fold of jarik under her left hand
  const nyincingFoldGeo = new THREE.ConeGeometry(0.065, 0.28, 10);
  disposables.push(nyincingFoldGeo);
  const nyincingFold = new THREE.Mesh(nyincingFoldGeo, jarikParangMat);
  nyincingFold.position.set(-0.18, 0.64, -0.02);
  nyincingFold.rotation.z = 0.18;
  brideGroup.add(nyincingFold);

  // Bride Right Arm: Reaching to clasp Groom's Left Hand at center (x = +0.32 in bride local space)
  const brideRightArmCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.17, 1.29, 0),
    new THREE.Vector3(0.23, 1.1, 0.02),
    new THREE.Vector3(0.28, 0.96, 0.01),
    new THREE.Vector3(0.32, 0.9, 0)
  );
  const brideRightArmGeo = new THREE.TubeGeometry(brideRightArmCurve, 14, 0.035, 8, false);
  disposables.push(brideRightArmGeo);
  const brideRightArm = new THREE.Mesh(brideRightArmGeo, kebayaMaroonMat);
  brideGroup.add(brideRightArm);

  group.add(brideGroup);

  // ============================================================================
  // 2. GROOM FIGURE (Right, x = +0.32m, total height = 1.72m)
  // ============================================================================
  const groomGroup = new THREE.Group();
  groomGroup.position.set(0.32, 0, 0);

  // Groom Jarik (Ankle to Waist: y = 0.02..0.96m)
  const groomJarikGeo = new THREE.CylinderGeometry(0.15, 0.185, 0.94, 20);
  groomJarikGeo.scale(1.06, 1, 0.82);
  disposables.push(groomJarikGeo);
  const groomJarik = new THREE.Mesh(groomJarikGeo, jarikParangMat);
  groomJarik.position.set(0, 0.48, 0);
  groomGroup.add(groomJarik);

  // Groom Jet-Black Beskap Jacket (y = 0.88..1.42m)
  const groomTorsoGeo = new THREE.CylinderGeometry(0.195, 0.155, 0.52, 20);
  groomTorsoGeo.scale(1.16, 1, 0.78);
  const groomShouldersGeo = new THREE.SphereGeometry(0.2, 16, 12);
  groomShouldersGeo.scale(1.22, 0.45, 0.74);
  disposables.push(groomTorsoGeo, groomShouldersGeo);

  const groomTorso = new THREE.Mesh(groomTorsoGeo, beskapBlackMat);
  groomTorso.position.set(0, 1.15, 0);
  groomGroup.add(groomTorso);

  const groomShoulders = new THREE.Mesh(groomShouldersGeo, beskapBlackMat);
  groomShoulders.position.set(0, 1.39, 0);
  groomGroup.add(groomShoulders);

  // KERIS tucked at the back of the Groom's waist (clearly visible from behind!)
  const kerisGroup = new THREE.Group();
  kerisGroup.position.set(0.02, 0.95, 0.135);
  kerisGroup.rotation.z = -0.52; // Angled diagonally across the lower back

  const warangkaBoatGeo = new THREE.BoxGeometry(0.24, 0.055, 0.032);
  const gandarSheathGeo = new THREE.CylinderGeometry(0.018, 0.012, 0.34, 10);
  const ukiranHiltGeo = new THREE.CylinderGeometry(0.022, 0.016, 0.13, 10);
  disposables.push(warangkaBoatGeo, gandarSheathGeo, ukiranHiltGeo);

  const warangka = new THREE.Mesh(warangkaBoatGeo, kerisWoodMat);
  kerisGroup.add(warangka);

  const gandar = new THREE.Mesh(gandarSheathGeo, kerisSheathMat);
  gandar.position.set(0, -0.16, 0);
  kerisGroup.add(gandar);

  const ukiranHilt = new THREE.Mesh(ukiranHiltGeo, kerisWoodMat);
  ukiranHilt.position.set(0.02, 0.08, 0.01);
  ukiranHilt.rotation.z = 0.28;
  kerisGroup.add(ukiranHilt);

  // Melati roncen draped over the keris hilt (Roncen Usus-usus)
  const kerisMelati = new THREE.Mesh(cundhukGeo, melatiIvoryMat);
  kerisMelati.position.set(0.03, 0.12, 0.02);
  kerisGroup.add(kerisMelati);

  groomGroup.add(kerisGroup);

  // Groom Head + Blangkon with rear "Mondholan" bun (y = 1.44..1.72m)
  const groomHeadGroup = new THREE.Group();
  groomHeadGroup.position.set(0, 1.44, 0);
  // Subtle 3 deg tilt toward Bride (left)
  groomHeadGroup.rotation.z = 0.048;

  const groomNeck = new THREE.Mesh(neckGeo, skinWarmMat);
  groomNeck.position.set(0, 0.03, 0);
  groomHeadGroup.add(groomNeck);

  const groomHead = new THREE.Mesh(headGeo, hairBlackMat);
  groomHead.position.set(0, 0.14, 0);
  groomHeadGroup.add(groomHead);

  // Blangkon cap with batik pattern & rear Mondholan bun
  const blangkonCrownGeo = new THREE.CylinderGeometry(0.108, 0.105, 0.11, 18);
  const mondholanGeo = new THREE.SphereGeometry(0.058, 14, 12);
  mondholanGeo.scale(1.15, 0.95, 0.9);
  disposables.push(blangkonCrownGeo, mondholanGeo);

  const blangkonCrown = new THREE.Mesh(blangkonCrownGeo, jarikParangMat);
  blangkonCrown.position.set(0, 0.18, 0);
  blangkonCrown.rotation.x = 0.12;
  groomHeadGroup.add(blangkonCrown);

  const mondholan = new THREE.Mesh(mondholanGeo, jarikParangMat);
  mondholan.position.set(0, 0.13, 0.105);
  groomHeadGroup.add(mondholan);

  groomGroup.add(groomHeadGroup);

  // Groom Left Arm: Meeting Bride's Right Hand at center (x = -0.32 in groom local space)
  const groomLeftArmCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.2, 1.37, 0),
    new THREE.Vector3(-0.25, 1.15, 0.02),
    new THREE.Vector3(-0.29, 0.98, 0.01),
    new THREE.Vector3(-0.32, 0.9, 0)
  );
  const groomLeftArmGeo = new THREE.TubeGeometry(groomLeftArmCurve, 14, 0.04, 8, false);
  disposables.push(groomLeftArmGeo);
  const groomLeftArm = new THREE.Mesh(groomLeftArmGeo, beskapBlackMat);
  groomGroup.add(groomLeftArm);

  // Groom Right Arm: Respectfully poised along his side
  const groomRightArmCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0.2, 1.37, 0),
    new THREE.Vector3(0.25, 1.16, 0.02),
    new THREE.Vector3(0.23, 0.96, 0.01),
    new THREE.Vector3(0.19, 0.84, -0.01)
  );
  const groomRightArmGeo = new THREE.TubeGeometry(groomRightArmCurve, 14, 0.04, 8, false);
  disposables.push(groomRightArmGeo);
  const groomRightArm = new THREE.Mesh(groomRightArmGeo, beskapBlackMat);
  groomGroup.add(groomRightArm);

  // Clasped Hands Sphere at Center (x = 0, y = 0.90m)
  const claspedHandsGeo = new THREE.SphereGeometry(0.045, 12, 12);
  disposables.push(claspedHandsGeo);
  const claspedHands = new THREE.Mesh(claspedHandsGeo, skinWarmMat);
  claspedHands.position.set(0, 0.9, 0);
  group.add(claspedHands);

  group.add(groomGroup);

  return {
    group,
    update: (elapsed: number, coupleStep: number) => {
      // Subtle breathing motion (scale.y += sin(t * 1.4) * 0.004)
      const breath = 1 + Math.sin(elapsed * 1.4) * 0.004;
      brideGroup.scale.y = breath;
      groomGroup.scale.y = 1 + Math.sin(elapsed * 1.4 + 0.4) * 0.004;

      // Pendulum sway on Bride's sanggul roncen melati
      brideMelatiPivot.rotation.z = Math.sin(elapsed * 1.1) * 0.035;
      brideMelatiPivot.rotation.x = Math.cos(elapsed * 0.9) * 0.02;

      // Compute position & pose along the 7 stairs (coupleStep 0..6) and onto the Dais chairs (coupleStep 6..8)
      const clampedStep = Math.max(0, Math.min(8, coupleStep));

      if (clampedStep <= 6) {
        // Ascending steps 0..6: each step rises 0.22m in Y and moves -0.40m in Z
        const fractional = clampedStep - Math.floor(clampedStep);
        // Step arc lift during transition
        const stepArcLift = Math.sin(fractional * Math.PI) * 0.045;

        const y = clampedStep * 0.22 + stepArcLift;
        const z = 0.24 - clampedStep * 0.4;

        group.position.set(0, y, z);
        group.rotation.y = 0; // Seen from behind (facing -Z toward Pelaminan)

        // Subtle alternating walking sway while climbing between steps
        const walkSway = Math.sin(fractional * Math.PI) * 0.03;
        brideGroup.position.set(-0.32, Math.max(0, walkSway), 0);
        groomGroup.position.set(0.32, Math.max(0, -walkSway * 0.8), 0);
        slepeMesh.visible = true;
      } else {
        // coupleStep 6 -> 8 (Section 7 RSVP -> Section 8 Penutup):
        // Couple climbs onto the Dais (y = 1.54m, z = -3.42m), turns 180 deg in silhouette, and sits on the two bridal chairs
        const daisT = (clampedStep - 6) / 2; // 0..1
        const smoothT = daisT * daisT * (3 - 2 * daisT);

        const y = 1.32 + smoothT * (1.54 - 1.32) - smoothT * 0.18; // Lower slightly as they sit on the cushions
        const z = -2.16 + smoothT * (-3.38 - -2.16);

        group.position.set(0, y, z);
        // Turn 180 deg smoothly so they sit facing forward in backlit silhouette on the bridal chairs
        group.rotation.y = smoothT * Math.PI;

        // Spread slightly from ±0.32m to ±0.50m to align with the two bridal chairs (±0.52m)
        const xSpread = 0.32 + smoothT * 0.18;
        brideGroup.position.set(-xSpread, 0, 0);
        groomGroup.position.set(xSpread, 0, 0);
        slepeMesh.visible = smoothT < 0.6;
      }
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
