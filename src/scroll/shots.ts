export type ShotTechnique =
  | 'zoom-match-cut'
  | 'orbit'
  | 'tilt-up'
  | 'whip-pan'
  | 'macro-iris'
  | 'drape-wipe'
  | 'crane-out';

export interface SectionCameraPose {
  pos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  dofFocus: number;
  dofBokeh: number;
  coupleStep: number; // 0 = base of stairs, 1..6 = steps 1..6, 7 = dais landing, 8 = seated on bridal chairs
}

export interface ShotSpec {
  id: string;
  fromSection: number; // 0..6 (representing Sections 1..7)
  toSection: number;   // 1..7 (representing Sections 2..8)
  duration: number;    // seconds (2.2 .. 3.0)
  technique: ShotTechnique;
  from: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };
  to: {
    pos: [number, number, number];
    lookAt: [number, number, number];
    fov: number;
  };
  dofFocus: [number, number];
  dofBokeh: [number, number];
  coupleStep: [number, number];
}

export interface InvitationSectionMeta {
  index: number;
  number: number; // 1..8
  id: string;
  hash: string;
  aksara: string;
  label: string;
  subtitle: string;
}

export const INVITATION_SECTIONS: InvitationSectionMeta[] = [
  {
    index: 0,
    number: 1,
    id: 'hero',
    hash: '#hero',
    aksara: 'ꦱꦼꦏꦂꦄꦫꦸꦩ꧀',
    label: 'Pembuka',
    subtitle: 'Pasangan Pengantin di Kaki Tangga Pelaminan',
  },
  {
    index: 1,
    number: 2,
    id: 'salam',
    hash: '#salam',
    aksara: 'ꦱꦸꦒꦼꦁꦫꦮꦸꦃ',
    label: 'Sugeng Rawuh',
    subtitle: 'Salam Pembuka & Doa Restu',
  },
  {
    index: 2,
    number: 3,
    id: 'mempelai',
    hash: '#mempelai',
    aksara: 'ꦥꦶꦤꦔꦤ꧀ꦠꦺꦤ꧀',
    label: 'Mempelai',
    subtitle: 'Profil Kedua Mempelai & Orang Tua',
  },
  {
    index: 3,
    number: 4,
    id: 'hitung-mundur',
    hash: '#hitung-mundur',
    aksara: 'ꦢꦶꦤꦥꦶꦤꦶꦭꦶꦃ',
    label: 'Hitung Mundur',
    subtitle: 'Menuju Hari Bahagia & Simpan Kalender',
  },
  {
    index: 4,
    number: 5,
    id: 'acara',
    hash: '#acara',
    aksara: 'ꦲꦢꦶꦕꦫ',
    label: 'Detail Acara',
    subtitle: 'Akad Nikah, Upacara Panggih & Resepsi',
  },
  {
    index: 5,
    number: 6,
    id: 'hadiah',
    hash: '#hadiah',
    aksara: 'ꦠꦤ꧀ꦝꦠꦽꦱ꧀ꦤ',
    label: 'Hadiah Digital',
    subtitle: 'Tanda Kasih & Pengiriman Hadiah',
  },
  {
    index: 6,
    number: 7,
    id: 'rsvp',
    hash: '#rsvp',
    aksara: 'ꦥꦸꦗꦶꦥꦔꦺꦱ꧀ꦠꦸ',
    label: 'RSVP & Doa',
    subtitle: 'Konfirmasi Kehadiran & Ucapan Doa',
  },
  {
    index: 7,
    number: 8,
    id: 'penutup',
    hash: '#penutup',
    aksara: 'ꦩꦠꦸꦂꦤꦸꦮꦸꦤ꧀',
    label: 'Matur Nuwun',
    subtitle: 'Sanding Pengantin di Panggung Pelaminan',
  },
];

/**
 * Resting camera poses for each of the 8 main sections (indices 0..7).
 * Carefully calibrated so the 3D couple/pelaminan occupies the lower third (<= 45% height)
 * and leaves a high-contrast dark region in the upper/central viewport for legible text.
 */
