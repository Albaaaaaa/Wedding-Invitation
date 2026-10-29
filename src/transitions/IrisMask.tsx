import React from 'react';
import type { ShotTechnique } from '../scroll/shots';

interface IrisMaskProps {
  activeTechnique: ShotTechnique | null;
  progress: number; // 0..1
}

/**
 * IrisMask (`src/transitions/IrisMask.tsx`)
 * Handles two signature masked transitions from Section 6:
 * 1. `zoom-match-cut` (Hero -> Salam): Carved Gebyok Gapura arch silhouette expands to frame the Salam panel.
 * 2. `macro-iris` (Acara -> Hadiah): Macro zoom into a jasmine blossom on the roncen melati,
 *    whose glowing ivory center expands into a circular iris reveal.
 */
export const IrisMask: React.FC<IrisMaskProps> = ({ activeTechnique, progress }) => {
  if (
    (activeTechnique !== 'macro-iris' && activeTechnique !== 'zoom-match-cut') ||
    progress <= 0.02 ||
    progress >= 0.98
  ) {
    return null;
  }

  // Bell curve intensity peaking mid-transition (progress = 0.5)
  const bell = Math.sin(progress * Math.PI);

  if (activeTechnique === 'zoom-match-cut') {
    const scale = 0.65 + progress * 1.9;
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-25 flex items-center justify-center overflow-hidden"
        style={{ opacity: bell * 0.72 }}
      >
        {/* Carved Gebyok Gapura Arch silhouette frame expanding as camera zooms through */}
        <div
          style={{
            transform: `scale(${scale.toFixed(3)})`,
            transition: 'transform 60ms linear',
          }}
          className="w-[72vw] max-w-[680px] aspect-[4/5] border-2 border-[#EADFCB]/45 rounded-t-full shadow-[0_0_120px_40px_rgba(11,5,6,0.92)]"
        />
      </div>
    );
  }

  // macro-iris: Jasmine petal ring & glowing ivory iris circle expanding from 0% -> 140%
  const radiusPct = Math.max(2, progress * 140);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-25 flex items-center justify-center overflow-hidden"
      style={{
        opacity: bell * 0.85,
        background: `radial-gradient(circle at 50% 50%, rgba(242, 227, 198, ${
          (1 - progress) * 0.55
        }) 0%, rgba(107, 20, 36, ${bell * 0.45}) ${radiusPct.toFixed(1)}%, rgba(11, 5, 6, ${
          bell * 0.82
        }) ${(radiusPct + 18).toFixed(1)}%)`,
      }}
    >
      {/* Delicate 5-petal Melati ring expanding with the iris */}
      <svg
        viewBox="0 0 200 200"
        className="w-64 h-64 text-[#EADFCB]"
        style={{
          transform: `scale(${(0.35 + progress * 2.8).toFixed(3)}) rotate(${(
            progress * 32
          ).toFixed(1)}deg)`,
          opacity: (1 - progress * 0.75) * bell,
        }}
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="100" cy="100" r="36" strokeOpacity="0.6" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="100"
              cy="56"
              rx="16"
              ry="28"
              transform={`rotate(${deg} 100 100)`}
              fill="rgba(242, 227, 198, 0.14)"
            />
          ))}
        </g>
      </svg>
    </div>
  );
};
