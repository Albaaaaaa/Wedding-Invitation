import React from 'react';
import { invitation } from '../invitation.config';
import { OrnamentFrame } from '../components/OrnamentFrame';
import { BatikPattern } from '../components/BatikPattern';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Greeting / Salam Pembuka Section (Bagian 2 — `#salam`, Section 4.2 & 6 of Revisi Final)
 * Revealed via `zoom-match-cut` through the carved Gebyok Gapura arch as the couple steps onto stair 1.
 */
export const Greeting: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  return (
    <section
      id="salam"
      aria-label="Salam Pembuka Sugeng Rawuh"
      className="h-full w-full flex flex-col items-center justify-start pt-14 md:pt-18 pb-20 px-4 pointer-events-auto"
    >
      <InkWipeText active={active} isExiting={isExiting} className="w-full max-w-2xl">
        <OrnamentFrame variant="keraton">
          <div className="text-center mb-4">
            <h2
              className="font-aksara text-[#EADFCB] mb-1.5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)' }}
              lang="jv"
            >
              {invitation.greetings.aksaraSugengRawuh}
            </h2>
            <p className="font-display-latin italic text-xl md:text-2xl text-[#BFB19A]">
              Sugeng Rawuh — Selamat Datang
            </p>
          </div>

          <BatikPattern variant="divider" className="my-3" />

          {/* Left-aligned body prose for optimal readability (Section 0.2 & 4 alignment rule) */}
          <div className="max-w-[58ch] mx-auto text-left space-y-3 font-body-prose text-sm sm:text-base md:text-lg text-[#EADFCB] leading-relaxed">
            <p>{invitation.greetings.openingText}</p>
            <p className="text-[#BFB19A]">
              Merupakan suatu kehormatan dan kebahagiaan mendalam bagi keluarga besar kami apabila
              Panjenengan berkenan hadir untuk memberikan doa restu pada upacara pernikahan putra-putri
              kami di Ndalem Ngabean, Yogyakarta.
            </p>
          </div>
        </OrnamentFrame>
      </InkWipeText>
    </section>
  );
};
