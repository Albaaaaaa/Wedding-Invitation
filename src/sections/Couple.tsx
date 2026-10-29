import React from 'react';
import { invitation } from '../invitation.config';
import { DoubleExposureCard } from '../components/DoubleExposureCard';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Couple / Mempelai Section (Bagian 3 — `#mempelai`, Section 4.2, 5.5, 6 & 7.1 of Revisi Final)
 * Revealed via 35° camera orbit while the couple climbs onto stair 2.
 * Two portrait DoubleExposureCards (Bride & Groom masked by the carved Gebyok Gapura arch).
 */
export const Couple: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const { bride, groom } = invitation.couple;

  return (
    <section
      id="mempelai"
      aria-label="Profil Mempelai Wanita dan Pria"
      data-scrollable-panel="true"
      className="h-full w-full overflow-y-auto flex flex-col items-center justify-start pt-10 md:pt-12 pb-24 px-4 pointer-events-auto"
    >
      <InkWipeText active={active} isExiting={isExiting} className="w-full max-w-5xl">
        {/* Section Heading */}
        <div className="text-center mb-5 surface-keraton py-3.5 px-6 max-w-xl mx-auto">
          <h2
            className="font-aksara text-[#EADFCB] mb-0.5"
            style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}
            lang="jv"
          >
            ꦥꦶꦤꦔꦤ꧀ꦠꦺꦤ꧀
          </h2>
          <p className="font-display-latin italic text-lg md:text-xl text-[#BFB19A]">
            Pinanganten Sarimbit — Mempelai Berdua
          </p>
        </div>

        {/* Two Double Exposure Portrait Cards (Masked with Gebyok Gapura Arch) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 items-stretch">
          <DoubleExposureCard person={bride} roleLabel="Mempelai Wanita" />
          <DoubleExposureCard person={groom} roleLabel="Mempelai Pria" />
        </div>
      </InkWipeText>
    </section>
  );
};
