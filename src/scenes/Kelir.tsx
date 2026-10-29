import * as THREE from 'three';
import { flameVertexShader, flameFragmentShader } from '../shaders/flame.frag';

export interface KelirRig {
  group: THREE.Group;
  screenMesh: THREE.Mesh;
  blencongLight: THREE.PointLight;
  shaderMat: THREE.ShaderMaterial;
  update: (elapsed: number, revealFactor: number) => void;
}

/**
 * Kelir (Javanese Wayang Shadow Screen) + Blencong Oil Lamp (Section 5.3)
 * Cloth screen with warm ivory center (#F2E3C6 / #EADFCB) fading to maroon pekat (#3B0A14) at edges,
 * framed by carved dark teakwood Plangkan & Banana-Trunk Gedebog at the bottom.
 */
export function createKelirRig(zPosition = 0): KelirRig {
  const group = new THREE.Group();
  group.name = 'KelirRig';
  group.position.set(0, 0, zPosition);

  const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.0 },
    },
    vertexShader: flameVertexShader,
    fragmentShader: flameFragmentShader,
    side: THREE.DoubleSide,
  });

  const screenGeo = new THREE.PlaneGeometry(4.4, 2.85, 1, 1);
  const screenMesh = new THREE.Mesh(screenGeo, shaderMat);
  screenMesh.position.set(0, 1.68, 0);
  group.add(screenMesh);

  // Carved Plangkan (Teakwood Frame in Maroon Pekat / Hitam Kelir)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x26060d,
    roughness: 0.72,
    metalness: 0.05,
  });

  // Top & Bottom Horizontal Beams (Gedebog base)
  const topBeam = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.18, 0.14), frameMat);
  topBeam.position.set(0, 3.16, 0.02);
  group.add(topBeam);

  const gedebogBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 4.85, 16), frameMat);
  gedebogBase.rotation.z = Math.PI / 2;
  gedebogBase.position.set(0, 0.24, 0.04);
  group.add(gedebogBase);

  // Left & Right Vertical Posts
  const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.25, 0.14), frameMat);
  leftPost.position.set(-2.32, 1.65, 0.02);
  group.add(leftPost);

  const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.25, 0.14), frameMat);
  rightPost.position.set(2.32, 1.65, 0.02);
  group.add(rightPost);

  // Warm ivory decorative trim line around Kelir cloth
  const trimPts = [
    new THREE.Vector3(-2.18, 0.3, 0.02),
    new THREE.Vector3(2.18, 0.3, 0.02),
    new THREE.Vector3(2.18, 3.05, 0.02),
    new THREE.Vector3(-2.18, 3.05, 0.02),
    new THREE.Vector3(-2.18, 0.3, 0.02),
  ];
  const trimLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(trimPts),
    new THREE.LineBasicMaterial({ color: 0xeadfcb, transparent: true, opacity: 0.35 })
  );
  group.add(trimLine);

  // Blencong oil lamp point light (warm ivory #F2E3C6, intensity flickers 0.92..1.08)
  const blencongLight = new THREE.PointLight(0xf2e3c6, 1.8, 12);
  blencongLight.position.set(0, 1.85, 0.9);
  group.add(blencongLight);

  const update = (elapsed: number, revealFactor: number) => {
    shaderMat.uniforms.uTime.value = elapsed;
    const flicker = 1.0 + 0.05 * Math.sin(elapsed * 2.7) + 0.03 * Math.cos(elapsed * 4.3);
    shaderMat.uniforms.uIntensity.value = flicker * (0.45 + 0.55 * revealFactor);
    blencongLight.intensity = 1.6 * flicker * (0.35 + 0.65 * revealFactor);
  };

  return {
    group,
    screenMesh,
    blencongLight,
    shaderMat,
    update,
  };
}
