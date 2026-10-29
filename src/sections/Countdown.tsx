import React, { useEffect, useState } from 'react';
import { Calendar, Download, ExternalLink } from 'lucide-react';
import { invitation } from '../invitation.config';
import {
  calculateCountdown,
  toJavaneseNumerals,
  generateIcsContent,
  buildGoogleCalendarUrl,
} from '../utils/invitationLogic';
import { OrnamentFrame } from '../components/OrnamentFrame';
import { BatikPattern } from '../components/BatikPattern';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * Countdown & Save to Calendar Section (Bagian 4 — `#hitung-mundur`, Section 4.2, 6 & 7.2 of Revisi Final)
 * Revealed via `tilt-up` toward the hanging lanterns & roncen melati while couple ascends to stair 3.
 */
export const Countdown: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const cd = calculateCountdown(invitation.weddingDate, nowMs);
  const coupleLabel = `${invitation.couple.bride.name} & ${invitation.couple.groom.name}`;

  const handleDownloadIcs = () => {
    const icsContent = generateIcsContent(
      invitation.events,
      invitation.weddingDate,
      coupleLabel
    );
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slugBride = invitation.couple.bride.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slugGroom = invitation.couple.groom.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `undangan-${slugBride}-${slugGroom}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const units = [
    { label: 'Hari', value: cd.days },
    { label: 'Jam', value: cd.hours },
    { label: 'Menit', value: cd.minutes },
    { label: 'Detik', value: cd.seconds },
  ];

  return (
    <section
      id="hitung-mundur"
      aria-label="Hitung Mundur Menuju Hari Pernikahan"
      data-scrollable-panel="true"
      className="h-full w-full overflow-y-auto flex flex-col items-center justify-start pt-12 md:pt-16 pb-24 px-4 pointer-events-auto"
    >
      <InkWipeText active={active} isExiting={isExiting} className="w-full max-w-3xl">
        <OrnamentFrame variant="keraton">
          <div className="text-center mb-5">
            <h2
              className="font-aksara text-[#EADFCB] mb-1"
              style={{ fontSize: 'clamp(1.85rem, 4vw, 3.25rem)' }}
              lang="jv"
            >
              ꦢꦶꦤꦥꦶꦤꦶꦭꦶꦃ
            </h2>
            <p className="font-display-latin italic text-xl md:text-2xl text-[#BFB19A]">
              Dina Pinilih — Menghitung Hari Bahagia
            </p>
          </div>

          {/* 4 Large Countdown Blocks */}
          <div
            data-testid="countdown-grid"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 md:gap-5 my-5"
          >
            {units.map((u) => (
              <div
                key={u.label}
                className="surface-kelir-card py-4 px-3 flex flex-col items-center justify-center text-center"
              >
                <span className="font-display-latin text-3xl md:text-5xl font-semibold text-[#EADFCB] tabular-nums">
                  {String(u.value).padStart(2, '0')}
                </span>
                <span
                  className="font-aksara text-xs md:text-sm text-[#BFB19A] mt-1"
                  lang="jv"
                  aria-hidden="true"
                >
                  {toJavaneseNumerals(u.value, 2)}
                </span>
                <span className="font-body-prose text-xs md:text-sm text-[#EADFCB]/85 mt-1">
                  {u.label}
                </span>
              </div>
            ))}
          </div>

          <BatikPattern variant="divider" className="my-4" />

          {/* Save to Calendar Actions */}
          <div className="flex flex-col items-center mt-4">
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="btn-primary-keraton inline-flex items-center gap-2.5 px-6 py-2.5 text-sm md:text-base font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EADFCB]"
              >
                <Download className="w-4 h-4" />
                <span>Simpan ke Kalender</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCalendarOptions((prev) => !prev)}
                aria-expanded={showCalendarOptions}
                className="btn-secondary-keraton inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EADFCB]"
              >
                <Calendar className="w-4 h-4" />
                <span>Tautan Google Calendar per Sesi</span>
              </button>
            </div>

            {showCalendarOptions && (
              <div className="w-full max-w-xl mt-5 surface-kelir-card p-4 text-left space-y-2.5">
                <p className="font-display-latin italic text-sm md:text-base text-[#BFB19A] mb-1">
                  Pilih sesi acara untuk ditambahkan ke Google Calendar:
                </p>
                {invitation.events.map((ev) => {
                  const gcalUrl = buildGoogleCalendarUrl(
                    ev,
                    invitation.weddingDate,
                    coupleLabel
                  );
                  return (
                    <div
                      key={ev.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-[#EADFCB]/15 last:border-b-0"
                    >
                      <div>
                        <p className="font-body-prose text-sm font-semibold text-[#EADFCB]">
                          {ev.title}
                        </p>
                        <p className="font-body-prose text-xs text-[#BFB19A]">
                          {ev.time} · {ev.place}
                        </p>
                      </div>
                      <a
                        href={gcalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary-keraton inline-flex items-center gap-1.5 px-3 py-1 text-xs whitespace-nowrap shrink-0 self-start sm:self-auto"
                      >
                        <span>Google Calendar</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </OrnamentFrame>
      </InkWipeText>
    </section>
  );
};
