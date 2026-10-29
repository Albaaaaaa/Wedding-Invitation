import React from 'react';
import type { ShotTechnique } from '../scroll/shots';

interface DrapeWipeProps {
  activeTechnique: ShotTechnique | null;
  progress: number; // 0..1
  direction: 1 | -1 | 0;
}

/**
 * DrapeWipe (`src/transitions/DrapeWipe.tsx`)
 * Implements the Section 6 -> Section 7 (`drape-wipe`, 2.2s) transition:
 * A pleated maroon silk curtain (`#6B1424` / `#3B0A14`) with Parang batik sheen and ivory trim
 * sweeps across the viewport from right to left, wiping away the Gifts section and unveiling RSVP & Doa.
 */
export const DrapeWipe: React.FC<DrapeWipeProps> = ({
  activeTechnique,
  progress,
  direction,
}) => {
  if (activeTechnique !== 'drape-wipe' || progress <= 0.01 || progress >= 0.99) {
    return null;
  }

  // Sweep X from +110% (right) to -110% (left) when advancing forward (or reverse when going back)
  const signedT = direction >= 0 ? progress : 1 - progress;
  const translateX = 110 - signedT * 220;
  const bell = Math.sin(progress * Math.PI);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <div
        style={{
          transform: `translate3d(${translateX.toFixed(2)}%, 0, 0) skewX(${(
            Math.sin(progress * Math.PI) * -4
          ).toFixed(2)}deg)`,
          opacity: Math.min(1, bell * 1.65),
        }}
        className="w-[125vw] h-full -ml-[12vw] relative flex"
      >
        {/* Pleated Maroon Silk Curtain Folds */}
        <div
          className="w-full h-full border-x-2 border-[#EADFCB]/45 shadow-[0_0_90px_30px_rgba(11,5,6,0.95)]"
          style={{
            background:
              'repeating-linear-gradient(90deg, #3B0A14 0%, #6B1424 8%, #8E2233 12%, #3B0A14 20%)',
          }}
        >
          {/* Subtle Parang Batik Overlay on the Silk Curtain */}
          <div
            className="w-full h-full opacity-25"
            style={{
              backgroundImage: "url('/assets/motif-parang.svg')",
              backgroundSize: '180px 180px',
            }}
          />
        </div>
      </div>
    </div>
  );
};
