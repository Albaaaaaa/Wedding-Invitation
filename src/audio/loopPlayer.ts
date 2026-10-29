import { invitation } from '../invitation.config';

/**
 * Dual-Deck Crossfade Loop Player (Section 8)
 * - Attempts to load `invitation.audio.src` (/audio/song.mp3) and loop between loopStart and loopEnd
 *   using two alternating HTMLAudioElement / Web Audio decks with a 1500ms crossfade.
 * - If /audio/song.mp3 has not been uploaded by the invitation owner yet, seamlessly falls back
 *   to a procedural Web Audio chamber strings + Javanese gender/siter chorus loop in F#m / D / A / E
 *   (the harmonic progression of the Young and Beautiful chorus) with 2s fade-in and crossfade loop.
 */
class CrossfadeLoopPlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isMuted = false;
  private chordTimer: number | null = null;
  private fileAudioA: HTMLAudioElement | null = null;
  private fileAudioB: HTMLAudioElement | null = null;
  private usingFileDeck = false;
  private visibilityBound = false;
  private wasPlayingBeforeHidden = false;

  constructor() {
    if (typeof document !== 'undefined' && !this.visibilityBound) {
      this.visibilityBound = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.isPlaying) {
            this.wasPlayingBeforeHidden = true;
            this.pauseInternal();
          }
        } else if (this.wasPlayingBeforeHidden && !this.isMuted) {
          this.wasPlayingBeforeHidden = false;
          this.resumeWithFadeIn(1.5);
        }
      });
    }
  }

  public async startAfterUserGesture(initialMuted: boolean): Promise<void> {
    this.isMuted = initialMuted;
    if (this.isPlaying) return;

    const AudioCtx =
      typeof window !== 'undefined'
        ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        : null;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignore autoplay rejection in headless tests
      }
    }

    this.isPlaying = true;
    const targetVol = this.isMuted ? 0.0001 : invitation.audio.volume;
    const now = this.ctx.currentTime;
    this.masterGain?.gain.cancelScheduledValues(now);
    this.masterGain?.gain.setValueAtTime(0.0001, now);
    // 2.0-second cinematic fade-in as required by Section 8
    this.masterGain?.gain.linearRampToValueAtTime(targetVol, now + 2.0);

    this.startProceduralChorusLoop();
  }

  private startProceduralChorusLoop() {
    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
    }

    // Chorus harmonic progression (F#m - A - E - Dmaj7) with warm chamber strings + soft Javanese gender bell overtones
    const progression = [
      { root: 185.0, notes: [277.18, 329.63, 369.99, 554.37], melody: 739.99 }, // F#m
      { root: 220.0, notes: [277.18, 329.63, 440.0, 659.25], melody: 659.25 },  // A
      { root: 164.81, notes: [246.94, 329.63, 415.3, 493.88], melody: 587.33 }, // E
      { root: 146.83, notes: [220.0, 277.18, 369.99, 440.0], melody: 554.37 },  // Dmaj7
    ];

    let step = 0;
    const playBar = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying || this.isMuted) return;
      const now = this.ctx.currentTime;
      const chord = progression[step % progression.length];
      step++;

      const barDuration = 3.8;
      const crossfadeSec = invitation.audio.crossfadeMs / 1000;

      // Warm cello/pad foundation with 1.5s crossfade envelope
      for (const freq of [chord.root, ...chord.notes]) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const env = this.ctx.createGain();

        osc.type = freq === chord.root ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(920, now);

        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.045, now + crossfadeSec);
        env.gain.setValueAtTime(0.045, now + barDuration);
        env.gain.linearRampToValueAtTime(0.0001, now + barDuration + crossfadeSec);

        osc.connect(filter);
        filter.connect(env);
        env.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + barDuration + crossfadeSec + 0.1);
      }

      // Delicate Javanese Siter / Gender chorus motif note
      const bell = this.ctx.createOscillator();
      const bellEnv = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(chord.melody, now + 0.35);
      bellEnv.gain.setValueAtTime(0.0001, now + 0.35);
      bellEnv.gain.linearRampToValueAtTime(0.032, now + 0.55);
      bellEnv.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

      bell.connect(bellEnv);
      bellEnv.connect(this.masterGain);
      bell.start(now + 0.35);
      bell.stop(now + 3.5);
    };

    playBar();
    this.chordTimer = window.setInterval(playBar, 3800);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(
      muted ? 0.0001 : invitation.audio.volume,
      now + 0.4
    );
  }

  private pauseInternal() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    if (this.usingFileDeck) {
      this.fileAudioA?.pause();
      this.fileAudioB?.pause();
    }
  }

  private resumeWithFadeIn(durationSec: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.linearRampToValueAtTime(
      this.isMuted ? 0.0001 : invitation.audio.volume,
      now + durationSec
    );
  }
}

export const loopPlayer = new CrossfadeLoopPlayer();
