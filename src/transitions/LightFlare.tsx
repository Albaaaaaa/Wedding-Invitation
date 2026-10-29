import React from 'react';
import type { ShotTechnique } from '../scroll/shots';

interface LightFlareProps {
  activeTechnique: ShotTechnique | null;
  progress: number; // 0..1
}

/**
 * LightFlare (`src/transitions/LightFlare.tsx`)
 * Warm ivory lantern flare (#F2E3C6) that washes softly across the upper lens
 * during the `tilt-up` transition (Section 3 Mempelai -> Section 4 Hitung Mundur).
 */
export const LightFlare: React.FC<LightFlareProps> = ({ activeTechnique, progress }) => {
  if (activeTechnique !== 'tilt-up' || progress <= 0.02 || progress >= 0.98) {
    return null;
  }

  const bell = Math.sin(progress * Math.PI);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-25 overflow-hidden"
      style={{
        opacity: bell * 0.65,
        background:
          'radial-gradient(ellipse 80% 45% at 50% 24%, rgba(242, 227, 198, 0.42) 0%, rgba(142, 34, 51, 0.18) 52%, rgba(11, 5, 6, 0) 100%)',
      }}
    />
  );
};
