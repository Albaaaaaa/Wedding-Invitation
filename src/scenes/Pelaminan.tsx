import * as THREE from 'three';
import { createGebyokScene, type GebyokHandle } from './Gebyok';
import { createKembarMayangScene, type KembarMayangHandle } from './KembarMayang';
import { createRoncenScene, type RoncenHandle } from './Roncen';
import { createLenteraScene, type LenteraHandle } from './Lentera';
import { createTiraiScene, type TiraiHandle } from './Tirai';

export interface PelaminanHandle {
  group: THREE.Group;
  update: (elapsed: number, dimFactor: number) => void;
  dispose: () => void;
}

function createKawungCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#6B1424';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle Kawung border motifs along left & right edges of the runner
    ctx.strokeStyle = 'rgba(234, 223, 203, 0.28)';
    ctx.lineWidth = 2;
    for (let y = 32; y < 512; y += 64) {
      for (const x of [44, 468]) {
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, y - 9, 5, 8, 0, 0, Math.PI * 2);
        ctx.ellipse(x, y + 9, 5, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Double ivory border lines
    ctx.strokeStyle = 'rgba(234, 223, 203, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 0, 484, 512);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 2);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Pelaminan (`src/scenes/Pelaminan.tsx` — Section 5.3 of Revisi Final)
 * Builds the complete Javanese Pelaminan stage:
 * - 7 maroon-carpeted steps (width 3.2m, tread 0.40m, riser 0.22m) with ivory trim & Kawung border
 * - Main Dais platform (width 4.0m, depth 3.0m, height 1.54m)
 * - Two high-backed carved dark teak bridal chairs (#1A0C0A) with maroon velvet cushions (#6B1424)
 * - Polished dark stone floor (roughness: 0.4) & subtle ground mist planes
 * - Integrates Gebyok, KembarMayang, Roncen, Lentera, and Tirai
 */
export function createPelaminanScene(): PelaminanHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const carpetTex = createKawungCarpetTexture();
  disposables.push(carpetTex);

  // Materials
  const floorMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0E0608'),
    roughness: 0.4,
    metalness: 0.0,
  });
  const stairTimberMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1A0C0A'),
    roughness: 0.55,
    metalness: 0.0,
  });
  const carpetMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#6B1424'),
    map: carpetTex,
    roughness: 0.78,
    metalness: 0.0,
  });
  const trimIvoryMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#EADFCB'),
    transparent: true,
    opacity: 0.3,
  });
  const chairWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1A0C0A'),
    roughness: 0.48,
    metalness: 0.0,
  });
  const velvetMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#6B1424'),
    roughness: 0.72,
    metalness: 0.0,
  });
  const mistMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#EADFCB'),
    transparent: true,
    opacity: 0.045,
    depthWrite: false,
  });
  disposables.push(
    floorMat,
    stairTimberMat,
    carpetMat,
    trimIvoryMat,
    chairWoodMat,
    velvetMat,
    mistMat
  );

  // 1. Dark Polished Stone Floor
  const floorGeo = new THREE.PlaneGeometry(22, 22);
  disposables.push(floorGeo);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1.5);
  group.add(floor);

  // Subtle Ivory Runner leading to the first step (z = 0..4.5m)
  const approachRunnerGeo = new THREE.PlaneGeometry(2.6, 4.5);
  disposables.push(approachRunnerGeo);
  const approachRunner = new THREE.Mesh(approachRunnerGeo, carpetMat);
  approachRunner.rotation.x = -Math.PI / 2;
  approachRunner.position.set(0, 0.005, 2.25);
  group.add(approachRunner);

  // 2. Seven (7) Pelaminan Stairs (width 3.2m, tread 0.40m, riser 0.22m -> total height 1.54m at z = -2.80m)
  const stepWidth = 3.2;
  const stepTread = 0.4;
  const stepRiser = 0.22;

  const stepTrimGeo = new THREE.BoxGeometry(stepWidth - 0.16, 0.012, 0.018);
  const sideBalustradeGeo = new THREE.BoxGeometry(0.14, stepRiser + 0.08, stepTread + 0.04);
  disposables.push(stepTrimGeo, sideBalustradeGeo);

  for (let i = 0; i < 7; i++) {
    const h = (i + 1) * stepRiser;
    const zCenter = -(i * stepTread + stepTread * 0.5);

    // Solid step block
    const blockGeo = new THREE.BoxGeometry(stepWidth, h, stepTread);
    disposables.push(blockGeo);
    const block = new THREE.Mesh(blockGeo, stairTimberMat);
    block.position.set(0, h / 2, zCenter);
    group.add(block);

    // Maroon carpet runner covering top & front riser of the step
    const carpetTopGeo = new THREE.BoxGeometry(stepWidth - 0.28, 0.016, stepTread + 0.01);
    disposables.push(carpetTopGeo);
    const carpetTop = new THREE.Mesh(carpetTopGeo, carpetMat);
    carpetTop.position.set(0, h + 0.008, zCenter);
    group.add(carpetTop);

    // Subtle ivory nosing line (30% opacity) along front edge of each step
    const trimLine = new THREE.Mesh(stepTrimGeo, trimIvoryMat);
    trimLine.position.set(0, h + 0.015, zCenter + stepTread * 0.5);
    group.add(trimLine);

    // Low carved teak side curbs flanking the 3.2m stairs
    const leftCurb = new THREE.Mesh(sideBalustradeGeo, stairTimberMat);
    leftCurb.position.set(-stepWidth / 2 - 0.06, h, zCenter);
    group.add(leftCurb);

    const rightCurb = new THREE.Mesh(sideBalustradeGeo, stairTimberMat);
    rightCurb.position.set(stepWidth / 2 + 0.06, h, zCenter);
    group.add(rightCurb);
  }

  // 3. Main Pelaminan Dais Platform (width 4.0m, depth 3.0m, height 1.54m, z = -2.80m..-5.80m)
  const daisHeight = 1.54;
  const daisGeo = new THREE.BoxGeometry(4.4, daisHeight, 3.0);
  const daisCarpetGeo = new THREE.BoxGeometry(4.1, 0.02, 2.9);
  const daisFrontTrimGeo = new THREE.BoxGeometry(4.2, 0.025, 0.03);
  disposables.push(daisGeo, daisCarpetGeo, daisFrontTrimGeo);

  const daisMesh = new THREE.Mesh(daisGeo, stairTimberMat);
  daisMesh.position.set(0, daisHeight / 2, -4.3);
  group.add(daisMesh);

  const daisCarpet = new THREE.Mesh(daisCarpetGeo, carpetMat);
  daisCarpet.position.set(0, daisHeight + 0.01, -4.3);
  group.add(daisCarpet);

  const daisTrim = new THREE.Mesh(daisFrontTrimGeo, trimIvoryMat);
  daisTrim.position.set(0, daisHeight + 0.02, -2.81);
  group.add(daisTrim);

  // 4. Two High-Backed Carved Bridal Chairs on the Dais (x = ±0.52m, y = 1.54m, z = -3.48m)
  function createBridalChair(): THREE.Group {
    const chair = new THREE.Group();

    const seatBaseGeo = new THREE.BoxGeometry(0.68, 0.12, 0.58);
    const cushionGeo = new THREE.BoxGeometry(0.62, 0.1, 0.52);
    const legGeo = new THREE.BoxGeometry(0.07, 0.42, 0.07);
    const armGeo = new THREE.BoxGeometry(0.07, 0.26, 0.54);
    const backFrameGeo = new THREE.BoxGeometry(0.7, 1.18, 0.08);
    const backPadGeo = new THREE.BoxGeometry(0.54, 0.92, 0.09);
    const crownArchGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16, 1, false, 0, Math.PI);
    disposables.push(
      seatBaseGeo,
      cushionGeo,
      legGeo,
      armGeo,
      backFrameGeo,
      backPadGeo,
      crownArchGeo
    );

    // 4 Carved Legs
    for (const lx of [-0.28, 0.28]) {
      for (const lz of [-0.23, 0.23]) {
        const leg = new THREE.Mesh(legGeo, chairWoodMat);
        leg.position.set(lx, 0.21, lz);
        chair.add(leg);
      }
    }

    const seatBase = new THREE.Mesh(seatBaseGeo, chairWoodMat);
    seatBase.position.set(0, 0.44, 0);
    chair.add(seatBase);

    const cushion = new THREE.Mesh(cushionGeo, velvetMat);
    cushion.position.set(0, 0.52, 0.01);
    chair.add(cushion);

    // Armrests
    for (const ax of [-0.3, 0.3]) {
      const arm = new THREE.Mesh(armGeo, chairWoodMat);
      arm.position.set(ax, 0.62, 0);
      chair.add(arm);
    }

    // High Carved Backrest
    const backFrame = new THREE.Mesh(backFrameGeo, chairWoodMat);
    backFrame.position.set(0, 1.06, -0.25);
    chair.add(backFrame);

    const backPad = new THREE.Mesh(backPadGeo, velvetMat);
    backPad.position.set(0, 1.04, -0.23);
    chair.add(backPad);

    const crown = new THREE.Mesh(crownArchGeo, chairWoodMat);
    crown.rotation.x = Math.PI / 2;
    crown.rotation.y = Math.PI / 2;
    crown.position.set(0, 1.65, -0.25);
    chair.add(crown);

    return chair;
  }

  const brideChair = createBridalChair();
  brideChair.position.set(-0.52, daisHeight, -3.48);
  group.add(brideChair);

  const groomChair = createBridalChair();
  groomChair.position.set(0.52, daisHeight, -3.48);
  group.add(groomChair);

  // 5. Subtle Ground Mist Planes floating over the floor & lower stairs
  const mistGeo = new THREE.PlaneGeometry(9.0, 4.5);
  disposables.push(mistGeo);
  const mistLayer1 = new THREE.Mesh(mistGeo, mistMat);
  mistLayer1.rotation.x = -Math.PI / 2;
  mistLayer1.position.set(0, 0.08, 0.6);
  group.add(mistLayer1);

  const mistLayer2 = new THREE.Mesh(mistGeo, mistMat);
  mistLayer2.rotation.x = -Math.PI / 2;
  mistLayer2.position.set(0, 0.52, -0.9);
  group.add(mistLayer2);

  // 6. Sub-assemblies: Gebyok, KembarMayang, Roncen, Lentera, Tirai
  const gebyok: GebyokHandle = createGebyokScene(daisHeight, -4.25);
  group.add(gebyok.group);

  const kembarMayang: KembarMayangHandle = createKembarMayangScene(daisHeight, -2.8);
  group.add(kembarMayang.group);

  const roncen: RoncenHandle = createRoncenScene();
  group.add(roncen.group);

  const lentera: LenteraHandle = createLenteraScene();
  group.add(lentera.group);

  const tirai: TiraiHandle = createTiraiScene(daisHeight);
  group.add(tirai.group);

  return {
    group,
    update: (elapsed: number, dimFactor: number) => {
      gebyok.update(elapsed, dimFactor);
      kembarMayang.update(elapsed);
      roncen.update(elapsed);
      lentera.update(elapsed, dimFactor);
      tirai.update(elapsed);

      mistLayer1.position.x = Math.sin(elapsed * 0.25) * 0.35;
      mistLayer2.position.x = Math.cos(elapsed * 0.2) * -0.3;
    },
    dispose: () => {
      gebyok.dispose();
      kembarMayang.dispose();
      roncen.dispose();
      lentera.dispose();
      tirai.dispose();
      for (const d of disposables) d.dispose();
    },
  };
}
