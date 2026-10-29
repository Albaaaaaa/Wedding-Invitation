import * as THREE from 'three';

export interface DustParticlesRig {
  points: THREE.Points;
  update: (elapsed: number, reducedMotion: boolean) => void;
}

/**
 * Subtle warm ivory dust particles drifting beneath the Pendopo lights (Section 4 #5 & Section 9)
 */
export function createDustParticlesRig(count = 140): DustParticlesRig {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4.8;
    positions[i * 3 + 1] = 0.4 + Math.random() * 3.2;
    positions[i * 3 + 2] = 1.5 + Math.random() * 23.0;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xf2e3c6,
    size: 0.032,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);
  points.name = 'DustParticles';

  const update = (elapsed: number, reducedMotion: boolean) => {
    if (reducedMotion) return;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const basePhase = phases[i];
      const y = posAttr.getY(i) + Math.sin(elapsed * 0.6 + basePhase) * 0.0012;
      posAttr.setY(i, y > 3.6 ? 0.5 : y);
    }
    posAttr.needsUpdate = true;
  };

  return { points, update };
}