export const SECTION_REST_POSES: SectionCameraPose[] = [
  // Section 1 (index 0): Hero — Wide symmetrical shot behind couple at foot of 7 stairs (step 0)
  {
    pos: [0, 1.35, 5.4],
    lookAt: [0, 2.48, -2.5],
    fov: 34,
    dofFocus: 4.8,
    dofBokeh: 1.5,
    coupleStep: 0,
  },
  // Section 2 (index 1): Salam — Zoomed into carved Gebyok arch & couple on step 1
  {
    pos: [0, 1.62, 3.8],
    lookAt: [0, 2.55, -2.6],
    fov: 22,
    dofFocus: 6.2,
    dofBokeh: 3.2,
    coupleStep: 1,
  },
  // Section 3 (index 2): Mempelai — 35° right orbit parallax, couple on step 2
  {
    pos: [2.25, 1.98, 4.15],
    lookAt: [0, 2.45, -1.8],
    fov: 30,
    dofFocus: 5.5,
    dofBokeh: 2.8,
    coupleStep: 2,
  },
  // Section 4 (index 3): Hitung Mundur — Tilt up (+25° pitch) toward hanging lanterns & roncen melati, couple on step 3
  {
    pos: [0.35, 1.85, 3.6],
    lookAt: [0, 3.65, -1.6],
    fov: 32,
    dofFocus: 4.6,
    dofBokeh: 2.4,
    coupleStep: 3,
  },
  // Section 5 (index 4): Acara — Whip-pan & rack focus to left Kembar Mayang framing Pelaminan, couple on step 4
  {
    pos: [-1.85, 2.02, 3.7],
    lookAt: [-0.25, 2.5, -2.2],
    fov: 30,
    dofFocus: 5.2,
    dofBokeh: 2.5,
    coupleStep: 4,
  },
  // Section 6 (index 5): Hadiah — Macro focus on hanging roncen melati & warm blurred Pelaminan, couple on step 5
  {
    pos: [0, 2.25, 2.65],
    lookAt: [0, 2.75, -2.4],
    fov: 24,
    dofFocus: 2.8,
    dofBokeh: 4.2,
    coupleStep: 5,
  },
  // Section 7 (index 6): RSVP & Doa — Couple reaches top stair landing (step 6) after maroon drape wipe
  {
    pos: [0, 2.2, 3.55],
    lookAt: [0, 2.68, -2.4],
    fov: 30,
    dofFocus: 5.6,
    dofBokeh: 4.5,
    coupleStep: 6,
  },
  // Section 8 (index 7): Penutup — Grand crane-out high & wide; couple seated on Pelaminan chairs in lower third (step 8)
  {
    pos: [0, 2.45, 6.3],
    lookAt: [0, 3.35, -2.6],
    fov: 34,
    dofFocus: 8.6,
    dofBokeh: 1.4,
    coupleStep: 8,
  },
];

/**
 * 7 Distinct Cinematic Transitions between the 8 Sections (Section 4.3 & Section 6 of Final Spec)
 */
