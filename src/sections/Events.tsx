import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { invitation } from '../invitation.config';
import { OrnamentFrame } from '../components/OrnamentFrame';
import { BatikPattern } from '../components/BatikPattern';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Events Section (Bagian 5 — `#acara`, Section 4.2, 6 & 7.3 of Revisi Final)
 * Revealed via `whip-pan` & rack focus toward the left Kembar Mayang while couple steps onto stair 4.
 * Three horizontally aligned wedding event cards (Akad Nikah, Upacara Panggih, Resepsi Pahargyan Ageng).
 */
export const Events: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  return (
    <section
      id="acara"
      aria-label="Rangkaian Acara Pernikahan"
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
            ꦫꦺꦫꦺꦴꦚ꧀ꦕꦺꦤꦶꦁꦲꦢꦶꦕꦫ
          </h2>
          <p className="font-display-latin italic text-lg md:text-xl text-[#BFB19A]">
            Reroncening Adicara — Rangkaian Acara
          </p>
        </div>

        {/* Three Horizontally Aligned Stations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {invitation.events.map((ev) => (
            <OrnamentFrame
              key={ev.id}
              variant="keraton"
              className="flex flex-col justify-between h-full p-5"
            >
              <div>
                {/* Centered Aksara Jawa + Latin Event Title */}
                <div className="text-center mb-3">
                  <p
                    className="font-aksara text-xl md:text-2xl text-[#EADFCB] mb-0.5"
                    lang="jv"
                  >
                    {ev.aksara}
                  </p>
                  <h3 className="font-display-latin text-2xl font-semibold text-[#EADFCB]">
                    {ev.title}
                  </h3>
                </div>

                <BatikPattern variant="divider" className="my-3" />

                {/* Left-aligned Time, Venue & Address (Section 4 alignment rule) */}
                <div className="text-left space-y-2.5 font-body-prose text-sm">
                  <div>
                    <p className="text-[#EADFCB] font-semibold">
                      {ev.dateLabel} · {ev.javaneseDateLabel}
                    </p>
                    <p className="text-[#BFB19A] tabular-nums">{ev.time}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EADFCB]/15">
                    <p className="text-[#EADFCB] font-semibold">{ev.place}</p>
                    <p className="text-[#BFB19A] text-xs md:text-sm leading-relaxed mt-1">
                      {ev.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button: Lihat Lokasi */}
              <div className="mt-5 pt-3.5 border-t border-[#EADFCB]/15 flex justify-start">
                <a
                  href={ev.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Lihat Lokasi ${ev.title} di ${ev.place}`}
                  className="btn-primary-keraton inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium whitespace-nowrap shrink-0"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Lihat Lokasi</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </OrnamentFrame>
          ))}
        </div>
      </InkWipeText>
    </section>
  );
};
