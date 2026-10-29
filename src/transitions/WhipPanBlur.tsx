import React from 'react';
import type { ShotTechnique } from '../scroll/shots';

interface WhipPanBlurProps {
  activeTechnique: ShotTechnique | null;
  progress: number; // 0..1
}

/**
 * WhipPanBlur (`src/transitions/WhipPanBlur.tsx`)
 * Implements the directional horizontal motion blur streak during the fast pan
 * of Section 4 -> Section 5 (`whip-pan`: 1.4s fast pan + 1.0s rack-focus settle).
 */
export const WhipPanBlur: React.FC<WhipPanBlurProps> = ({ activeTechnique, progress }) => {
  if (activeTechnique !== 'whip-pan' || progress <= 0.01 || progress >= 0.65) {
    return null;
  }

  // Peaks in the middle of the 1.4s fast pan (around progress = 0.29)
  const panPhase = Math.min(1, progress / 0.58);
  const streakIntensity = Math.sin(panPhase * Math.PI);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-25 overflow-hidden"
      style={{
        opacity: streakIntensity * 0.78,
        backdropFilter: `blur(${(streakIntensity * 6).toFixed(1)}px)`,
        background:
          'linear-gradient(90deg, rgba(11,5,6,0.55) 0%, rgba(242,227,198,0.14) 35%, rgba(107,20,36,0.28) 65%, rgba(11,5,6,0.55) 100%)',
      }}
    />
  );
};
