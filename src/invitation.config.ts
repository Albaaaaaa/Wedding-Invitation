export interface CouplePersonConfig {
  name: string;
  aksara: string;
  fullName: string;
  parents: string;
  photo: string;
  maskOffset: [number, number];
  maskScale: number;
}

export interface WeddingEventConfig {
  id: string;
  title: string;
  aksara: string;
  dateLabel: string;
  javaneseDateLabel: string;
  time: string;
  startHourWib: number;
  durationHours: number;
  place: string;
  address: string;
  mapUrl: string;
}

export interface DigitalGiftConfig {
  id: string;
  type: 'bank' | 'ewallet';
  name: string;
  number: string;
  holder: string;
  qr?: string;
}

export interface InvitationConfig {
  couple: {
    initials: string;
    bride: CouplePersonConfig;
    groom: CouplePersonConfig;
  };
  weddingDate: string;
  weddingDateDisplay: string;
  javaneseDate: string;
  seal: {
    /**
     * "gold": Satu-satunya elemen logam di seluruh undangan (#B08D57, mengikuti referensi pemilik).
     * "maroon": Versi benar-benar tanpa logam (#8E2233 dengan emblem gading).
     */
    style: 'gold' | 'maroon';
  };
  scene: {
    steps: number;
    brideOutfit: 'kebaya-maroon';
    groomOutfit: 'beskap-hitam';
  };
  greetings: {
    aksaraSugengRawuh: string;
    aksaraMaturNuwun: string;
    openingText: string;
    closingText: string;
  };
  events: WeddingEventConfig[];
  gifts: DigitalGiftConfig[];
  giftAddress: string;
  audio: {
    src: string;
    title: string;
    artist: string;
    sectionNote: string;
    loopStart: number;
    loopEnd: number;
    volume: number;
    crossfadeMs: number;
    spotifyEmbedUrl?: string;
  };
  rsvpEndpoint: string;
  wishesEndpoint: string;
}

