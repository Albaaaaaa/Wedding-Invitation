import React from 'react';
import { invitation } from '../invitation.config';
import { useInvitation } from '../store/useInvitation';
import { BatikPattern } from '../components/BatikPattern';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Hero Section (Bagian 1 — `#hero`, Section 0.2, 4.2 & 6 of Revisi Final)
 * - Positioned in the upper safe text zone (`justify-start pt-8 md:pt-10`) so the 3D Bride & Groom
 *   standing at the foot of the 7 Pelaminan stairs occupy the lower third (<= 45% height) without obstruction.
 * - Displays "Kepada Yth. {nama tamu}" at the top, Couple Names (Aksara Jawa + Latin >= 18% viewport height)
 *   in the center, and the Wedding Date (Masehi & Kalender Jawa) below.
 */
export const Hero: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const { bride, groom } = invitation.couple;
  const guestName = useInvitation((s) => s.guestName);

  return (
    <section
      id="hero"
      aria-label="Pembuka Undangan Pernikahan"
      className="h-full w-full flex flex-col items-center justify-start pt-8 md:pt-10 pb-20 px-4 text-center pointer-events-auto"
    >
      <InkWipeText
        active={active}
        isExiting={isExiting}
        className="w-full max-w-2xl surface-keraton px-6 py-4 md:px-10 md:py-5 shadow-[0_18px_50px_rgba(0,0,0,0.75)]"
      >
        {/* Kepada Yth. {nama tamu} at top (Section 0.2 Priority #0 requirement) */}
        <div className="mb-2 pb-2 border-b border-[#EADFCB]/20">
          <p className="font-display-latin italic text-xs md:text-sm tracking-[0.18em] uppercase text-[#BFB19A]">
            Kepada Yth. Bapak / Ibu / Saudara/i
          </p>
          <p
            data-testid="hero-guest-name"
            className="font-display-latin text-lg md:text-xl font-semibold text-[#EADFCB] mt-0.5"
          >
            {guestName}
          </p>
        </div>

        {/* Couple Names in Aksara Jawa + Latin occupying >= 18% viewport height */}
        <div
          data-testid="hero-couple-names"
          className="min-h-[18vh] flex flex-col items-center justify-center py-0.5"
        >
          <p
            className="font-aksara text-2xl sm:text-3xl md:text-4xl text-[#EADFCB] mb-1 leading-relaxed"
            lang="jv"
          >
            {bride.aksara} &amp; {groom.aksara}
          </p>

          <h1
            className="font-display-latin text-4xl sm:text-5xl md:text-6xl font-semibold text-[#EADFCB] tracking-wide leading-tight"
            style={{ textWrap: 'balance' }}
          >
            {bride.name} &amp; {groom.name}
          </h1>
        </div>

        <BatikPattern variant="divider" className="my-2" />

        {/* Wedding Date (Masehi & Javanese Calendar) */}
        <p
          data-testid="hero-wedding-date"
          className="font-body-prose text-sm sm:text-base md:text-lg font-medium text-[#EADFCB] tracking-wide"
        >
          {invitation.weddingDateDisplay}
        </p>
        <p className="font-display-latin italic text-sm md:text-base text-[#BFB19A]">
          {invitation.javaneseDate}
        </p>
      </InkWipeText>
    </section>
  );
};
