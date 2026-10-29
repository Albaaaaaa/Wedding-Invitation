import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { INVITATION_SECTIONS } from '../scroll/shots';
import { useInvitation } from '../store/useInvitation';

interface NavDotsProps {
  activeIndex: number;
  busy: boolean;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * NavDots (`src/components/NavDots.tsx` — Section 4.1 & Section 9 of Revisi Final)
 * - 8 discrete section indicator dots (right edge on desktop, bottom bar on mobile).
 * - Hovering/focusing a dot displays the section's Aksara Jawa + Latin title.
 * - Includes visible, keyboard-focusable "Sebelumnya" and "Berikutnya" buttons so users who
 *   prefer clicking over scrolling can step cleanly through all 8 sections.
 * - Displays the one-time "Geser untuk lanjut" hint at the bottom of Section 1 (Hero),
 *   which disappears permanently after the first transition.
 */
export const NavDots: React.FC<NavDotsProps> = ({
  activeIndex,
  busy,
  onSelect,
  onPrev,
  onNext,
}) => {
  const hasDismissedScrollHint = useInvitation((s) => s.hasDismissedScrollHint);
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < INVITATION_SECTIONS.length - 1;

  return (
    <>
      {/* Desktop Right-Edge 8 Section Dots */}
      <nav
        aria-label="Navigasi bagian undangan"
        className="hidden md:flex fixed right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3"
      >
        {INVITATION_SECTIONS.map((sec) => {
          const isCurrent = sec.index === activeIndex;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelect(sec.index)}
              aria-label={`Bagian ${sec.number}: ${sec.label}`}
              aria-current={isCurrent ? 'step' : undefined}
              className="group flex items-center gap-3 py-1 pl-2 cursor-pointer focus:outline-none"
            >
              <span
                className="px-2.5 py-1 text-xs font-body-prose border border-[#EADFCB]/25 bg-[#0B0506]/95 text-[#EADFCB] transition-all duration-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 pointer-events-none"
              >
                <span className="font-aksara text-[11px] text-[#BFB19A] mr-1.5" lang="jv">
                  {sec.aksara}
                </span>
                <span>{sec.label}</span>
              </span>

              <span
                className={`block transition-all duration-300 border border-[#EADFCB] ${
                  isCurrent
                    ? 'w-3 h-3 bg-[#EADFCB] rotate-45 shadow-[0_0_10px_rgba(242,227,198,0.8)]'
                    : 'w-2 h-2 bg-[#3B0A14]/80 group-hover:bg-[#8E2233]'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation Bar: "Sebelumnya" / Mobile Dots / "Berikutnya" + One-Time Hero Hint */}
      <div className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none flex flex-col items-center gap-2">
        {/* One-time "Geser untuk lanjut" prompt on Section 1 (Hero) */}
        {activeIndex === 0 && !hasDismissedScrollHint && (
          <button
            type="button"
            onClick={onNext}
            className="pointer-events-auto inline-flex items-center gap-2 px-3.5 py-1 text-xs font-body-prose tracking-widest uppercase text-[#EADFCB] bg-[#0B0506]/80 border border-[#EADFCB]/25 hover:border-[#EADFCB]/60 transition-colors cursor-pointer"
          >
            <span>Geser untuk lanjut</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#EADFCB]" />
          </button>
        )}

        <div className="pointer-events-auto flex items-center justify-between gap-3 px-3 py-1.5 bg-[#0B0506]/85 border border-[#EADFCB]/25 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.65)]">
          <button
            type="button"
            onClick={onPrev}
            disabled={!canGoPrev || busy}
            aria-label="Bagian sebelumnya"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-body-prose text-[#EADFCB] hover:bg-[#8E2233]/60 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          {/* Compact 8-Dot Strip (Visible on Mobile & Desktop Footer) */}
          <div className="flex items-center gap-1.5 px-2" role="tablist" aria-label="Pilih bagian">
            {INVITATION_SECTIONS.map((sec) => {
              const isCurrent = sec.index === activeIndex;
              return (
                <button
                  key={sec.id}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={`${sec.number}. ${sec.label}`}
                  onClick={() => onSelect(sec.index)}
                  className={`transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? 'w-5 h-2 bg-[#EADFCB]'
                      : 'w-2 h-2 bg-[#EADFCB]/30 hover:bg-[#EADFCB]/60'
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || busy}
            aria-label="Bagian berikutnya"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-body-prose text-[#EADFCB] hover:bg-[#8E2233]/60 disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <span>Berikutnya</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
};
