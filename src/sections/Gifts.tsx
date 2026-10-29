import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { invitation } from '../invitation.config';
import { OrnamentFrame } from '../components/OrnamentFrame';
import { CopyButton } from '../components/CopyButton';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Digital Gifts Section (Bagian 6 — `#hadiah`, Section 4.2, 6 & 7.4 of Revisi Final)
 * Revealed via `macro-iris` zoom through the hanging jasmine blossom as the couple steps onto stair 5.
 */
export const Gifts: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const [openQrId, setOpenQrId] = useState<string | null>(null);

  return (
    <section
      id="hadiah"
      aria-label="Tanda Kasih dan Hadiah Digital"
      data-scrollable-panel="true"
      className="h-full w-full overflow-y-auto flex flex-col items-center justify-start pt-10 md:pt-12 pb-24 px-4 pointer-events-auto"
    >
      <InkWipeText active={active} isExiting={isExiting} className="w-full max-w-4xl">
        {/* Section Heading */}
        <div className="text-center mb-4 surface-keraton py-3.5 px-6 max-w-xl mx-auto">
          <h2
            className="font-aksara text-[#EADFCB] mb-0.5"
            style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}
            lang="jv"
          >
            ꦠꦤ꧀ꦝꦠꦽꦱ꧀ꦤ
          </h2>
          <p className="font-display-latin italic text-lg md:text-xl text-[#BFB19A]">
            Tandha Tresna — Hadiah Digital
          </p>
        </div>

        {/* Intro Paragraph (Left-aligned) */}
        <div className="surface-keraton px-5 py-3.5 mb-5 max-w-2xl mx-auto text-left">
          <p className="font-body-prose text-sm md:text-base text-[#EADFCB] leading-relaxed">
            Kehadiran dan doa restu Panjenengan merupakan karunia terindah bagi kami. Namun apabila
            berkenan menyampaikan tanda kasih secara digital maupun kiriman fisik, dapat melalui
            rekening di bawah ini.
          </p>
        </div>

        {/* Bank & E-Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {invitation.gifts.map((gift) => {
            const isQrOpen = openQrId === gift.id;
            return (
              <OrnamentFrame
                key={gift.id}
                variant="keraton"
                className="flex flex-col justify-between text-left p-5"
              >
                <div>
                  <p className="font-display-latin italic text-sm md:text-base text-[#BFB19A]">
                    {gift.type === 'bank' ? 'Rekening Bank' : 'Dompet Digital / QRIS'}
                  </p>
                  <h3 className="font-display-latin text-xl md:text-2xl font-semibold text-[#EADFCB] mt-0.5 mb-3">
                    {gift.name}
                  </h3>

                  <div className="surface-kelir-card px-4 py-2.5 mb-2.5">
                    <p className="font-body-prose text-xs text-[#BFB19A] mb-0.5">
                      Nomor Rekening / Tujuan
                    </p>
                    <p
                      data-testid={`gift-number-${gift.id}`}
                      className="font-display-latin text-2xl font-semibold tracking-wider text-[#EADFCB] tabular-nums"
                    >
                      {gift.number}
                    </p>
                  </div>

                  <p className="font-body-prose text-xs md:text-sm text-[#BFB19A]">
                    a.n. <span className="text-[#EADFCB]">{gift.holder}</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EADFCB]/15 flex flex-wrap items-center gap-3">
                  <CopyButton
                    valueToCopy={gift.number}
                    label="Salin Nomor"
                    ariaLabel={`Salin Nomor ${gift.name} ${gift.number}`}
                  />

                  {gift.qr && (
                    <button
                      type="button"
                      onClick={() => setOpenQrId(isQrOpen ? null : gift.id)}
                      aria-expanded={isQrOpen}
                      className="btn-secondary-keraton inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{isQrOpen ? 'Tutup QRIS' : 'Tampilkan QRIS'}</span>
                    </button>
                  )}
                </div>

                {gift.qr && isQrOpen && (
                  <div className="mt-3 surface-kelir-card p-3 flex flex-col items-center text-center">
                    <svg
                      viewBox="0 0 140 140"
                      className="w-32 h-32 bg-[#EADFCB] p-2"
                      role="img"
                      aria-label={`Kode QRIS ${gift.name}`}
                    >
                      <rect x="8" y="8" width="36" height="36" fill="none" stroke="#0B0506" strokeWidth="6" />
                      <rect x="18" y="18" width="16" height="16" fill="#0B0506" />
                      <rect x="96" y="8" width="36" height="36" fill="none" stroke="#0B0506" strokeWidth="6" />
                      <rect x="106" y="18" width="16" height="16" fill="#0B0506" />
                      <rect x="8" y="96" width="36" height="36" fill="none" stroke="#0B0506" strokeWidth="6" />
                      <rect x="18" y="106" width="16" height="16" fill="#0B0506" />
                      <rect x="54" y="20" width="10" height="10" fill="#0B0506" />
                      <rect x="70" y="34" width="12" height="12" fill="#0B0506" />
                      <rect x="52" y="52" width="36" height="36" fill="#6B1424" />
                      <circle cx="70" cy="70" r="8" fill="#EADFCB" />
                      <rect x="20" y="58" width="22" height="10" fill="#0B0506" />
                      <rect x="98" y="62" width="24" height="12" fill="#0B0506" />
                      <rect x="56" y="100" width="14" height="24" fill="#0B0506" />
                      <rect x="82" y="96" width="28" height="14" fill="#0B0506" />
                      <rect x="96" y="116" width="24" height="12" fill="#0B0506" />
                    </svg>
                    <p className="font-body-prose text-xs text-[#BFB19A] mt-1.5">
                      QRIS {gift.holder}
                    </p>
                  </div>
                )}
              </OrnamentFrame>
            );
          })}
        </div>

        {/* Physical Gift Address */}
        {invitation.giftAddress && (
          <div className="mt-5 surface-keraton p-4 md:p-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display-latin text-lg md:text-xl font-semibold text-[#EADFCB] mb-0.5">
                  Alamat Pengiriman Hadiah Fisik
                </h3>
                <p className="font-body-prose text-xs md:text-sm text-[#BFB19A] leading-relaxed">
                  {invitation.giftAddress}
                </p>
              </div>
              <CopyButton
                valueToCopy={invitation.giftAddress}
                label="Salin Alamat"
                ariaLabel="Salin Alamat Pengiriman Hadiah"
              />
            </div>
          </div>
        )}
      </InkWipeText>
    </section>
  );
};
