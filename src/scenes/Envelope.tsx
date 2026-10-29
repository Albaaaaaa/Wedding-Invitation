import * as THREE from 'three';
import { createWaxSealRig, type WaxSealRig } from './WaxSeal';
import type { EnvelopeTimelineState } from '../utils/invitationLogic';

export interface EnvelopeRig {
  group: THREE.Group;
  leftPanelGroup: THREE.Group;
  rightPanelGroup: THREE.Group;
  topFlapGroup: THREE.Group;
  bottomFlapGroup: THREE.Group;
  innerGlowMesh: THREE.Mesh;
  sweepLight: THREE.PointLight;
  waxSeal: WaxSealRig;
  updateGuestTexture: (guestName: string, initials: string) => void;
  update: (
    elapsed: number,
    timeline: EnvelopeTimelineState,
    dragProgress: number,
    pointerX: number,
    pointerY: number
  ) => void;
}

/**
 * Generates offscreen 1024x1024 bumpMap with Melati + Lung-lungan creeping floral border
 * (center left clean as specified in Section 5.1) plus debossed guest name & couple initials.
 */
function createEnvelopeReliefBumpTexture(guestName: string, initials: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base cotton paper micro-grain
    ctx.fillStyle = '#303030';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 4000; i++) {
      const x = (i * 73) % 1024;
      const y = (i * 137) % 1024;
      ctx.fillStyle = i % 2 === 0 ? '#3A3A3A' : '#262626';
      ctx.fillRect(x, y, 2, 2);
    }

    // Creeping Lung-lungan & Melati relief along edges (center stays clean)
    const drawCornerVine = (cx: number, cy: number, sx: number, sy: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, sy);

      ctx.strokeStyle = '#C8C8C8';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(45, 440);
      ctx.bezierCurveTo(48, 260, 110, 130, 240, 72);
      ctx.bezierCurveTo(320, 38, 410, 44, 480, 52);
      ctx.stroke();

      // Secondary tendril curls
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#A8A8A8';
      const curls = [
        [90, 320, 150, 270, 125, 210],
        [185, 165, 250, 145, 230, 95],
        [330, 82, 380, 105, 405, 65],
      ];
      for (const [x0, y0, x1, y1, x2, y2] of curls) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(x1, y1, x2, y2);
        ctx.stroke();
      }

      // Melati 5-petal blossoms along border
      const flowers = [
        [120, 215, 1.0],
        [225, 102, 1.15],
        [385, 70, 0.9],
        [75, 360, 0.85],
      ];
      for (const [fx, fy, sc] of flowers) {
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(sc, sc);
        ctx.fillStyle = '#E6E6E6';
        for (let p = 0; p < 5; p++) {
          ctx.save();
          ctx.rotate((p * Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.arc(0, -14, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    };

    drawCornerVine(0, 0, 1, 1);
    drawCornerVine(1024, 0, -1, 1);
    drawCornerVine(0, 1024, 1, -1);
    drawCornerVine(1024, 1024, -1, -1);

    // Embossed Couple Initials at Top
    ctx.fillStyle = '#ECECEC';
    ctx.font = '600 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(initials, 512, 150);

    // Debossed "Kepada Yth." & Guest Name at Bottom
    ctx.fillStyle = '#DCDCDC';
    ctx.font = 'italic 24px Georgia, serif';
    ctx.fillText('Kepada Yth.', 512, 855);
    ctx.font = '600 30px Georgia, serif';
    ctx.fillText(guestName.slice(0, 36), 512, 898);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a scalloped diagonal side flap with wave radius ~0.12 and dashed stitching line
 */
function createScallopedSidePanel(
  isLeft: boolean,
  width: number,
  height: number,
  bumpMap: THREE.Texture
): THREE.Group {
  const panelGroup = new THREE.Group();
  const halfW = width / 2;
  const halfH = height / 2;

  const shape = new THREE.Shape();
  const apexX = isLeft ? 0.14 : -0.14; // Left overlaps right at the center X-intersection
  const baseX = isLeft ? -halfW : halfW;

  shape.moveTo(baseX, halfH);

  // Scalloped diagonal from top corner to center apex
  const waveCount = 7;
  for (let i = 0; i < waveCount; i++) {
    const t1 = (i + 0.5) / waveCount;
    const t2 = (i + 1) / waveCount;
    const mx = THREE.MathUtils.lerp(baseX, apexX, t1) + (isLeft ? 0.045 : -0.045);
    const my = THREE.MathUtils.lerp(halfH, 0, t1);
    const ex = THREE.MathUtils.lerp(baseX, apexX, t2);
    const ey = THREE.MathUtils.lerp(halfH, 0, t2);
    shape.quadraticCurveTo(mx, my, ex, ey);
  }

  // Scalloped diagonal from center apex to bottom corner
  for (let i = 0; i < waveCount; i++) {
    const t1 = (i + 0.5) / waveCount;
    const t2 = (i + 1) / waveCount;
    const mx = THREE.MathUtils.lerp(apexX, baseX, t1) + (isLeft ? 0.045 : -0.045);
    const my = THREE.MathUtils.lerp(0, -halfH, t1);
    const ex = THREE.MathUtils.lerp(apexX, baseX, t2);
    const ey = THREE.MathUtils.lerp(0, -halfH, t2);
    shape.quadraticCurveTo(mx, my, ex, ey);
  }

  shape.lineTo(baseX, halfH);

  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });

  // Normalize UVs to 0..1 across envelope bounds so the bumpMap aligns
  const posAttr = extrudeGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    uvs[i * 2] = (vx + halfW) / width;
    uvs[i * 2 + 1] = (vy + halfH) / height;
  }
  extrudeGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const mat = new THREE.MeshStandardMaterial({
    color: isLeft ? 0x6b1424 : 0x5c101e,
    roughness: 0.85,
    metalness: 0.02,
    bumpMap,
    bumpScale: 0.06,
  });

  const mesh = new THREE.Mesh(extrudeGeo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  panelGroup.add(mesh);

  // Dashed stitching line offset 0.03 inside the scalloped edge (Section 5.1)
  const stitchPoints: THREE.Vector3[] = [];
  const offsetInward = isLeft ? -0.035 : 0.035;
  const totalPts = 56;
  for (let i = 0; i <= totalPts; i++) {
    const u = i / totalPts;
    const isUpper = u <= 0.5;
    const localT = isUpper ? u * 2 : (u - 0.5) * 2;
    const sx = isUpper
      ? THREE.MathUtils.lerp(baseX, apexX, localT)
      : THREE.MathUtils.lerp(apexX, baseX, localT);
    const sy = isUpper
      ? THREE.MathUtils.lerp(halfH, 0, localT)
      : THREE.MathUtils.lerp(0, -halfH, localT);
    const wave = Math.sin(localT * waveCount * Math.PI) * (isLeft ? 0.025 : -0.025);
    stitchPoints.push(new THREE.Vector3(sx + wave + offsetInward, sy, 0.022));
  }

  const lineGeo = new THREE.BufferGeometry().setFromPoints(stitchPoints);
  const lineMat = new THREE.LineDashedMaterial({
    color: 0xeadfcb,
    transparent: true,
    opacity: 0.45,
    dashSize: 0.025,
    gapSize: 0.02,
  });
  const stitchLine = new THREE.Line(lineGeo, lineMat);
  stitchLine.computeLineDistances();
  panelGroup.add(stitchLine);

  return panelGroup;
}

export function createEnvelopeRig(
  initialSealStyle: 'gold' | 'maroon',
  guestName: string,
  initials: string
): EnvelopeRig {
  const group = new THREE.Group();
  group.name = 'EnvelopeRoot';
  group.position.set(0, 1.65, 6.2); // Positioned in front of Pelaminan Hero camera (z=5.4), Cover camera at z=8.9

  // Sized so height is ~88% of viewport at z=3.3 (camera z=6, FOV 38 -> frustum height ~1.86)
  const envWidth = 1.32;
  const envHeight = 1.66;
  const halfW = envWidth / 2;
  const halfH = envHeight / 2;

  const bumpMap = createEnvelopeReliefBumpTexture(guestName, initials);

  // Outer shadow frame backing so envelope edges stand out cleanly against hitam-kelir
  const backingGeo = new THREE.PlaneGeometry(envWidth * 1.01, envHeight * 1.01);
  const backingMat = new THREE.MeshBasicMaterial({
    color: 0x1a0409,
    transparent: true,
    opacity: 0.9,
  });
  const backingMesh = new THREE.Mesh(backingGeo, backingMat);
  backingMesh.position.z = -0.05;
  group.add(backingMesh);

  // Layer 1: Warm ivory emissive plane right behind the X-slit (Section 5.1 Layer 1)
  const innerGlowGeo = new THREE.PlaneGeometry(envWidth * 0.96, envHeight * 0.96);
  const innerGlowMat = new THREE.MeshBasicMaterial({
    color: 0xf2e3c6,
    transparent: true,
    opacity: 0.12,
  });
  const innerGlowMesh = new THREE.Mesh(innerGlowGeo, innerGlowMat);
  innerGlowMesh.position.z = -0.03;
  group.add(innerGlowMesh);

  // Layer 2: Top & Bottom triangular folds (maroon-pekat #3B0A14, hinged at outer top/bottom edges)
  const flapMat = new THREE.MeshStandardMaterial({
    color: 0x3b0a14,
    roughness: 0.86,
    metalness: 0.02,
    bumpMap,
    bumpScale: 0.04,
    side: THREE.DoubleSide,
  });

  const topFlapGroup = new THREE.Group();
  topFlapGroup.position.set(0, halfH, -0.012);
  const topShape = new THREE.Shape();
  topShape.moveTo(-halfW, 0);
  topShape.lineTo(halfW, 0);
  topShape.lineTo(0, -halfH * 1.04);
  topShape.closePath();
  const topFlapMesh = new THREE.Mesh(new THREE.ShapeGeometry(topShape), flapMat);
  topFlapGroup.add(topFlapMesh);
  group.add(topFlapGroup);

  const bottomFlapGroup = new THREE.Group();
  bottomFlapGroup.position.set(0, -halfH, -0.01);
  const botShape = new THREE.Shape();
  botShape.moveTo(-halfW, 0);
  botShape.lineTo(halfW, 0);
  botShape.lineTo(0, halfH * 1.04);
  botShape.closePath();
  const botFlapMesh = new THREE.Mesh(new THREE.ShapeGeometry(botShape), flapMat);
  bottomFlapGroup.add(botFlapMesh);
  group.add(bottomFlapGroup);

  // Layer 3: Right scalloped panel (#6B1424, slightly behind left panel)
  const rightPanelGroup = createScallopedSidePanel(false, envWidth, envHeight, bumpMap);
  rightPanelGroup.position.z = 0.005;
  group.add(rightPanelGroup);

  // Layer 4: Left scalloped panel overlapping right panel at center, carrying the Wax Seal
  const leftPanelGroup = createScallopedSidePanel(true, envWidth, envHeight, bumpMap);
  leftPanelGroup.position.z = 0.025;
  group.add(leftPanelGroup);

  // Layer 5: Wax Seal attached to the Left Panel at the center intersection
  const waxSeal = createWaxSealRig(initialSealStyle);
  waxSeal.group.position.set(0.02, 0, 0.03);
  leftPanelGroup.add(waxSeal.group);

  // Slow light sweep across the relief every 6 seconds (Section 5.1 idle behavior)
  const sweepLight = new THREE.PointLight(0xf2e3c6, 0.75, 4.5);
  sweepLight.position.set(-1.1, 0.9, 0.85);
  group.add(sweepLight);

  const updateGuestTexture = (newGuestName: string, newInitials: string) => {
    const newBump = createEnvelopeReliefBumpTexture(newGuestName, newInitials);
    leftPanelGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (m.bumpMap) {
          m.bumpMap.dispose();
          m.bumpMap = newBump;
          m.needsUpdate = true;
        }
      }
    });
  };

  const update = (
    elapsed: number,
    timeline: EnvelopeTimelineState,
    dragProgress: number,
    pointerX: number,
    pointerY: number
  ) => {
    // Combine timeline progress with interactive finger/cursor drag progress
    const leftP = Math.max(timeline.leftPanelProgress, dragProgress * 0.65);
    const rightP = Math.max(timeline.rightPanelProgress, Math.max(0, dragProgress - 0.1) * 0.6);

    // Idle breathing rotation (max 1.5 deg = 0.026 rad) following cursor/gyro with damping
    const idleFactor = 1 - leftP;
    const targetRotY = (pointerX * 0.026 + Math.sin(elapsed * 0.8) * 0.008) * idleFactor;
    const targetRotX = (-pointerY * 0.026 + Math.cos(elapsed * 0.7) * 0.008) * idleFactor;
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.08);
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.08);

    // 6-second light sweep across embossed relief
    const sweepPhase = ((elapsed % 6) / 6) * Math.PI * 2;
    sweepLight.position.x = Math.sin(sweepPhase) * 1.8;
    sweepLight.position.y = Math.cos(sweepPhase * 0.5) * 1.4;
    sweepLight.intensity = 1.25 * timeline.envelopeFade;

    // Left panel slides left & rotates (Y +12 deg, Z -6 deg) carrying the seal
    leftPanelGroup.position.x = -leftP * 2.35;
    leftPanelGroup.rotation.y = leftP * THREE.MathUtils.degToRad(12);
    leftPanelGroup.rotation.z = leftP * THREE.MathUtils.degToRad(-6);

    // Right panel slides right & rotates
    rightPanelGroup.position.x = rightP * 2.35;
    rightPanelGroup.rotation.y = rightP * THREE.MathUtils.degToRad(-12);
    rightPanelGroup.rotation.z = rightP * THREE.MathUtils.degToRad(6);

    // Top & bottom triangular flaps fold outward (±70 deg)
    const foldRad = timeline.flapFoldProgress * THREE.MathUtils.degToRad(70);
    topFlapGroup.rotation.x = -foldRad;
    bottomFlapGroup.rotation.x = foldRad;

    // Warm ivory light shines from X-slit during opening
    const glowMat = innerGlowMesh.material as THREE.MeshBasicMaterial;
    glowMat.opacity = Math.max(0.08, timeline.slitGlow * 0.92) * timeline.envelopeFade;

    // Update WaxSeal
    waxSeal.group.position.z = 0.045 + timeline.sealLiftZ;
    waxSeal.update(
      elapsed,
      timeline.sealPressScale,
      timeline.ringExpand,
      timeline.ringOpacity * timeline.envelopeFade
    );

    group.visible = timeline.envelopeFade > 0.01;
  };

  return {
    group,
    leftPanelGroup,
    rightPanelGroup,
    topFlapGroup,
    bottomFlapGroup,
    innerGlowMesh,
    sweepLight,
    waxSeal,
    updateGuestTexture,
    update,
  };
}
