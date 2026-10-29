import React, { useRef } from 'react';
import { useInvitation } from '../store/useInvitation';
import { invitation } from '../invitation.config';
import { loopPlayer } from '../audio/loopPlayer';

/**
 * Cover (Section 4 #0, 5.1 & 5.2)
 * Renders the HTML overlay synchronized with the 3D Maroon Envelope & Wax Seal:
 * - Couple initials at top
 * - Progress ring + Gunungan emblem while loading ("Menyiapkan undangan…", disabled)
 * - Wax seal interactive trigger ("Buka Undangan") supporting both click/tap and horizontal drag (>40% auto-completes)
 * - Guest name (?to=) embossed at bottom + "Ketuk segel untuk membuka" hint
 */
export const Cover: React.FC = () => {
  const {
    guestName,
    envelopePhase,
    loadingProgress,
    openingElapsed,
    sealStyle,
    isAudioMuted,
    triggerOpenEnvelope,
    setDragOpenProgress,
    setAudioPlaying,
  } = useInvitation();

  const dragStartXRef = useRef<number | null>(null);

  if (envelopePhase === 'opened') {
    return null;
  }

  const isLoading = envelopePhase === 'loading';
  const isOpening = envelopePhase === 'opening';
  const fadeOutOpacity = isOpening ? Math.max(0, 1 - openingElapsed / 0.8) : 1;

  const handleOpen = () => {
    if (isLoading || isOpening) return;
    triggerOpenEnvelope();
    setAudioPlaying(true);
    void loopPlayer.startAfterUserGesture(isAudioMuted);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isLoading || isOpening) return;
    dragStartXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartXRef.current === null || isLoading || isOpening) return;
    const deltaX = Math.abs(e.clientX - dragStartXRef.current);
    const thresholdPx = 140;
    const progress = Math.min(1, deltaX / thresholdPx);
    setDragOpenProgress(progress);
    // Section 5.2: if dragged more than 40% of distance, automatically complete opening
    if (progress > 0.4) {
      dragStartXRef.current = null;
      handleOpen();
    }
  };

  const handlePointerUp = () => {
    if (dragStartXRef.current !== null) {
      dragStartXRef.current = null;
      if (useInvitation.getState().envelopePhase === 'ready') {
        setDragOpenProgress(0);
      }
    }
  };

  // SVG progress circle math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, loadingProgress) / 100) * circumference;

  return (
    <section
      aria-label="Sampul Undangan Pernikahan"
      style={{ opacity: fadeOutOpacity }}
      className={`fixed inset-0 z-30 flex flex-col items-center justify-between py-8 md:py-12 px-4 transition-opacity duration-500 ${
        isOpening ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* Top Embossed Couple Initials & Javanese Header */}
      <div className="flex flex-col items-center text-center select-none mt-2 md:mt-4">
        <p className="font-aksara text-xl md:text-2xl text-[#EADFCB]/85 mb-1" lang="jv">
          {invitation.greetings.aksaraSugengRawuh}
        </p>
        <span className="font-display-latin text-2xl md:text-3xl tracking-[0.28em] text-[#EADFCB] font-semibold">
          {invitation.couple.initials}
        </span>
        <span className="font-display-latin italic text-sm md:text-base text-[#BFB19A] mt-1">
          Pawiwahan Ageng · Grobogan
        </span>
      </div>

      {/* Center Wax Seal Interactive Trigger & Loading Progress Ring */}
      <div className="relative flex flex-col items-center justify-center my-auto">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Progress / Breathing Ring SVG */}
          <svg
            aria-hidden="true"
            viewBox="0 0 128 128"
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          >
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="rgba(234, 223, 203, 0.18)"
              strokeWidth="2"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="#EADFCB"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={isLoading ? strokeDashoffset : 0}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Interactive Wax Seal Button over the 3D Wax Seal */}
          <button
            type="button"
            disabled={isLoading || isOpening}
            onClick={handleOpen}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            aria-label={isLoading ? 'Menyiapkan undangan…' : 'Buka Undangan'}
            data-testid="wax-seal-button"
            className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center text-center transition-transform duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EADFCB] ${
              isLoading
                ? 'cursor-wait opacity-80'
                : 'cursor-pointer hover:scale-105 active:scale-95'
            }`}
            style={{
              background:
                sealStyle === 'gold'
                  ? 'radial-gradient(circle at 35% 32%, rgba(217, 188, 135, 0.35), rgba(176, 141, 87, 0.22) 65%, rgba(110, 83, 43, 0.4))'
                  : 'radial-gradient(circle at 35% 32%, rgba(142, 34, 51, 0.45), rgba(107, 20, 36, 0.35) 70%)',
              border: '1px solid rgba(234, 223, 203, 0.42)',
            }}
          >
            {isLoading ? (
              <span className="font-body-prose text-xs text-[#EADFCB] tabular-nums">
                {Math.round(loadingProgress)}%
              </span>
            ) : (
              <span className="sr-only">Buka Undangan</span>
            )}
          </button>
        </div>

        {/* Instruction Hint Below Seal */}
        <p className="mt-5 px-4 py-1.5 bg-[#0B0506]/85 border border-[#EADFCB]/30 font-display-latin italic text-base md:text-lg text-[#EADFCB] tracking-wide text-center">
          {isLoading ? 'Menyiapkan undangan…' : 'Ketuk segel untuk membuka'}
        </p>
      </div>

      {/* Bottom Embossed Guest Name (?to=) */}
      <div className="w-full max-w-md surface-keraton px-6 py-4 text-center">
        <p className="font-display-latin italic text-sm text-[#BFB19A] mb-1">
          Kepada Yth. Bapak / Ibu / Saudara:
        </p>
        <p
          data-testid="cover-guest-name"
          className="font-display-latin text-xl md:text-2xl font-semibold text-[#EADFCB] tracking-wide break-words"
        >
          {guestName}
        </p>
      </div>
    </section>
  );
};
