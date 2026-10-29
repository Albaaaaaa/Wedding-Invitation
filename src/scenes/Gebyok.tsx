import * as THREE from 'three';

export interface GebyokHandle {
  group: THREE.Group;
  archGlowMat: THREE.MeshBasicMaterial;
  update: (elapsed: number, dimFactor: number) => void;
  dispose: () => void;
}

function createGebyokCarvedTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#18100E';
    ctx.fillRect(0, 0, 1024, 512);

    // Draw Kawung medallions across the side panels
    ctx.strokeStyle = '#9E8C7A';
    ctx.fillStyle = '#524238';
    ctx.lineWidth = 2.5;
    for (let y = 32; y < 480; y += 64) {
      for (let x = 32; x < 992; x += 64) {
        // Leave central arch opening cleaner
        if (x > 360 && x < 664 && y > 110) continue;
        ctx.beginPath();
        ctx.arc(x, y, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(x, y - 11, 6, 10, 0, 0, Math.PI * 2);
        ctx.ellipse(x, y + 11, 6, 10, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 11, y, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 11, y, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Load SVG height map asynchronously onto the canvas for crisp arch & lung-lungan relief
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1024, 512);
      tex.needsUpdate = true;
    };
    img.src = '/assets/gebyok-relief.svg';
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Gebyok (`src/scenes/Gebyok.tsx` — Section 5.3 of Revisi Final)
 * 6.0m wide x 4.5m tall carved dark reddish-brown teakwood (#1A0C0A) Gebyok wall
 * behind the Pelaminan dais, featuring:
 * - 4 Kawung & Lung-lungan carved side panels
 * - Carved Soko Gebyok pillars
 * - Central arched Gapura doorway backlit by warm ivory light (#F2E3C6)
 * - Small Kayon / Pohon Hayat ornament mounted at the peak of the central arch
 */
export function createGebyokScene(daisHeight = 1.54, daisBackZ = -4.25): GebyokHandle {
  const group = new THREE.Group();
  group.position.set(0, daisHeight, daisBackZ);

  const disposables: Array<{ dispose: () => void }> = [];
  const reliefTex = createGebyokCarvedTexture();
  disposables.push(reliefTex);

  // Dark reddish-brown carved teakwood (#1A0C0A) — strictly non-metallic
  const teakMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1A0C0A'),
    roughness: 0.58,
    metalness: 0.0,
    bumpMap: reliefTex,
    bumpScale: 0.045,
  });
  disposables.push(teakMat);

  const deepCarveMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#281210'),
    roughness: 0.52,
    metalness: 0.0,
    bumpMap: reliefTex,
    bumpScale: 0.06,
  });
  disposables.push(deepCarveMat);

  // Ivory subtle wood-highlight trim (non-metallic)
  const ivoryAccentMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#EADFCB'),
    transparent: true,
    opacity: 0.28,
  });
  disposables.push(ivoryAccentMat);

  // 1. Top Horizontal Beam (Blandar Ukir Gebyok, width 6.0m, height 0.45m, at y = 4.25m)
  const topBeamGeo = new THREE.BoxGeometry(6.0, 0.46, 0.24);
  disposables.push(topBeamGeo);
  const topBeam = new THREE.Mesh(topBeamGeo, deepCarveMat);
  topBeam.position.set(0, 4.27, 0);
  group.add(topBeam);

  const corniceGeo = new THREE.BoxGeometry(6.24, 0.14, 0.34);
  disposables.push(corniceGeo);
  const cornice = new THREE.Mesh(corniceGeo, teakMat);
  cornice.position.set(0, 4.54, 0.04);
  group.add(cornice);

  // 2. Left & Right Carved Wing Panels (4 panels: x = ±2.45m, ±1.48m, height 4.1m)
  const panelGeo = new THREE.BoxGeometry(0.88, 4.05, 0.12);
  const panelFrameGeo = new THREE.BoxGeometry(0.94, 4.12, 0.16);
  disposables.push(panelGeo, panelFrameGeo);

  const panelXPositions = [-2.46, -1.48, 1.48, 2.46];
  for (const px of panelXPositions) {
    const frame = new THREE.Mesh(panelFrameGeo, teakMat);
    frame.position.set(px, 2.04, 0);
    group.add(frame);

    const panel = new THREE.Mesh(panelGeo, deepCarveMat);
    panel.position.set(px, 2.04, 0.03);
    group.add(panel);
  }

  // 3. Four Vertical Soko Gebyok Pillars (x = ±2.96m outer, x = ±0.96m flanking the central Gapura arch)
  const pillarGeo = new THREE.BoxGeometry(0.18, 4.45, 0.26);
  disposables.push(pillarGeo);
  for (const sx of [-2.96, -0.96, 0.96, 2.96]) {
    const pillar = new THREE.Mesh(pillarGeo, teakMat);
    pillar.position.set(sx, 2.22, 0.06);
    group.add(pillar);
  }

  // 4. Central Gapura Archway (spanning x = -0.96m .. +0.96m, height up to y = 3.95m)
  const archShape = new THREE.Shape();
  archShape.moveTo(-0.98, 0);
  archShape.lineTo(-0.98, 4.05);
  archShape.lineTo(0.98, 4.05);
  archShape.lineTo(0.98, 0);
  archShape.lineTo(0.78, 0);
  archShape.lineTo(0.78, 2.45);
  archShape.bezierCurveTo(0.78, 3.25, 0.42, 3.68, 0, 3.82);
  archShape.bezierCurveTo(-0.42, 3.68, -0.78, 3.25, -0.78, 2.45);
  archShape.lineTo(-0.78, 0);
  archShape.closePath();

  const archGeo = new THREE.ExtrudeGeometry(archShape, {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.03,
    bevelThickness: 0.03,
  });
  disposables.push(archGeo);
  const archMesh = new THREE.Mesh(archGeo, deepCarveMat);
  archMesh.position.set(0, 0, 0.02);
  group.add(archMesh);

  // Glowing ivory rim along the inner Gapura arch curve
  const archRimCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(-0.78, 2.45, 0.22),
    new THREE.Vector3(-0.65, 3.65, 0.22),
    new THREE.Vector3(0.65, 3.65, 0.22),
    new THREE.Vector3(0.78, 2.45, 0.22)
  );
  const archRimGeo = new THREE.TubeGeometry(archRimCurve, 36, 0.016, 6, false);
  disposables.push(archRimGeo);
  const archRim = new THREE.Mesh(archRimGeo, ivoryAccentMat);
  group.add(archRim);

  // Backlit inner sanctuary recess behind the Gapura arch (creates dramatic silhouette contrast for the couple!)
  const recessGeo = new THREE.PlaneGeometry(1.9, 4.0);
  disposables.push(recessGeo);
  const archGlowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#F2E3C6'),
    transparent: true,
    opacity: 0.22,
  });
  disposables.push(archGlowMat);
  const recessMesh = new THREE.Mesh(recessGeo, archGlowMat);
  recessMesh.position.set(0, 2.0, -0.12);
  group.add(recessMesh);

  // 5. Small Kayon / Pohon Hayat Crown Ornament at the Peak of the Gebyok Arch (y = 3.92m)
  const kayonShape = new THREE.Shape();
  kayonShape.moveTo(0, -0.34);
  kayonShape.bezierCurveTo(0.22, -0.26, 0.28, -0.02, 0.2, 0.18);
  kayonShape.bezierCurveTo(0.12, 0.34, 0.04, 0.44, 0, 0.54);
  kayonShape.bezierCurveTo(-0.04, 0.44, -0.12, 0.34, -0.2, 0.18);
  kayonShape.bezierCurveTo(-0.28, -0.02, -0.22, -0.26, 0, -0.34);

  const kayonGeo = new THREE.ExtrudeGeometry(kayonShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  });
  disposables.push(kayonGeo);
  const kayonCrown = new THREE.Mesh(kayonGeo, deepCarveMat);
  kayonCrown.position.set(0, 3.88, 0.2);
  group.add(kayonCrown);

  const kayonOutlineGeo = new THREE.EdgesGeometry(kayonGeo, 15);
  disposables.push(kayonOutlineGeo);
  const kayonOutline = new THREE.LineSegments(
    kayonOutlineGeo,
    new THREE.LineBasicMaterial({
      color: new THREE.Color('#EADFCB'),
      transparent: true,
      opacity: 0.48,
    })
  );
  kayonOutline.position.copy(kayonCrown.position);
  group.add(kayonOutline);

  return {
    group,
    archGlowMat,
    update: (elapsed: number, dimFactor: number) => {
      const pulse = Math.sin(elapsed * 1.3) * 0.025;
      archGlowMat.opacity = Math.max(0.06, (0.22 + pulse) * (1 - dimFactor * 0.55));
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
