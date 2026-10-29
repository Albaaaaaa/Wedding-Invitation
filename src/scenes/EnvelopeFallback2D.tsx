import React from 'react';
import { useInvitation } from '../store/useInvitation';
import { invitation } from '../invitation.config';
import { computeEnvelopeTimeline } from '../utils/invitationLogic';

/**
 * EnvelopeFallback2D (Section 5.2 & Section 11 of Revisi Final)
 * Pure CSS clip-path & transform 2D implementation of the maroon scalloped envelope,
 * wax seal, and Pelaminan Gebyok + Kembar Mayang backdrop for devices without WebGL.
 */
export const EnvelopeFallback2D: React.FC = () => {
  const {
    envelopePhase,
    openingElapsed,
    dragOpenProgress,
    sealStyle,
    guestName,
  } = useInvitation();

  const timeline = computeEnvelopeTimeline(
    envelopePhase === 'opened' ? 3.6 : openingElapsed
  );
  const leftP = Math.max(timeline.leftPanelProgress, dragOpenProgress * 0.65);
  const rightP = Math.max(timeline.rightPanelProgress, dragOpenProgress * 0.6);

  return (
    <div
      data-testid="envelope-fallback-2d"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-[#0B0506] z-0"
    >
      {/* Pelaminan Gebyok & Kembar Mayang 2D Backdrop */}
      <div
        className="absolute inset-0 flex items-end justify-center transition-opacity duration-700"
        style={{
          background:
            'radial-gradient(circle at 50% 58%, rgba(242,227,198,0.22) 0%, rgba(107,20,36,0.42) 48%, rgba(11,5,6,0.98) 85%)',
        }}
      >
        <div className="relative w-full max-w-4xl h-[48vh] flex items-end justify-between px-8 pb-6 opacity-55">
          <img
            src="/assets/kembar-mayang.svg"
            alt="Kembar Mayang Kiri"
            referrerPolicy="no-referrer"
            className="w-28 md:w-40 h-auto object-contain select-none"
          />
          <img
            src="/assets/gebyok-relief.svg"
            alt="Ukiran Gebyok Pelaminan"
            referrerPolicy="no-referrer"
            className="w-64 md:w-96 h-auto object-contain mb-4 opacity-75 select-none"
          />
          <img
            src="/assets/kembar-mayang.svg"
            alt="Kembar Mayang Kanan"
            referrerPolicy="no-referrer"
            className="w-28 md:w-40 h-auto object-contain select-none"
          />
        </div>
      </div>

      {/* 2D CSS Envelope Panels (visible until opened) */}
      {envelopePhase !== 'opened' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: timeline.envelopeFade }}
        >
          <div className="relative w-[92vw] max-w-[460px] h-[84vh] max-h-[680px] bg-[#3B0A14] border border-[#EADFCB]/20 shadow-2xl overflow-hidden">
            {/* Inner Warm Glow */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 50%, #F2E3C6 0%, #6B1424 55%, #0B0506 100%)',
                opacity: Math.max(0.15, timeline.slitGlow),
              }}
            />

            {/* Right Scalloped Panel */}
            <div
              className="absolute inset-0 bg-[#5E1120] border-l border-[#8E2233]"
              style={{
                clipPath: 'polygon(100% 0%, 42% 50%, 100% 100%)',
                transform: `translateX(${rightP * 110}%) rotate(${rightP * 6}deg)`,
              }}
            />

            {/* Left Scalloped Panel carrying Seal */}
            <div
              className="absolute inset-0 bg-[#6B1424] border-r border-[#8E2233] flex flex-col items-center justify-between py-10"
              style={{
                clipPath: 'polygon(0% 0%, 58% 50%, 0% 100%, 0% 0%)',
                transform: `translateX(${-leftP * 110}%) rotate(${-leftP * 6}deg)`,
              }}
            >
              <span className="text-sm tracking-[0.25em] text-[#EADFCB]/80 font-display-latin">
                {invitation.couple.initials}
              </span>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border border-[#EADFCB]/40"
                style={{
                  backgroundColor: sealStyle === 'gold' ? '#B08D57' : '#8E2233',
                }}
              >
                <span className="text-xs font-display-latin italic text-[#EADFCB]">
                  Segel
                </span>
              </div>
              <span className="text-xs text-[#EADFCB]/75 font-body-prose">
                {guestName}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
