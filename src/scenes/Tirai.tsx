import * as THREE from 'three';
import { CLOTH_VERTEX_SHADER, CLOTH_FRAGMENT_SHADER } from '../shaders/cloth.vert';

export interface TiraiHandle {
  group: THREE.Group;
  update: (elapsed: number) => void;
  dispose: () => void;
}

/**
 * Tirai (`src/scenes/Tirai.tsx` — Section 5.3 of Revisi Final)
 * Deep maroon pleated silk curtains (#6B1424 / #3B0A14) framing the left and right edges
 * of the Pelaminan stage (`x = ±2.85m`), animated via `CLOTH_VERTEX_SHADER`.
 */
export function createTiraiScene(daisHeight = 1.54): TiraiHandle {
  const group = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  const uniforms = {
    uTime: { value: 0 },
    uSwayAmp: { value: 0.025 },
    uSweepProgress: { value: 0 },
    uColorBase: { value: new THREE.Color('#6B1424') },
    uColorShadow: { value: new THREE.Color('#3B0A14') },
    uColorTrim: { value: new THREE.Color('#EADFCB') },
    uOpacity: { value: 0.96 },
  };

  const clothMat = new THREE.ShaderMaterial({
    vertexShader: CLOTH_VERTEX_SHADER,
    fragmentShader: CLOTH_FRAGMENT_SHADER,
    uniforms,
    side: THREE.DoubleSide,
    transparent: true,
  });
  disposables.push(clothMat);

  const curtainGeo = new THREE.PlaneGeometry(1.15, 4.8, 24, 24);
  disposables.push(curtainGeo);

  // Left and Right Pelaminan Stage Curtains
  const leftCurtain = new THREE.Mesh(curtainGeo, clothMat);
  leftCurtain.position.set(-2.65, daisHeight + 2.35, -2.95);
  leftCurtain.rotation.y = 0.22;
  group.add(leftCurtain);

  const rightCurtain = new THREE.Mesh(curtainGeo, clothMat);
  rightCurtain.position.set(2.65, daisHeight + 2.35, -2.95);
  rightCurtain.rotation.y = -0.22;
  group.add(rightCurtain);

  // Foreground Framing Drapes (adds cinema proscenium depth on wide shots)
  const foreLeft = new THREE.Mesh(curtainGeo, clothMat);
  foreLeft.position.set(-2.95, 2.5, -0.45);
  foreLeft.rotation.y = 0.32;
  group.add(foreLeft);

  const foreRight = new THREE.Mesh(curtainGeo, clothMat);
  foreRight.position.set(2.95, 2.5, -0.45);
  foreRight.rotation.y = -0.32;
  group.add(foreRight);

  return {
    group,
    update: (elapsed: number) => {
      uniforms.uTime.value = elapsed;
    },
    dispose: () => {
      for (const d of disposables) d.dispose();
    },
  };
}
