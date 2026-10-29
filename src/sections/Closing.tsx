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
 * Closing / Penutup Section (Bagian 8 — `#penutup`, Section 4.2 & 6 of Revisi Final)
 * Revealed via the grand `crane-out` (3.0s) as the Bride & Groom climb onto the Pelaminan Dais,
 * turn 180° in backlit silhouette, and sit together on the two carved bridal chairs.
 * Positioned in the upper safe text zone (`pt-6 md:pt-8`) so the seated Pelaminan couple below is 100% unobstructed.
 */
export const Closing: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const { bride, groom } = invitation.couple;
  const sealStyle = useInvitation((s) => s.sealStyle);
  const setSealStyle = useInvitation((s) => s.setSealStyle);
  const setIsAssetsPreview = useInvitation((s) => s.setIsAssetsPreview);

  return (
    <footer
      id="penutup"
      aria-label="Penutup Matur Nuwun"
      className="h-full w-full flex flex-col items-center justify-start pt-6 md:pt-8 pb-20 px-4 text-center pointer-events-auto"
    >
      <InkWipeText
        active={active}
        isExiting={isExiting}
        className="w-full max-w-2xl surface-keraton px-6 py-4 md:px-10 md:py-5 shadow-[0_18px_50px_rgba(0,0,0,0.75)]"
      >
        <h2
          className="font-aksara text-[#EADFCB] mb-0.5"
          style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.85rem)' }}
          lang="jv"
        >
          {invitation.greetings.aksaraMaturNuwun}
        </h2>
        <p className="font-display-latin italic text-base md:text-xl text-[#BFB19A] mb-2">
          Matur Nuwun — Terima Kasih
        </p>

        <p className="font-body-prose text-xs sm:text-sm md:text-base text-[#EADFCB] max-w-lg mx-auto leading-relaxed">
          {invitation.greetings.closingText}
        </p>

        <BatikPattern variant="divider" className="my-2.5" />

        <p className="font-aksara text-base md:text-lg text-[#EADFCB] mb-0.5" lang="jv">
          {bride.aksara} &amp; {groom.aksara}
        </p>
        <p className="font-display-latin text-2xl md:text-3xl font-semibold text-[#EADFCB] tracking-wide">
          {bride.name} &amp; {groom.name}
        </p>
        <p className="font-display-latin italic text-xs text-[#BFB19A] mt-0.5">
          Keluarga Besar Kedua Mempelai · Ds. Karangrejo, Grobogan
        </p>

        {/* Quiet Owner Configuration Controls (Seal Style & Fase 0 Assets Preview) */}
        <div className="mt-3 pt-2.5 border-t border-[#EADFCB]/15 flex flex-wrap items-center justify-center gap-4 text-xs text-[#BFB19A]">
          <button
            type="button"
            onClick={() => setSealStyle(sealStyle === 'gold' ? 'maroon' : 'gold')}
            className="hover:text-[#EADFCB] underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            Segel Lilin: {sealStyle === 'gold' ? 'Emas Kuno (#B08D57)' : 'Maroon Tanpa Logam (#8E2233)'}
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setIsAssetsPreview(true)}
            className="hover:text-[#EADFCB] underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            Galeri Aset Fase 0 (/assets-preview)
          </button>
        </div>
      </InkWipeText>
    </footer>
  );
};