export const SHOTS: ShotSpec[] = [
  // 1 -> 2: Hero -> Salam ("zoom-match-cut", 2.6s)
  {
    id: 'hero-to-salam',
    fromSection: 0,
    toSection: 1,
    duration: 2.6,
    technique: 'zoom-match-cut',
    from: {
      pos: SECTION_REST_POSES[0].pos,
      lookAt: SECTION_REST_POSES[0].lookAt,
      fov: 34,
    },
    to: {
      pos: SECTION_REST_POSES[1].pos,
      lookAt: SECTION_REST_POSES[1].lookAt,
      fov: 18,
    },
    dofFocus: [4.8, 6.2],
    dofBokeh: [1.5, 3.2],
    coupleStep: [0, 1],
  },
  // 2 -> 3: Salam -> Mempelai ("orbit", 2.8s)
  {
    id: 'salam-to-mempelai',
    fromSection: 1,
    toSection: 2,
    duration: 2.8,
    technique: 'orbit',
    from: {
      pos: SECTION_REST_POSES[1].pos,
      lookAt: SECTION_REST_POSES[1].lookAt,
      fov: 22,
    },
    to: {
      pos: SECTION_REST_POSES[2].pos,
      lookAt: SECTION_REST_POSES[2].lookAt,
      fov: 30,
    },
    dofFocus: [6.2, 5.5],
    dofBokeh: [3.2, 2.8],
    coupleStep: [1, 2],
  },
  // 3 -> 4: Mempelai -> Hitung mundur ("tilt-up", 2.4s)
  {
    id: 'mempelai-to-countdown',
    fromSection: 2,
    toSection: 3,
    duration: 2.4,
    technique: 'tilt-up',
    from: {
      pos: SECTION_REST_POSES[2].pos,
      lookAt: SECTION_REST_POSES[2].lookAt,
      fov: 30,
    },
    to: {
      pos: SECTION_REST_POSES[3].pos,
      lookAt: SECTION_REST_POSES[3].lookAt,
      fov: 32,
    },
    dofFocus: [5.5, 4.6],
    dofBokeh: [2.8, 2.4],
    coupleStep: [2, 3],
  },
  // 4 -> 5: Hitung mundur -> Acara ("whip-pan", 2.4s: 1.4s pan + 1.0s settle)
  {
    id: 'countdown-to-acara',
    fromSection: 3,
    toSection: 4,
    duration: 2.4,
    technique: 'whip-pan',
    from: {
      pos: SECTION_REST_POSES[3].pos,
      lookAt: SECTION_REST_POSES[3].lookAt,
      fov: 32,
    },
    to: {
      pos: SECTION_REST_POSES[4].pos,
      lookAt: SECTION_REST_POSES[4].lookAt,
      fov: 30,
    },
    dofFocus: [4.6, 5.2],
    dofBokeh: [2.4, 2.5],
    coupleStep: [3, 4],
  },
  // 5 -> 6: Acara -> Hadiah ("macro-iris", 2.6s)
  {
    id: 'acara-to-hadiah',
    fromSection: 4,
    toSection: 5,
    duration: 2.6,
    technique: 'macro-iris',
    from: {
      pos: SECTION_REST_POSES[4].pos,
      lookAt: SECTION_REST_POSES[4].lookAt,
      fov: 30,
    },
    to: {
      pos: SECTION_REST_POSES[5].pos,
      lookAt: SECTION_REST_POSES[5].lookAt,
      fov: 24,
    },
    dofFocus: [5.2, 2.8],
    dofBokeh: [2.5, 4.2],
    coupleStep: [4, 5],
  },
  // 6 -> 7: Hadiah -> RSVP & Doa ("drape-wipe", 2.2s)
  {
    id: 'hadiah-to-rsvp',
    fromSection: 5,
    toSection: 6,
    duration: 2.2,
    technique: 'drape-wipe',
    from: {
      pos: SECTION_REST_POSES[5].pos,
      lookAt: SECTION_REST_POSES[5].lookAt,
      fov: 24,
    },
    to: {
      pos: SECTION_REST_POSES[6].pos,
      lookAt: SECTION_REST_POSES[6].lookAt,
      fov: 30,
    },
    dofFocus: [2.8, 5.6],
    dofBokeh: [4.2, 4.5],
    coupleStep: [5, 6],
  },
  // 7 -> 8: RSVP & Doa -> Penutup ("crane-out", 3.0s)
  {
    id: 'rsvp-to-penutup',
    fromSection: 6,
    toSection: 7,
    duration: 3.0,
    technique: 'crane-out',
    from: {
      pos: SECTION_REST_POSES[6].pos,
      lookAt: SECTION_REST_POSES[6].lookAt,
      fov: 30,
    },
    to: {
      pos: SECTION_REST_POSES[7].pos,
      lookAt: SECTION_REST_POSES[7].lookAt,
      fov: 34,
    },
    dofFocus: [5.6, 8.6],
    dofBokeh: [4.5, 1.4],
    coupleStep: [6, 8],
  },
];

/**
 * Smoothstep easing function: t * t * (3 - 2 * t)
 */
export function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/**
 * Computes interpolated camera pose, FOV, DOF, couple step, and active transition effect state
 * given the current discrete section index (0..7) and transition progress p (-1..1).
 */