export const invitation: InvitationConfig = {
  couple: {
    initials: 'A & V',
    bride: {
      name: 'Andini Adelia',
      aksara: 'ꦲꦤ꧀ꦢꦶꦤꦶꦲꦢꦺꦭꦶꦪꦥꦸꦠꦿꦶ', // diperiksa penutur aksara Jawa: Andini Adelia Putri
      fullName: 'Andini Adelia Putri',
      parents: 'Putri tercinta dari Bapak & Ibu Keluarga Besar Ds. Karangrejo',
      photo: '/img/bride.svg',
      maskOffset: [0, -0.02],
      maskScale: 1.04,
    },
    groom: {
      name: 'Vintano Rosi',
      aksara: 'ꦮ꦳ꦶꦤ꧀ꦠꦤꦺꦴꦫꦺꦴꦱꦶ', // diperiksa penutur aksara Jawa: Vintano Rosi
      fullName: 'Vintano Rosi',
      parents: 'Putra tercinta dari Bapak & Ibu Keluarga Besar',
      photo: '/img/groom.svg',
      maskOffset: [0, -0.02],
      maskScale: 1.04,
    },
  },
  weddingDate: '2026-12-12T09:00:00+07:00',
  weddingDateDisplay: 'Sabtu, 12 Desember 2026',
  javaneseDate: 'Sabtu Legi, 2 Jumadilakhir 1960 Dal',
  seal: {
    style: 'gold',
  },
  scene: {
    steps: 7,
    brideOutfit: 'kebaya-maroon',
    groomOutfit: 'beskap-hitam',
  },
  greetings: {
    aksaraSugengRawuh: 'ꦱꦸꦒꦼꦁꦫꦮꦸꦃ',
    aksaraMaturNuwun: 'ꦩꦠꦸꦂꦤꦸꦮꦸꦤ꧀',
    openingText:
      'Dengan memohon restu Gusti Allah, kami mengundang Bapak/Ibu/Saudara untuk hadir di hari bahagia kami.',
    closingText:
      'Matur nuwun atas doa dan restu Panjenengan sekalian.',
  },
  events: [
    {
      id: 'akad',
      title: 'Akad Nikah',
      aksara: 'ꦲꦏꦢ꧀ꦤꦶꦏꦃ',
      dateLabel: 'Sabtu, 12 Desember 2026',
      javaneseDateLabel: 'Sabtu Legi',
      time: '09:00 – 10:30 WIB',
      startHourWib: 9,
      durationHours: 1.5,
      place: 'Kediaman Mempelai (Dusun Juworo)',
      address: 'Dsn. Juworo, Ds. Karangrejo, Kec. Gabus, Kab. Grobogan, Jawa Tengah',
      mapUrl:
        "https://www.google.com/maps/place/7%C2%B007'22.5%22S+111%C2%B011'27.1%22E/@-7.1229704,111.1907246,20.83z/data=!4m4!3m3!8m2!3d-7.1229134!4d111.1908493?hl=en&entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      id: 'panggih',
      title: 'Upacara Panggih',
      aksara: 'ꦲꦸꦥꦕꦫꦥꦁꦒꦶꦃ',
      dateLabel: 'Sabtu, 12 Desember 2026',
      javaneseDateLabel: 'Sabtu Legi',
      time: '11:00 – 12:30 WIB',
      startHourWib: 11,
      durationHours: 1.5,
      place: 'Kediaman Mempelai (Dusun Juworo)',
      address: 'Dsn. Juworo, Ds. Karangrejo, Kec. Gabus, Kab. Grobogan, Jawa Tengah',
      mapUrl:
        "https://www.google.com/maps/place/7%C2%B007'22.5%22S+111%C2%B011'27.1%22E/@-7.1229704,111.1907246,20.83z/data=!4m4!3m3!8m2!3d-7.1229134!4d111.1908493?hl=en&entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
    },
    {
      id: 'resepsi',
      title: 'Resepsi Pawiwahan',
      aksara: 'ꦥꦲꦂꦒꦾꦤ꧀ꦲꦒꦼꦁ',
      dateLabel: 'Sabtu, 12 Desember 2026',
      javaneseDateLabel: 'Sabtu Legi',
      time: '13:00 – 16:30 WIB',
      startHourWib: 13,
      durationHours: 3.5,
      place: 'Kediaman Mempelai (Dusun Juworo)',
      address: 'Dsn. Juworo, Ds. Karangrejo, Kec. Gabus, Kab. Grobogan, Jawa Tengah',
      mapUrl:
        "https://www.google.com/maps/place/7%C2%B007'22.5%22S+111%C2%B011'27.1%22E/@-7.1229704,111.1907246,20.83z/data=!4m4!3m3!8m2!3d-7.1229134!4d111.1908493?hl=en&entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
    },
  ],
  gifts: [
    {
      id: 'bca',
      type: 'bank',
      name: 'Bank Central Asia (BCA)',
      number: '0374829104',
      holder: 'Andini Adelia Putri',
    },
    {
      id: 'gopay',
      type: 'ewallet',
      name: 'GoPay / QRIS Pawiwahan',
      number: '081227948301',
      holder: 'Vintano Rosi',
      qr: 'QRIS-PAWIWAHAN-ANDINI-VINTANO-2026',
    },
  ],
  giftAddress:
    'Dsn. Juworo, Ds. Karangrejo, Kec. Gabus, Kab. Grobogan, Jawa Tengah 58183 (a.n. Andini Adelia Putri & Vintano Rosi)',
  audio: {
    src: '/audio/song.mp3',
    title: 'Young and Beautiful (Chorus Loop)',
    artist: 'Lana Del Rey — Instrumental / Klip Reff',
    sectionNote: 'Diputar berulang dengan crossfade 1500ms setelah segel dibuka.',
    loopStart: 4,
    loopEnd: 48,
    volume: 0.6,
    crossfadeMs: 1500,
    spotifyEmbedUrl: 'https://open.spotify.com/track/2nMeu6UenVvwUktBCpLMK9',
  },
  rsvpEndpoint: '',
  wishesEndpoint: '',
};
