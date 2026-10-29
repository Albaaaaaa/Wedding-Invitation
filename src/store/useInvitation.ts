import { create } from 'zustand';
import { invitation } from '../invitation.config';
import { INVITATION_SECTIONS } from '../scroll/shots';
import { parseUrlParameters } from '../utils/invitationLogic';

export type EnvelopePhase = 'loading' | 'ready' | 'opening' | 'opened';

export interface RsvpRecord {
  id: string;
  name: string;
  guestsCount: number;
  attendance: 'hadir' | 'berhalangan';
  createdAt: string;
}

export interface WishRecord {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  attendanceBadge?: 'Hadir' | 'Doa Restu';
}

const INITIAL_SEED_WISHES: WishRecord[] = [
  {
    id: 'seed-1',
    name: 'Bapak Subardi & Keluarga (Grobogan)',
    message:
      'Ndherek mangayubagya atas dhaup ageng Andini Adelia Putri kaliyan Vintano Rosi. Mugi tansah pinaringan berkah, atut runtut lestari dumugi kaken-kaken lan ninen-ninen.',
    createdAt: 'Baru saja',
    attendanceBadge: 'Hadir',
  },
  {
    id: 'seed-2',
    name: 'Ibu Hj. Siti Rahayu',
    message:
      'Sugeng mangun bale wisma. Semoga Gusti Allah senantiasa melimpahkan ketenteraman, kemuliaan, dan kebahagiaan abadi bagi keluarga baru Panjenengan.',
    createdAt: '12 menit lalu',
    attendanceBadge: 'Hadir',
  },
  {
    id: 'seed-3',
    name: 'Bapak Hartono & Ibu',
    message:
      'Selamat menempuh hidup baru untuk Ananda Andini dan Vintano. Semoga menjadi keluarga sakinah, mawaddah, warahmah yang membawa berkah bagi sesama.',
    createdAt: '1 jam lalu',
    attendanceBadge: 'Hadir',
  },
  {
    id: 'seed-4',
    name: 'Dimas Prasetyo',
    message:
      'Matur nuwun atas undangannya. Mohon maaf berhalangan hadir langsung ke Juworo, doa tulus kami panjatkan untuk kebahagiaan Andini & Vintano.',
    createdAt: '2 jam lalu',
    attendanceBadge: 'Doa Restu',
  },
  {
    id: 'seed-5',
    name: 'Drg. Larasati Kusumadewi',
    message:
      'Rahayu sagung dumadi. Mugi tansah guyub rukun, widada nir ing sambekala.',
    createdAt: '4 jam lalu',
    attendanceBadge: 'Hadir',
  },
];

interface InvitationState {
  guestName: string;
  hasCustomGuest: boolean;
  envelopePhase: EnvelopePhase;
  loadingProgress: number;
  dragOpenProgress: number;
  openingElapsed: number;

  // Discrete section navigation state (0..7 for Sections 1..8)
  sectionIndex: number;
  transitionProgress: number; // p in [-1, 1]
  isTransitioning: boolean;
  hasDismissedScrollHint: boolean;
  activeSectionId: string;

  sealStyle: 'gold' | 'maroon';
  isAudioMuted: boolean;
  isAudioPlaying: boolean;
  isFallback2D: boolean;
  prefersReducedMotion: boolean;
  isAssetsPreview: boolean;
  rsvps: RsvpRecord[];
  lastRsvpSubmitted: RsvpRecord | null;
  wishes: WishRecord[];
  lastWishSubmittedAtMs: number;

  // Actions
  setLoadingProgress: (progress: number) => void;
  markSceneReady: () => void;
  setDragOpenProgress: (progress: number) => void;
  triggerOpenEnvelope: () => void;
  setOpeningElapsed: (elapsed: number) => void;
  completeOpenEnvelope: () => void;

  setSectionNavState: (patch: {
    sectionIndex?: number;
    transitionProgress?: number;
    isTransitioning?: boolean;
    hasDismissedScrollHint?: boolean;
  }) => void;

  setSealStyle: (style: 'gold' | 'maroon') => void;
  setAudioMuted: (muted: boolean) => void;
  setAudioPlaying: (playing: boolean) => void;
  setFallback2D: (fallback: boolean) => void;
  setIsAssetsPreview: (preview: boolean) => void;
  submitRsvp: (
    record: Omit<RsvpRecord, 'id' | 'createdAt'>
  ) => Promise<{ ok: boolean; error?: string }>;
  submitWish: (record: {
    name: string;
    message: string;
  }) => Promise<{ ok: boolean; error?: string }>;
}

const initialUrlParams =
  typeof window !== 'undefined'
    ? parseUrlParameters(window.location.search, window.location.pathname, window.location.hash)
    : {
        guestName: 'Kanjeng Gusti / Bapak / Ibu / Saudara',
        hasCustomGuest: false,
        autostart: false,
        isAssetsPreview: false,
        sealStyleOverride: null,
        forceFallback2D: false,
        initialSectionIndex: 0,
      };

const initialReducedMotion =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const initialMuted =
  typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
    ? sessionStorage.getItem('sugeng_rawuh_muted') === '1'
    : false;