export function evaluateShotState(index: number, p: number): {
  pos: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  dofFocus: number;
  dofBokeh: number;
  coupleStep: number;
  activeTechnique: ShotTechnique | null;
  transitionProgress: number; // 0..1 absolute progress along active shot
  direction: 1 | -1 | 0;
} {
  const clampedIndex = Math.max(0, Math.min(SECTION_REST_POSES.length - 1, index));
  const rest = SECTION_REST_POSES[clampedIndex];

  if (Math.abs(p) < 0.001) {
    return {
      pos: [...rest.pos],
      lookAt: [...rest.lookAt],
      fov: rest.fov,
      dofFocus: rest.dofFocus,
      dofBokeh: rest.dofBokeh,
      coupleStep: rest.coupleStep,
      activeTechnique: null,
      transitionProgress: 0,
      direction: 0,
    };
  }

  const direction: 1 | -1 = p > 0 ? 1 : -1;
  const targetIndex = Math.max(0, Math.min(SECTION_REST_POSES.length - 1, clampedIndex + direction));
  if (targetIndex === clampedIndex) {
    return {
      pos: [...rest.pos],
      lookAt: [...rest.lookAt],
      fov: rest.fov,
      dofFocus: rest.dofFocus,
      dofBokeh: rest.dofBokeh,
      coupleStep: rest.coupleStep,
      activeTechnique: null,
      transitionProgress: 0,
      direction: 0,
    };
  }

  const rawT = Math.max(0, Math.min(1, Math.abs(p)));
  const s = smoothstep01(rawT);

  const shotIndex = direction > 0 ? clampedIndex : targetIndex;
  const shot = SHOTS[shotIndex];
  const targetPose = SECTION_REST_POSES[targetIndex];

  // For whip-pan (shotIndex 3: Countdown -> Acara), accelerate during first 58% (1.4s / 2.4s), then settle
  let interpT = s;
  if (shot?.technique === 'whip-pan') {
    if (rawT < 0.58) {
      const fastT = rawT / 0.58;
      interpT = smoothstep01(fastT) * 0.92;
    } else {
      const settleT = (rawT - 0.58) / 0.42;
      interpT = 0.92 + smoothstep01(settleT) * 0.08;
    }
  }

  // For orbit (shotIndex 1: Salam -> Mempelai), add slight arc in Z/X so camera curves gracefully
  const arcBoost =
    shot?.technique === 'orbit' ? Math.sin(rawT * Math.PI) * 0.45 : 0;

  // For macro-iris (shotIndex 4: Acara -> Hadiah), camera pushes in toward the hanging jasmine flower at [0, 2.75, 0.8] mid-shot
  const macroPushZ =
    shot?.technique === 'macro-iris' ? -Math.sin(rawT * Math.PI) * 1.15 : 0;

  const pos: [number, number, number] = [
    rest.pos[0] + (targetPose.pos[0] - rest.pos[0]) * interpT + arcBoost * 0.6,
    rest.pos[1] + (targetPose.pos[1] - rest.pos[1]) * interpT,
    rest.pos[2] + (targetPose.pos[2] - rest.pos[2]) * interpT + arcBoost * 0.3 + macroPushZ,
  ];

  const lookAt: [number, number, number] = [
    rest.lookAt[0] + (targetPose.lookAt[0] - rest.lookAt[0]) * interpT,
    rest.lookAt[1] + (targetPose.lookAt[1] - rest.lookAt[1]) * interpT,
    rest.lookAt[2] + (targetPose.lookAt[2] - rest.lookAt[2]) * interpT,
  ];

  // During zoom-match-cut (Hero -> Salam), FOV narrows down to 18 at peak
  let fov = rest.fov + (targetPose.fov - rest.fov) * interpT;
  if (shot?.technique === 'zoom-match-cut') {
    fov = rest.fov + (targetPose.fov - rest.fov) * interpT - Math.sin(rawT * Math.PI) * 4;
  }

  const dofFocus = rest.dofFocus + (targetPose.dofFocus - rest.dofFocus) * interpT;
  const dofBokeh = rest.dofBokeh + (targetPose.dofBokeh - rest.dofBokeh) * interpT;
  const coupleStep = rest.coupleStep + (targetPose.coupleStep - rest.coupleStep) * s;

  return {
    pos,
    lookAt,
    fov,
    dofFocus,
    dofBokeh,
    coupleStep,
    activeTechnique: shot ? shot.technique : null,
    transitionProgress: rawT,
    direction,
  };
}
