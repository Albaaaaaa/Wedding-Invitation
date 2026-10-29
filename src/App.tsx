/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useInvitation } from './store/useInvitation';
import { evaluateShotState } from './scroll/shots';
import { useSectionNav } from './scroll/useSectionNav';
import { Experience } from './scenes/Experience';
import { CoverOverlay } from './sections/CoverOverlay';
import { Hero } from './sections/Hero';
import { Greeting } from './sections/Greeting';
import { Couple } from './sections/Couple';
import { Countdown } from './sections/Countdown';
import { Events } from './sections/Events';
import { Gifts } from './sections/Gifts';
import { Rsvp } from './sections/Rsvp';
import { Closing } from './sections/Closing';
import { AssetsPreview } from './sections/AssetsPreview';
import { AudioToggle } from './components/AudioToggle';
import { NavDots } from './components/NavDots';
import { IrisMask } from './transitions/IrisMask';
import { DrapeWipe } from './transitions/DrapeWipe';
import { WhipPanBlur } from './transitions/WhipPanBlur';
import { LightFlare } from './transitions/LightFlare';

export default function App() {
  const envelopePhase = useInvitation((s) => s.envelopePhase);
  const openingElapsed = useInvitation((s) => s.openingElapsed);
  const activeSectionId = useInvitation((s) => s.activeSectionId);
  const isAssetsPreview = useInvitation((s) => s.isAssetsPreview);

  const { index, p, busy, goTo, next, prev } = useSectionNav();

  // Sync body data attributes for accessibility and verification snapshots
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.state = isAssetsPreview ? 'assets-preview' : envelopePhase;
      document.body.dataset.section = activeSectionId;
      document.body.dataset.sectionIndex = String(index);
      document.body.style.overflow = isAssetsPreview ? 'auto' : 'hidden';
    }
  }, [envelopePhase, activeSectionId, index, isAssetsPreview]);

  if (isAssetsPreview) {
    return <AssetsPreview />;
  }

  const isOpened = envelopePhase === 'opened';
  const isHeroRevealing =
    isOpened || (envelopePhase === 'opening' && openingElapsed >= 2.1);
  const shotState = evaluateShotState(index, p);
  const isExiting = Math.abs(p) > 0.14;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0B0506] text-[#EADFCB] select-none">
      {/* Fixed 3D WebGL Canvas: Envelope + Pelaminan Jawa + Pengantin */}
      <Experience />

      {/* Envelope Cover Overlay (visible until 3.6s opening completes) */}
      <CoverOverlay />

      {/* Floating Audio Mute/Unmute Toggle */}
      <AudioToggle />

      {/* 7 Cinematic Transition Overlays */}
      {isOpened && (
        <>
          <IrisMask
            activeTechnique={shotState.activeTechnique}
            progress={shotState.transitionProgress}
          />
          <DrapeWipe
            activeTechnique={shotState.activeTechnique}
            progress={shotState.transitionProgress}
            direction={shotState.direction}
          />
          <WhipPanBlur
            activeTechnique={shotState.activeTechnique}
            progress={shotState.transitionProgress}
          />
          <LightFlare
            activeTechnique={shotState.activeTechnique}
            progress={shotState.transitionProgress}
          />
        </>
      )}

      {/* Discrete Fullscreen Invitation Sections (Bagian 1..8) */}
      <main
        aria-hidden={!isHeroRevealing}
        className={`relative z-20 h-full w-full select-text ${
          isHeroRevealing
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {isHeroRevealing && index === 0 && <Hero active={true} isExiting={isExiting} />}
        {isOpened && index === 1 && <Greeting active={true} isExiting={isExiting} />}
        {isOpened && index === 2 && <Couple active={true} isExiting={isExiting} />}
        {isOpened && index === 3 && <Countdown active={true} isExiting={isExiting} />}
        {isOpened && index === 4 && <Events active={true} isExiting={isExiting} />}
        {isOpened && index === 5 && <Gifts active={true} isExiting={isExiting} />}
        {isOpened && index === 6 && <Rsvp active={true} isExiting={isExiting} />}
        {isOpened && index === 7 && <Closing active={true} isExiting={isExiting} />}
      </main>

      {/* 8-Dot Section Indicator + Sebelumnya / Berikutnya Controls */}
      {isOpened && (
        <NavDots
          activeIndex={index}
          busy={busy}
          onSelect={goTo}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}