export const useInvitation = create<InvitationState>((set, get) => ({
  guestName: initialUrlParams.guestName,
  hasCustomGuest: initialUrlParams.hasCustomGuest,
  envelopePhase: initialUrlParams.autostart ? 'opened' : 'loading',
  loadingProgress: initialUrlParams.autostart ? 100 : 18,
  dragOpenProgress: 0,
  openingElapsed: initialUrlParams.autostart ? 3.6 : 0,

  sectionIndex: initialUrlParams.initialSectionIndex,
  transitionProgress: 0,
  isTransitioning: false,
  hasDismissedScrollHint: initialUrlParams.initialSectionIndex > 0,
  activeSectionId: INVITATION_SECTIONS[initialUrlParams.initialSectionIndex]?.id ?? 'hero',

  sealStyle: initialUrlParams.sealStyleOverride ?? invitation.seal.style,
  isAudioMuted: initialMuted,
  isAudioPlaying: false,
  isFallback2D: initialUrlParams.forceFallback2D,
  prefersReducedMotion: initialReducedMotion,
  isAssetsPreview: initialUrlParams.isAssetsPreview,
  rsvps: [],
  lastRsvpSubmitted: null,
  wishes: INITIAL_SEED_WISHES,
  lastWishSubmittedAtMs: 0,

  setLoadingProgress: (progress) =>
    set((state) => {
      const clamped = Math.max(state.loadingProgress, Math.min(100, progress));
      return {
        loadingProgress: clamped,
        envelopePhase:
          state.envelopePhase === 'loading' && clamped >= 100 ? 'ready' : state.envelopePhase,
      };
    }),

  markSceneReady: () =>
    set((state) => ({
      loadingProgress: 100,
      envelopePhase: state.envelopePhase === 'loading' ? 'ready' : state.envelopePhase,
    })),

  setDragOpenProgress: (progress) =>
    set((state) => {
      if (state.envelopePhase !== 'ready') return state;
      const clamped = Math.max(0, Math.min(1, progress));
      return { dragOpenProgress: clamped };
    }),

  triggerOpenEnvelope: () => {
    const state = get();
    if (state.envelopePhase === 'loading' || state.envelopePhase === 'opened') return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore vibrate permission error
      }
    }
    if (state.prefersReducedMotion) {
      set({
        envelopePhase: 'opened',
        openingElapsed: 3.6,
        dragOpenProgress: 1,
      });
      return;
    }
    set({
      envelopePhase: 'opening',
      openingElapsed: state.dragOpenProgress * 0.9,
    });
  },

  setOpeningElapsed: (elapsed) =>
    set((state) => {
      if (state.envelopePhase !== 'opening') return state;
      if (elapsed >= 3.6) {
        return {
          envelopePhase: 'opened',
          openingElapsed: 3.6,
          dragOpenProgress: 1,
        };
      }
      return { openingElapsed: elapsed };
    }),

  completeOpenEnvelope: () =>
    set({
      envelopePhase: 'opened',
      openingElapsed: 3.6,
      dragOpenProgress: 1,
    }),

  setSectionNavState: (patch) =>
    set((state) => {
      const nextIndex =
        patch.sectionIndex !== undefined
          ? Math.max(0, Math.min(INVITATION_SECTIONS.length - 1, patch.sectionIndex))
          : state.sectionIndex;
      const nextP =
        patch.transitionProgress !== undefined
          ? Math.max(-1, Math.min(1, patch.transitionProgress))
          : state.transitionProgress;
      const nextBusy =
        patch.isTransitioning !== undefined ? patch.isTransitioning : state.isTransitioning;
      const nextHint =
        patch.hasDismissedScrollHint !== undefined
          ? patch.hasDismissedScrollHint
          : nextIndex > 0 || state.hasDismissedScrollHint;

      return {
        sectionIndex: nextIndex,
        transitionProgress: nextP,
        isTransitioning: nextBusy,
        hasDismissedScrollHint: nextHint,
        activeSectionId: INVITATION_SECTIONS[nextIndex]?.id ?? 'hero',
      };
    }),

  setSealStyle: (style) => set({ sealStyle: style }),

  setAudioMuted: (muted) => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('sugeng_rawuh_muted', muted ? '1' : '0');
    }
    set({ isAudioMuted: muted });
  },

  setAudioPlaying: (playing) => set({ isAudioPlaying: playing }),

  setFallback2D: (fallback) => set({ isFallback2D: fallback }),

  setIsAssetsPreview: (preview) => set({ isAssetsPreview: preview }),

  submitRsvp: async (record) => {
    try {
      if (invitation.rsvpEndpoint) {
        const res = await fetch(invitation.rsvpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (!res.ok) {
          return {
            ok: false,
            error: 'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
          };
        }
      }
      const newRecord: RsvpRecord = {
        id: 'rsvp-' + Date.now(),
        name: record.name.trim(),
        guestsCount: record.guestsCount,
        attendance: record.attendance,
        createdAt: 'Baru saja',
      };
      set((state) => ({
        rsvps: [newRecord, ...state.rsvps],
        lastRsvpSubmitted: newRecord,
      }));
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      };
    }
  },

  submitWish: async (record) => {
    try {
      if (invitation.wishesEndpoint) {
        const res = await fetch(invitation.wishesEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (!res.ok) {
          return {
            ok: false,
            error: 'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
          };
        }
      }
      const latestRsvp = get().lastRsvpSubmitted;
      const newWish: WishRecord = {
        id: 'wish-' + Date.now(),
        name: record.name.trim(),
        message: record.message.trim(),
        createdAt: 'Baru saja',
        attendanceBadge:
          latestRsvp?.attendance === 'berhalangan' ? 'Doa Restu' : 'Hadir',
      };
      set((state) => ({
        wishes: [newWish, ...state.wishes],
        lastWishSubmittedAtMs: Date.now(),
      }));
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      };
    }
  },
}));
