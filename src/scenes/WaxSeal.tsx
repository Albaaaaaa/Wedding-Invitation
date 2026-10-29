import * as THREE from 'three';

export interface WaxSealRig {
  group: THREE.Group;
  sealMesh: THREE.Mesh;
  emblemMesh: THREE.Mesh;
  pulseRingMesh: THREE.Mesh;
  material: THREE.MeshPhysicalMaterial;
  emblemMaterial: THREE.MeshPhysicalMaterial;
  ringMaterial: THREE.MeshBasicMaterial;
  setStyle: (style: 'gold' | 'maroon') => void;
  update: (elapsed: number, pulseScale: number, ringExpand: number, ringOpacity: number) => void;
}

function createWaxBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#202020';
    ctx.fillRect(0, 0, 512, 512);

    // Outer irregular wax rim
    const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 235);
    grad.addColorStop(0, '#444444');
    grad.addColorStop(0.72, '#D8D8D8');
    grad.addColorStop(0.88, '#909090');
    grad.addColorStop(1, '#202020');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 235, 0, Math.PI * 2);
    ctx.fill();

    // Inner beaded ring
    ctx.strokeStyle = '#E8E8E8';
    ctx.lineWidth = 8;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.arc(256, 256, 152, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Central 5-petal Melati (Jasmine) flower emblem
    ctx.save();
    ctx.translate(256, 256);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(0, -56, 24, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#CFCFCF';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createWaxSealRig(initialStyle: 'gold' | 'maroon'): WaxSealRig {
  const group = new THREE.Group();
  group.name = 'WaxSealGroup';

  const bumpMap = createWaxBumpTexture();

  // Organic irregular wax seal shape (proportioned to match the center X-intersection)
  const shape = new THREE.Shape();
  const segments = 48;
  const baseRadius = 0.22;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const wobble =
      Math.sin(theta * 5) * 0.009 +
      Math.cos(theta * 8) * 0.006 +
      Math.sin(theta * 3) * 0.005;
    const r = baseRadius + wobble;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }

  const sealGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.028,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  sealGeo.center();

  const material = new THREE.MeshPhysicalMaterial({
    color: initialStyle === 'gold' ? 0xb08d57 : 0x8e2233,
    metalness: initialStyle === 'gold' ? 0.68 : 0.05,
    roughness: initialStyle === 'gold' ? 0.44 : 0.48,
    clearcoat: 0.45,
    clearcoatRoughness: 0.32,
    bumpMap,
    bumpScale: 0.025,
  });

  const sealMesh = new THREE.Mesh(sealGeo, material);
  sealMesh.castShadow = true;
  sealMesh.receiveShadow = true;
  group.add(sealMesh);

  // Raised inner Melati emblem disc
  const emblemGeo = new THREE.CylinderGeometry(0.155, 0.165, 0.018, 32);
  emblemGeo.rotateX(Math.PI / 2);
  const emblemMaterial = new THREE.MeshPhysicalMaterial({
    color: initialStyle === 'gold' ? 0x9a7846 : 0xeadfcb,
    metalness: initialStyle === 'gold' ? 0.65 : 0.0,
    roughness: 0.38,
    clearcoat: 0.4,
    bumpMap,
    bumpScale: 0.035,
  });
  const emblemMesh = new THREE.Mesh(emblemGeo, emblemMaterial);
  emblemMesh.position.z = 0.018;
  group.add(emblemMesh);

  // 3D Sculpted Melati 5-Petal Blossom on top of the Wax Seal
  const petalGeo = new THREE.SphereGeometry(0.032, 12, 10);
  petalGeo.scale(0.75, 1.35, 0.35);
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const petal = new THREE.Mesh(petalGeo, material);
    petal.position.set(Math.sin(angle) * 0.055, Math.cos(angle) * 0.055, 0.028);
    petal.rotation.z = -angle;
    group.add(petal);
  }
  const centerBud = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), emblemMaterial);
  centerBud.scale.set(1, 1, 0.45);
  centerBud.position.z = 0.032;
  group.add(centerBud);

  // Subtle breathing / expanding ring around the seal (2.4s idle cycle)
  const ringGeo = new THREE.RingGeometry(0.255, 0.272, 48);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xeadfcb,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
  });
  const pulseRingMesh = new THREE.Mesh(ringGeo, ringMaterial);
  pulseRingMesh.position.z = 0.01;
  group.add(pulseRingMesh);

  const setStyle = (style: 'gold' | 'maroon') => {
    if (style === 'gold') {
      material.color.setHex(0xb08d57);
      material.metalness = 0.85;
      material.roughness = 0.35;
      emblemMaterial.color.setHex(0xc29f68);
      emblemMaterial.metalness = 0.82;
    } else {
      material.color.setHex(0x8e2233);
      material.metalness = 0.04;
      material.roughness = 0.48;
      emblemMaterial.color.setHex(0xeadfcb);
      emblemMaterial.metalness = 0.0;
    }
    material.needsUpdate = true;
    emblemMaterial.needsUpdate = true;
  };

  const update = (
    elapsed: number,
    pulseScale: number,
    ringExpand: number,
    ringOpacity: number
  ) => {
    group.scale.setScalar(pulseScale);
    // 2.4-second gentle breathing cycle when idle, or expanding wave when clicked
    const idleCycle = 1 + Math.sin((elapsed * Math.PI * 2) / 2.4) * 0.045;
    const rScale = ringExpand > 0 ? 1 + ringExpand * 1.45 : idleCycle;
    pulseRingMesh.scale.setScalar(rScale);
    ringMaterial.opacity =
      ringExpand > 0
        ? ringOpacity * 0.65
        : (0.25 + 0.2 * Math.sin((elapsed * Math.PI * 2) / 2.4)) * ringOpacity;
  };

  return {
    group,
    sealMesh,
    emblemMesh,
    pulseRingMesh,
    material,
    emblemMaterial,
    ringMaterial,
    setStyle,
    update,
  };
}
