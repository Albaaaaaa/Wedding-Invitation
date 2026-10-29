import * as THREE from 'three';

export interface PendopoRig {
  group: THREE.Group;
  lanternLights: THREE.PointLight[];
  update: (elapsed: number, dimFactor: number) => void;
}

function createKawungFloorTexture(): { map: THREE.CanvasTexture; bump: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2A070E';
    ctx.fillRect(0, 0, 256, 256);

    // Tile joint lines
    ctx.strokeStyle = '#4A0E1A';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 252);

    // Four Kawung lobes in tone-on-tone maroon
    ctx.fillStyle = '#3B0A14';
    ctx.strokeStyle = 'rgba(234, 223, 203, 0.18)';
    ctx.lineWidth = 2;

    const lobes = [
      [64, 64],
      [192, 64],
      [64, 192],
      [192, 192],
    ];
    for (const [cx, cy] of lobes) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 48, 28, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 48, 28, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 28);

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(8, 28);

  return { map, bump };
}

/**
 * Procedural Royal Javanese Pendopo Corridor (Section 5.4)
 * - Two rows of carved Saka Guru pillars (each built as a composite 5-part THREE.Group:
 *   Umpak stone base, Umpak collar, main teakwood shaft, Bahurekso capital bracket, and top beam)
 * - Kawung tiled floor with contact shadow discs beneath every pillar
 * - Hanging warm Pendopo lanterns along the central aisle
 */
export function createPendopoRig(): PendopoRig {
  const group = new THREE.Group();
  group.name = 'PendopoCorridor';

  const { map: floorMap, bump: floorBump } = createKawungFloorTexture();

  // Floor with Kawung motif
  const floorGeo = new THREE.PlaneGeometry(14, 34);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: floorMap,
    bumpMap: floorBump,
    bumpScale: 0.015,
    roughness: 0.68,
    metalness: 0.08,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, 0, 13);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Materials for composite Saka Guru pillars (varied roughness per 3D craft rules)
  const umpakStoneMat = new THREE.MeshStandardMaterial({
    color: 0x1a080c,
    roughness: 0.88,
    metalness: 0.04,
  });
  const pillarWoodMat = new THREE.MeshStandardMaterial({
    color: 0x3b0a14,
    roughness: 0.52,
    metalness: 0.08,
  });
  const trimWoodMat = new THREE.MeshStandardMaterial({
    color: 0x6b1424,
    roughness: 0.35,
    metalness: 0.12,
  });
  const contactShadowMat = new THREE.MeshBasicMaterial({
    color: 0x050203,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });

  // Shared geometries for pillars
  const shadowDiscGeo = new THREE.CircleGeometry(0.55, 20);
  shadowDiscGeo.rotateX(-Math.PI / 2);
  const umpakBaseGeo = new THREE.BoxGeometry(0.52, 0.28, 0.52);
  const umpakNeckGeo = new THREE.BoxGeometry(0.38, 0.16, 0.38);
  const shaftGeo = new THREE.BoxGeometry(0.28, 3.4, 0.28);
  const capitalGeo = new THREE.BoxGeometry(0.46, 0.22, 0.46);
  const corbelGeo = new THREE.BoxGeometry(0.76, 0.16, 0.34);

  const zStations = [3.5, 7.0, 10.5, 14.0, 17.5, 21.0, 24.5];
  const xColumns = [-2.55, 2.55];

  for (const zPos of zStations) {
    for (const xPos of xColumns) {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(xPos, 0, zPos);

      // 1. Grounded contact shadow disc (offset y +0.015 so no Z-fighting)
      const shadowDisc = new THREE.Mesh(shadowDiscGeo, contactShadowMat);
      shadowDisc.position.y = 0.015;
      pillarGroup.add(shadowDisc);

      // 2. Stepped Umpak stone base
      const umpakBase = new THREE.Mesh(umpakBaseGeo, umpakStoneMat);
      umpakBase.position.y = 0.14;
      pillarGroup.add(umpakBase);

      const umpakNeck = new THREE.Mesh(umpakNeckGeo, trimWoodMat);
      umpakNeck.position.y = 0.36;
      pillarGroup.add(umpakNeck);

      // 3. Main Saka Guru teak shaft
      const shaft = new THREE.Mesh(shaftGeo, pillarWoodMat);
      shaft.position.y = 2.14;
      pillarGroup.add(shaft);

      // 4. Bahurekso stepped capital & bracket
      const capital = new THREE.Mesh(capitalGeo, trimWoodMat);
      capital.position.y = 3.92;
      pillarGroup.add(capital);

      const corbel = new THREE.Mesh(corbelGeo, pillarWoodMat);
      corbel.position.y = 4.11;
      pillarGroup.add(corbel);

      group.add(pillarGroup);
    }

    // Crossbeam (Blandar Tumpang Sari) connecting left & right pillars
    const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.2, 0.28), pillarWoodMat);
    crossBeam.position.set(0, 4.28, zPos);
    group.add(crossBeam);
  }

  // Hanging Pendopo Chandeliers (Lampu Gantung Robyong) at key scroll stations
  const lanternLights: THREE.PointLight[] = [];
  const lanternZPositions = [6.5, 13.5, 19.5];
  const lanternCordMat = new THREE.MeshBasicMaterial({ color: 0x1b070c });
  const lanternFrameMat = new THREE.MeshStandardMaterial({
    color: 0x6b1424,
    roughness: 0.4,
    metalness: 0.15,
  });
  const lanternBulbMat = new THREE.MeshBasicMaterial({ color: 0xf2e3c6 });

  for (const lz of lanternZPositions) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0, 3.35, lz);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.95, 8), lanternCordMat);
    cord.position.y = 0.52;
    lanternGroup.add(cord);

    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.16, 8), lanternFrameMat);
    canopy.position.y = 0.12;
    lanternGroup.add(canopy);

    const globe = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 1), lanternBulbMat);
    lanternGroup.add(globe);

    const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), lanternFrameMat);
    tassel.rotation.x = Math.PI;
    tassel.position.y = -0.22;
    lanternGroup.add(tassel);

    const ptLight = new THREE.PointLight(0xf2e3c6, 1.15, 9.5);
    ptLight.position.set(0, -0.1, 0);
    lanternGroup.add(ptLight);
    lanternLights.push(ptLight);

    group.add(lanternGroup);
  }

  const update = (elapsed: number, dimFactor: number) => {
    const baseBrightness = Math.max(0.25, 1 - dimFactor * 0.65);
    for (let i = 0; i < lanternLights.length; i++) {
      const pulse = 1 + 0.04 * Math.sin(elapsed * 2.1 + i * 1.4);
      lanternLights[i].intensity = 1.15 * pulse * baseBrightness;
    }
  };

  return {
    group,
    lanternLights,
    update,
  };
}
