import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useInvitation } from '../store/useInvitation';
import { loopPlayer } from '../audio/loopPlayer';

/**
 * AudioToggle (Section 8)
 * Floating mute/unmute button in the bottom-right corner with clear icon and session persistence.
 */
export const AudioToggle: React.FC = () => {
  const isAudioMuted = useInvitation((s) => s.isAudioMuted);
  const envelopePhase = useInvitation((s) => s.envelopePhase);
  const setAudioMuted = useInvitation((s) => s.setAudioMuted);

  if (envelopePhase === 'loading' || envelopePhase === 'ready') {
    return null;
  }

  const handleToggle = () => {
    const nextMuted = !isAudioMuted;
    setAudioMuted(nextMuted);
    loopPlayer.setMuted(nextMuted);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isAudioMuted ? 'Nyalakan musik latar' : 'Bisukan musik latar'}
      title={isAudioMuted ? 'Nyalakan musik latar' : 'Bisukan musik latar'}
      className="fixed bottom-5 right-5 z-40 w-11 h-11 flex items-center justify-center surface-keraton text-[#EADFCB] hover:bg-[#8E2233] transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EADFCB]"
    >
      {isAudioMuted ? (
        <VolumeX className="w-5 h-5 text-[#BFB19A]" />
      ) : (
        <Volume2 className="w-5 h-5 text-[#EADFCB]" />
      )}
    </button>
  );
};
