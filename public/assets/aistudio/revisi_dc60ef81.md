# Undangan Pernikahan 3D "Sugeng Rawuh": Pelaminan Jawa, Maroon & Hitam (Revisi Final)

> File tunggal untuk AI coding agent (Claude Code, Cursor, dll). Baca seluruhnya sebelum menulis kode. File ini **menggantikan** semua brief sebelumnya (`undangan-jawa-3d.md`, `undangan-jawa-3d-v2.md`). Jika ada hal ambigu, ambil keputusan terbaik sesuai arah di sini, lalu catat asumsinya di `README.md`.

---

## 0. PRIORITAS UTAMA: ini UNDANGAN, bukan demo 3D

Kegagalan yang pernah terjadi: agent menghabiskan usaha pada adegan 3D sampai yang terlihat hanya latar tanpa nama, tanggal, atau acara. **Itu dianggap gagal.** Bagian ini mengalahkan bagian lain bila ada pertentangan.

Urutan kepentingan:
1. **Informasi undangan terbaca jelas:** nama mempelai, tanggal, waktu dan tempat acara, nama tamu, RSVP, hadiah.
2. **Amplop dan perpindahan antar-section:** momen "wow" yang dirancang dengan sengaja.
3. **Suasana 3D** (pelaminan, pengantin) sebagai latar yang mendukung teks.
4. **Dekorasi** (partikel, ornamen kecil) paling akhir.

Aturan wajib:
- **Setiap layar harus memuat teks undangan yang relevan.** Tidak boleh ada layar yang hanya berisi adegan 3D, kecuali selama transisi (maksimal 3 detik) dan animasi amplop.
- **Hero:** nama mempelai (aksara Jawa + Latin) setinggi minimal 18% tinggi layar, tanggal di bawahnya, dan "Kepada Yth. {nama tamu}" di atasnya. Objek 3D diredupkan di belakang teks agar kontras teks minimal 4,5:1.
- **Zona teks aman:** mobile portrait, teks di sepertiga atas atau sepertiga bawah layar; desktop, teks di kolom kiri atau kanan selebar 38%. Pengantin berada di area lain. Teks padat memakai panel `maroon-pekat` 78% dengan `backdrop-filter: blur(10px)`.
- **Ukuran:** pasangan pengantin (subjek adegan) maksimal 45% tinggi layar dan berada di sepertiga bawah. Dekorasi lain maksimal 25% tinggi layar. Tidak ada yang menutupi teks.
- **Tidak ada wayang.** Jangan membuat kelir atau tokoh wayang. (File `wayang-*` di paket aset lama tidak dipakai.)
- **Urutan kerja: teks dan navigasi dulu, 3D belakangan** (lihat bagian 14).
- **Bukti wajib:** setelah tiap section selesai, ambil screenshot 390x844 (mobile) dan 1440x900 (desktop), simpan di `docs/screenshots/`, lalu periksa apakah teks utama section itu terbaca. Bila layar hanya menampilkan adegan, perbaiki sebelum lanjut.

```
SALAH (hanya adegan)              BENAR (undangan dulu)
+----------------------+          +----------------------+
|                      |          |  Kepada Yth. Budi    |
|  [gebyok, tangga]    |          |  [aksara nama]       |
|     pengantin        |          |  Ayu  &  Bagas       |
|                      |          |  Sabtu, 12 Des 2026  |
|                      |          |  [pengantin naik     |
+----------------------+          |   tangga, di bawah]  |
                                  +----------------------+
```

---

## 1. Keputusan Pemilik Undangan (jangan diubah)

| Aspek | Keputusan |
|---|---|
| Jenis | Undangan pernikahan digital, dibuka lewat link personal |
| Gaya | *Old money*, berwibawa dan tenang, ala keraton, ornamen Jawa |
| Warna | **Maroon dominan**, hitam sebagai kontras, gading untuk teks. **Tanpa warna logam**, kecuali **segel lilin di amplop sampul** (emas kuno seperti gambar referensi; bisa diganti versi maroon lewat config) |
| Tipografi | **Aksara Jawa menonjol di judul**, selalu disertai tulisan Latin |
| Stack | React + React Three Fiber + Framer Motion |
| Sampul | **Amplop 3D** maroon berelief bunga, panel bertepi bergelombang, segel lilin (gambar referensi pemilik). Diketuk, amplop terbuka lalu kamera zoom masuk ke adegan berikutnya |
| Latar adegan | **Pelaminan Jawa:** tangga berkarpet maroon, gebyok ukir, kursi pengantin, kembar mayang. **Tanpa wayang** |
| Adegan utama | **Sepasang pengantin dilihat dari belakang menaiki tangga pelaminan**, pengantin wanita mengangkat jarik / membawa busana Jawa |
| Scroll | **Berpindah section dengan transisi sinematik yang berbeda-beda** (zoom ke objek, orbit, tilt, whip-pan, tirai menyapu, crane). **Bukan sekadar zoom maju-mundur.** Lihat bagian 6 |
| Ritme | Pelan dan sinematik, tiap transisi 2 sampai 3 detik, semua gerak smooth |
| Bagian isi | Profil mempelai + orang tua, detail acara + peta, hitung mundur + simpan ke kalender, hadiah digital, RSVP + ucapan & doa |
| **Tidak ada** | Kisah cinta, galeri foto, dresscode, protokol, live streaming, wayang |
| Mempelai | Foto asli dipadukan dengan bentuk lengkung gapura gebyok (double exposure) |
| Musik | *Young and Beautiful* (Lana Del Rey), bagian reff, di-loop. Lihat bagian 10 untuk catatan lisensi |

---

## 2. Cerita Singkat Pengalaman

1. Tamu melihat **amplop maroon**. Ia mengetuk segel.
2. Amplop terbuka, kamera **zoom menembus celah** dan mendarat di **kaki tangga pelaminan**. Dua pengantin berdiri membelakangi kamera.
3. Setiap kali tamu menggeser ke section berikutnya, kamera melakukan **gerakan yang berbeda** (zoom ke ukiran, orbit, tilt ke lentera, dst.), pasangan **naik satu anak tangga**, dan section baru langsung tampil.
4. Di akhir, pasangan sampai di dais, berbalik, dan duduk di kursi pelaminan sebagai siluet kontra-cahaya. Kamera naik dan menjauh, layar menggelap perlahan: **Matur Nuwun**.

Metafora: "naik selangkah demi selangkah menuju hari bahagia".

---

## 3. Stack Teknologi

| Kebutuhan | Pilihan |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| Postprocessing | `@react-three/postprocessing` (Bloom tipis, Vignette, Noise halus, blur gerak untuk whip-pan) |
| Animasi UI & transisi | `framer-motion` (`animate`, `useMotionValue`) |
| Navigasi section | Kustom (state machine di bagian 6), **bukan** `ScrollControls` |
| Easing kamera | `maath/easing` (`damp3`, `dampE`) |
| State | `zustand` |
| Styling | Tailwind CSS + CSS variables |
| Audio | Web Audio API (loop crossfade) atau `howler` |
| Backend ringan (opsional) | Supabase atau Google Apps Script untuk RSVP dan ucapan |

Objek 3D dibuat **prosedural** (bentuk dari SVG, shader, tekstur kecil). Jangan memakai model GLB berat kecuali pemilik menyediakan model pengantin (batas 3 MB, kompresi Draco).

---

## 4. Sistem Desain

### 4.1 Palet warna (maroon dominan, tanpa logam)

| Token | Hex | Peran | Porsi kira-kira |
|---|---|---|---|
| `--maroon-keraton` | `#6B1424` | Warna utama: karpet, tirai, kain, amplop | 40% |
| `--maroon-pekat` | `#3B0A14` | Latar gelap, kedalaman, panel teks | 20% |
| `--hitam-kelir` | `#0B0506` | Kontras: bayangan, siluet, penutup | 25% |
| `--maroon-sogan` | `#8E2233` | Highlight, tombol, hover, fokus | 5% |
| `--gading` | `#EADFCB` | Teks utama, garis ornamen, cahaya | 8% |
| `--gading-redup` | `#BFB19A` | Teks sekunder | 2% |

Aturan:
- Ornamen **tone-on-tone**: garis `maroon-sogan` di atas `maroon-keraton`, atau gading opasitas 15 sampai 35%. Tidak ada kilau metalik, gradasi emas, atau warna liar.
- Kayu gebyok dan kursi memakai cokelat-hitam kemerahan `#1A0C0A`, bukan emas. Cahaya lampu berwarna gading hangat `#F2E3C6`, bukan kuning.
- **Satu-satunya logam** adalah segel lilin amplop (emas kuno `#B08D57`). Bila pemilik ingin tanpa logam, set `seal.style = "maroon"`.
- Kontras teks minimal WCAG AA.
- Tombol utama: latar `maroon-sogan`, teks gading, tepi gading tipis. Tombol sekunder: transparan dengan garis gading.

### 4.2 Tipografi: aksara Jawa menonjol

- **Judul section:** `Noto Sans Javanese`, ukuran besar (clamp 36 sampai 88px), gading. Di bawahnya selalu ada tulisan Latin (`Cormorant Garamond` italic, 20 sampai 28px) sebagai bacaan, misalnya aksara "Sugeng Rawuh" diikuti "Selamat datang".
- **Nama mempelai:** nama aksara Jawa besar, nama Latin lengkap di bawahnya.
- **Body:** `Spectral`, 16 sampai 18px, line-height 1,7, panjang baris maksimal sekitar 60 karakter.
- Muat font dengan `font-display: swap`, sediakan fallback; bila aksara gagal dimuat, tulisan Latin tetap tampil.
- **Akurasi aksara:** simpan teks aksara sebagai field di config, **jangan konversi otomatis**; minta penutur aksara Jawa memeriksa, terutama nama mempelai.
- Aksara siap pakai (periksa lagi sebelum rilis): Sugeng Rawuh `ꦱꦸꦒꦼꦁꦫꦮꦸꦃ`, Matur Nuwun `ꦩꦠꦸꦂꦤꦸꦮꦸꦤ꧀`.
- Hindari: label kapital kecil di atas setiap judul, satu kata diwarnai berbeda di tengah judul.
- Reveal teks: satu gaya saja, **ink-wipe** (topeng menyapu dari kiri ke kanan, 0,9 detik) saat section tiba. Jangan fade-up di setiap elemen.

### 4.3 Ornamen

- **Parang** (tekstur kain halus, jarik), **Kawung** (lantai, bingkai gebyok), **Sidomukti** (bingkai kartu mempelai), **Lung-lungan** (ukiran gebyok, sudut bingkai), **Melati** (emblem segel, roncen).
- **Gebyok:** sekat kayu ukir sebagai latar dais, relief kawung + lung-lungan, lengkung gapura di tengah, **kayon** kecil sebagai ornamen puncak.
- **Kembar mayang:** sepasang rangkaian janur berbentuk pohon di kiri dan kanan dais.

---

## 5. Alur Website

Pasangan naik satu anak tangga di setiap perpindahan section.

| # | Section | Isi | Posisi pasangan |
|---|---|---|---|
| 0 | **Sampul: amplop** | Nama tamu (`?to=`) timbul di amplop, inisial mempelai, "Ketuk segel untuk membuka" | Belum terlihat |
| 1 | **Hero** | Aksara + nama mempelai, tanggal, "Kepada Yth. {nama}" | Kaki tangga (anak tangga 0), membelakangi kamera |
| 2 | **Salam pembuka** | "Sugeng Rawuh", kalimat undangan singkat | Anak tangga 1 |
| 3 | **Mempelai** | Dua kartu double exposure + nama orang tua | Anak tangga 2 |
| 4 | **Hitung mundur** | Hari, jam, menit, detik; **Simpan ke Kalender** | Anak tangga 3 |
| 5 | **Acara** | Akad, Panggih, Resepsi: waktu, tempat, alamat, **Lihat Lokasi** | Anak tangga 4 |
| 6 | **Hadiah digital** | Rekening / e-wallet, **Salin Nomor** | Anak tangga 5 |
| 7 | **RSVP & ucapan** | Form kehadiran, form ucapan, daftar ucapan | Anak tangga 6 (landing), berhenti |
| 8 | **Penutup** | "Matur Nuwun", nama pasangan | Naik ke dais, berbalik, duduk |

Wireframe kasar (mobile):

```
HERO                               MEMPELAI
+--------------------------+       +--------------------------+
| Kepada Yth. {nama}       |       |  [aksara nama wanita]    |
| [aksara nama pasangan]   |       |  +--------------------+  |
| Ayu  &  Bagas            |       |  | foto + gapura      |  |
| Sabtu, 12 Des 2026       |       |  +--------------------+  |
|                          |       |  Putri dari Bpk … & Ibu… |
|   ( pasangan di tangga ) |       |  (ulang untuk pria)      |
+--------------------------+       +--------------------------+
```

Perataan: judul dan nama rata tengah; paragraf, alamat, dan form rata kiri.

---

## 6. SCROLL: Berpindah Section dengan Transisi Sinematik

### 6.1 Prinsip
- Tamu **tidak** menggulir halaman panjang sambil kamera hanya maju-mundur. Setiap gerakan scroll memindahkan **satu section penuh**, lewat **gerakan kamera yang berbeda** yang berakhir tepat di section tujuan.
- Tiap transisi memiliki **objek tujuan** (apa yang di-zoom atau dituju) dan **teknik** sendiri (tabel 6.3). Dua transisi berurutan tidak boleh memakai teknik yang sama.
- Setiap transisi berdurasi 2 sampai 3 detik, easing lembut (`cubic-bezier(0.22, 1, 0.36, 1)`), tanpa bounce.
- Transisi **bisa dibalik** (scroll ke atas memutar gerakan yang sama secara mundur).

### 6.2 Mekanisme input: "tarik lalu selesai" (scrub and commit)
- Gulir roda, geser jari, tombol keyboard (`↓`, `↑`, `PageDown`, `PageUp`, `Space`) menggerakkan **progres transisi** `p` (0 sampai 1) secara langsung, sehingga terasa fisik: gulir sedikit, kamera mulai bergerak.
- Bila gulir berhenti (120 ms tanpa input): jika `p > 0,35` → **selesaikan otomatis** sampai section tujuan; jika kurang → **kembali** ke section semula dengan halus.
- Selama animasi otomatis berjalan, input diabaikan (`busy`).
- Satu gesture besar tidak boleh melompati dua section.
- Section dengan konten panjang (Acara di mobile, RSVP & ucapan): panel teks boleh di-scroll sendiri; transisi baru berjalan bila panel sudah di ujung dan tamu menggulir lagi (overscroll).
- Mobile: `touch-action: none` pada kontainer utama (kecuali panel yang bisa di-scroll), `overscroll-behavior: none`.

Kerangka kode (sesuaikan):

```ts
// scroll/useSectionNav.ts
import { animate } from "framer-motion";
import { create } from "zustand";

type Nav = { index: number; p: number; busy: boolean }; // p: -1..1 (negatif = mundur)
export const useNav = create<Nav>(() => ({ index: 0, p: 0, busy: false }));

let idle = 0;
export function scrub(delta: number) {            // dari wheel / touchmove / keyboard
  const s = useNav.getState();
  if (s.busy) return;
  let p = Math.max(-1, Math.min(1, s.p + delta / 900));  // ±900px gulir ≈ satu transisi penuh
  if ((s.index === 0 && p < 0) || (s.index === LAST && p > 0)) p = 0;
  useNav.setState({ p });
  clearTimeout(idle);
  idle = window.setTimeout(release, 120);
}

function release() {
  const { index, p } = useNav.getState();
  if (!p) return;
  const dir = Math.sign(p);
  const commit = Math.abs(p) > 0.35;
  const shot = shotBetween(index, index + dir);
  useNav.setState({ busy: true });
  animate(p, commit ? dir : 0, {
    duration: shot.duration * Math.abs((commit ? dir : 0) - p),
    ease: shot.ease,
    onUpdate: (v) => useNav.setState({ p: v }),
    onComplete: () => {
      const next = commit ? index + dir : index;
      useNav.setState({ index: next, p: 0, busy: false });
      history.replaceState(null, "", "#" + SECTIONS[next].id);
    },
  });
}
// goTo(i): lompatan langsung (titik navigasi) memakai transisi singkat 1,2 s (bloom + crossfade),
// tidak memutar semua shot di antaranya.
```

`CameraRig` membaca `index` dan `p`, lalu memainkan shot `index → index±1` pada posisi `|p|`. Posisi pasangan di tangga, kain, dan teks section juga ditentukan oleh `index` dan `p`, jadi semuanya selalu sinkron.

### 6.3 Daftar shot (satu transisi satu teknik)

| Dari → ke | Teknik | Objek tujuan / gerak | Efek pendukung | Durasi | Pasangan |
|---|---|---|---|---|---|
| Amplop → Hero | **Zoom menembus celah** | Celah X amplop | Cahaya gading memenuhi layar lalu mereda | 3,6 s | Muncul di kaki tangga |
| Hero → Salam | **Zoom ke ukiran (match cut)** | Relief gebyok di balik pasangan; FOV 34→18 | Ukiran menjadi bingkai gapura, panel Salam muncul lewat topeng berbentuk gapura | 2,6 s | Naik ke anak tangga 1 di awal |
| Salam → Mempelai | **Orbit** | Kamera mengitari pasangan sekitar 35° ke kanan sambil naik 0,4 unit; wajah tetap membelakangi atau tertutup bayangan | Dua kartu foto masuk dari kiri dan kanan | 2,8 s | Anak tangga 2 |
| Mempelai → Hitung mundur | **Tilt ke atas** | Kamera menengadah ke lampu gantung / lentera (pitch +25°) | Flare cahaya, angka hitung mundur menyala seperti lentera | 2,4 s | Anak tangga 3 |
| Hitung mundur → Acara | **Whip-pan** | Menoleh cepat ke kembar mayang kiri, lalu mengendap | Blur gerak searah, rack focus ke tiga kartu acara yang berjajar | 1,4 s pan + 1,0 s mengendap | Anak tangga 4 |
| Acara → Hadiah | **Zoom makro ke melati** | Zoom ke satu bunga pada roncen melati yang menjuntai | Pusat bunga melebar menjadi lingkaran (iris) yang berisi panel Hadiah | 2,6 s | Anak tangga 5 |
| Hadiah → RSVP | **Tirai menyapu (drape wipe)** | Tirai maroon 3D melintas dari kanan ke kiri menutupi layar | Di balik tirai kamera sudah berada di landing, latar diburamkan agar form terbaca | 2,2 s | Anak tangga 6, berhenti |
| RSVP → Penutup | **Crane out** | Kamera naik dan mundur memperlihatkan seluruh pelaminan | Pasangan naik ke dais, berbalik, duduk; lampu meredup, layar menggelap perlahan | 3,0 s | Dais, duduk |

Ketentuan umum: pada awal tiap transisi, teks section lama memudar dalam 0,4 detik; teks section baru muncul (ink-wipe) pada 60% akhir transisi.

### 6.4 Definisi teknik
- **Zoom ke objek (match cut):** dolly + turunkan FOV menuju satu objek; di puncak zoom, objek itu menjadi bingkai atau topeng (`clip-path`) tempat panel section baru terbuka. Hindari cut keras.
- **Orbit:** kamera bergerak pada busur mengelilingi titik fokus (pasangan), batas sudut 40° agar wajah tidak pernah terlihat.
- **Tilt / crane:** rotasi pitch atau gerak vertikal; dipakai untuk menuju benda di atas (lentera) atau memperlihatkan keseluruhan ruang.
- **Whip-pan:** pan horizontal cepat dengan blur gerak direksional (shader sederhana atau pass post-process), lalu mengendap dengan rack focus.
- **Drape wipe:** plane kain maroon bergelombang (vertex shader) bergerak melintasi kamera; dipakai untuk penutup transisi yang butuh latar bersih (form).
- **Iris dari bunga:** lingkaran `clip-path` yang membesar dari titik pusat bunga di layar.

### 6.5 Navigasi tambahan
- **Penanda titik** di tepi kanan (desktop) atau bawah (mobile): 8 titik, tiap titik memiliki label saat disorot (aksara + Latin). Titik aktif berukuran lebih besar, warna gading; lainnya gading 35%.
- Klik titik → `goTo(i)`.
- **Hash:** `#hero`, `#salam`, `#mempelai`, `#hitung-mundur`, `#acara`, `#hadiah`, `#rsvp`, `#penutup`. Saat dibuka dengan hash, langsung tampil di section itu tanpa memutar transisi.
- Petunjuk awal di hero (hanya sekali): isyarat panah kecil "Geser untuk lanjut", hilang setelah gerakan pertama.

### 6.6 Gerak diam (idle) agar tidak statis
- Kamera melayang sangat pelan (±0,02 unit, siklus 8 detik) di setiap section.
- Debu partikel, kedipan lentera, ayunan roncen melati, napas pasangan (sway 0,5°).
- Hanya itu. Tidak ada animasi tambahan yang berebut perhatian dengan teks.

### 6.7 Aksesibilitas dan fallback
- `prefers-reduced-motion`: semua transisi diganti crossfade 0,6 detik tanpa gerak kamera; pasangan dalam pose statis di anak tangga yang sesuai.
- Tombol "Berikutnya" / "Sebelumnya" yang terlihat dan dapat difokus (keyboard), untuk pengguna yang tidak nyaman dengan gesture.
- Tanpa WebGL: tiap section menjadi panel layar penuh 2D dengan transisi CSS (`clip-path` iris, geser, tirai) bergaya sama.

---

## 7. Adegan 3D

Satu `<Canvas>` fixed di belakang, UI HTML di atasnya.

### 7.1 Amplop (sampul)

Referensi pemilik: amplop maroon berelief bunga, dua panel samping bertepi bergelombang (scallop) berjahit titik, dua lipatan segitiga atas-bawah, segel lilin di titik silang. Saat dibuka, panel bergeser ke samping, segel ikut terbawa panel kiri, cahaya hangat menyorot dari celah berbentuk X.

Semua lapisan berada di **Canvas yang sama** dengan adegan pelaminan, sehingga zoom menembus celah menyatu tanpa cut (tanpa video).

| Lapisan (belakang ke depan) | Isi |
|---|---|
| 0 | Adegan pelaminan, sudah dimuat, gelap dan diburamkan sampai amplop terbuka |
| 1 | Bidang cahaya gading (plane emissive) di belakang celah |
| 2 | Lipatan segitiga atas dan bawah, `maroon-pekat` |
| 3 | Panel kanan, `maroon-keraton`, scallop |
| 4 | Panel kiri, menimpa panel kanan di tengah, membawa segel |
| 5 | Segel lilin di titik silang |

Bahan dan detail:
- **Relief:** motif lung-lungan + melati (aset `lung-lungan-*`) sebagai `bumpMap` (`bumpScale` ±2), cahaya utama dari kiri atas, tone-on-tone. Tengah panel polos seperti referensi.
- **Tepi bergelombang:** `THREE.Shape` dengan tepi diagonal bergelombang (radius 0,10 sampai 0,14), diekstrusi tipis (depth 0,02, bevel kecil).
- **Jahitan:** garis putus-putus 1,5px mengikuti tepi, offset 0,03, warna `maroon-sogan` 60%.
- **Segel:** lilin bergelombang, cincin tepi, emblem melati timbul (`melati-emblem`). `MeshPhysicalMaterial` clearcoat 0,6. `"gold"` (metalness 0,85, roughness 0,35, `#B08D57`) atau `"maroon"` (`#8E2233`, emblem gading). Pantulan lewat `<Environment>` prosedural dari `Lightformer`, tanpa mengunduh HDR.
- **Teks di amplop:** relief huruf "Kepada Yth." dan nama tamu di bawah (gading 70%, ikut `bumpMap`), inisial mempelai di atas. Terbaca di layar 360px, tidak menutupi motif utama.

Idle:
- Amplop "bernapas": rotasi X/Y maksimal 1,5° mengikuti kursor atau giroskop; sapuan cahaya pelan melintasi relief tiap 6 detik.
- Cincin tipis di sekeliling segel berdenyut (2,4 detik); sebelum adegan siap, berubah menjadi **cincin progres pemuatan**, dan segel `disabled` ("Menyiapkan undangan…"). Setelah siap, label aksesibilitas: **Buka Undangan**.
- Petunjuk teks: **Ketuk segel untuk membuka**.
- Kamera `z = 6`, FOV 38. Mobile portrait: amplop memenuhi layar dengan margin 4%. Desktop: tinggi 88% viewport di atas `hitam-kelir` dengan vignette.

### 7.2 Amplop terbuka dan zoom ke Hero (total ±3,6 detik)

| Waktu | Kejadian |
|---|---|
| 0,0 s | Segel ditekan: skala 0,94 lalu kembali, `navigator.vibrate(15)` bila ada. Petunjuk dan nama tamu memudar. Audio mulai fade in |
| 0,3 sampai 1,0 s | Segel terangkat sedikit (z +0,05), cincin cahaya melebar lalu hilang |
| 0,6 sampai 2,6 s | Panel kiri (membawa segel) bergeser ke kiri dan berputar halus (Y 12°, Z −6°). Panel kanan menyusul 0,15 s kemudian. Bayangan jatuh di lipatan dalam |
| 0,8 sampai 2,4 s | Cahaya gading menyorot dari celah X, Bloom naik lalu turun |
| 1,4 sampai 3,2 s | Lipatan segitiga melipat keluar (rotasi ±70°) dan memudar |
| 1,0 sampai 3,4 s | Kamera dolly `z 6 → 0,8`, FOV `38 → 26`, roll 1°: zoom menembus celah ke kaki tangga pelaminan |
| 2,6 sampai 3,6 s | Cahaya mereda, hero tampil. Navigasi section dibuka setelah 3,6 s |

Opsional: segel bisa ditarik dengan jari; bila ditarik lebih dari 40%, animasi menyelesaikan sisanya. Ketuk tetap harus berfungsi. Reduced motion: panel memudar (crossfade 0,8 s) langsung ke hero.

### 7.3 Set pelaminan (prosedural)

Satuan meter. Semua komponen dibuat dari geometri sederhana, tekstur kecil, dan bump map dari aset.

| Elemen | Spesifikasi |
|---|---|
| **Tangga** | 7 anak tangga, lebar 3,2, injakan 0,40, tinggi 0,22. Karpet maroon `#6B1424` dengan garis tepi gading tipis dan motif kawung tone-on-tone. Sisi tangga kayu gelap |
| **Dais (pelaminan)** | 4,0 x 3,0, tinggi 1,54, lantai kayu gelap. Dua kursi pengantin berukir bersandaran tinggi |
| **Gebyok** | Sekat kayu ukir 6,0 lebar x 4,5 tinggi di belakang dais. Relief kawung + lung-lungan (height map), lengkung gapura di tengah, kayon kecil di puncak |
| **Kembar mayang** | Sepasang di kiri-kanan dais, tinggi 1,6, janur berbentuk pohon di atas penyangga |
| **Janur lengkung** | Lengkung daun janur di atas puncak tangga (instanced) |
| **Roncen melati** | 5 untai menjuntai dari langit-langit, tiap untai rangkaian bola kecil gading dengan ayunan pendulum |
| **Lentera / lampu gantung** | 4 lentera kaca dengan inti emissive gading hangat, tiap satu memiliki point light redup |
| **Tirai** | Tirai maroon di kiri-kanan, kain sederhana bergelombang (vertex shader) |
| **Lantai** | Batu gelap berkilau halus (roughness 0,4) |
| **Atmosfer** | Debu partikel (250, di mobile 100), plane kabut tipis di depan dais |

### 7.4 Pengantin (dilihat dari belakang)

**Pengantin wanita (kiri), tinggi ±1,62:**
- Sanggul / gelung besar hitam dengan **roncen melati** menjuntai ke punggung (rantai pendulum 5 sampai 7 segmen dengan pegas).
- **Kebaya maroon pekat** dengan tekstur renda (bump), lengan panjang.
- **Kain jarik batik parang** (tile `parang`) panjang sampai mata kaki; **selendang / sampur**.
- **Slepe** (ekor kain tipis) di belakang yang menjuntai di anak tangga di depan kamera, bergerak dengan flutter.
- **Tangan kiri mengangkat sedikit jarik** (gestur *nyincing*) saat menaiki tangga; tangan kanan menggenggam tangan pengantin pria.
- Langkah kecil dan anggun khas busana jarik.

**Pengantin pria (kanan), tinggi ±1,72:**
- **Blangkon** batik dengan **mondholan** (tonjolan di belakang) yang khas dari belakang.
- **Beskap hitam**, jarik batik, **keris terselip di punggung** (siluet khas dari belakang), sandal.
- Tangan kiri menggenggam tangan pengantin wanita.

Aturan:
- Pasangan **tidak pernah menghadap kamera dengan wajah terlihat**. Wajah asli hanya di kartu Mempelai. Saat berbalik di penutup, mereka siluet kontra-cahaya dan wajahnya berada dalam bayangan.
- Gaya **stylized** (low-poly halus atau potongan kertas 3D), bukan realistis: badan dari bentuk dasar (kapsul, kerucut terpotong), jarik = silinder meruncing bertekstur parang, kebaya = torso dengan bump renda, kepala = bola + sanggul / blangkon. Kaki hanya terlihat sebagai ujung sandal yang menyembul bergantian dari bawah jarik; tidak perlu rig tulang penuh, cukup sendi bahu, siku, kepala, dan pinggul.
- Bila model 3D buatan kode kurang meyakinkan, gunakan **2,5D (potongan kertas bertingkat) dengan kontra-cahaya** (silhouette harus terbaca). Bila pemilik menyediakan model GLB, pakai itu.

### 7.5 Animasi naik tangga
- Siklus langkah digerakkan oleh **perpindahan section**: pada saat `index → index+1`, pasangan naik satu anak tangga (±1,2 s, easing lembut) selagi kamera melakukan gerakannya. Saat section diam, mereka berhenti dengan napas dan ayunan kain halus.
- Jarik wanita dan slepe: flutter amplitudo kecil; roncen melati: pendulum dengan pegas; sanggul stabil.
- Penutup: dari landing ke dais (2 anak tangga terakhir), berbalik 180° dalam 2,5 detik, lalu duduk di kursi pelaminan. Kamera crane out.

### 7.6 Pencahayaan (kunci agar sinematik dan tahan kekurangan model)
- **Kontra-cahaya (backlight):** lampu hangat kuat (gading) di atas dais menyorot ke arah kamera; gebyok bercahaya di belakang pasangan. Pasangan tampak semi-siluet dengan **rim light gading** di tepi kebaya dan blangkon.
- **Fill** dari sisi kamera sangat redup (15%) berwarna maroon agar kain tetap terbaca, bukan hitam pekat.
- Bagian bawah tangga lebih gelap daripada dais agar mata tertuntun naik.
- Bloom 0,3 sampai 0,5 pada lentera dan gebyok; Vignette gelap di tepi; Noise film opacity ±0,04; DOF ringan hanya di desktop; blur gerak hanya saat whip-pan.
- Area teks aman (bagian 0) harus tetap gelap dan bersih: tempatkan lampu dan objek terang di luar zona itu.

---

## 8. Detail Konten Tiap Section

### 8.1 Hero dan Salam
- Hero: "Kepada Yth. {nama tamu}", nama pasangan (aksara + Latin), tanggal (Masehi dan penanggalan Jawa).
- Salam: "Sugeng Rawuh" (aksara + Latin), kalimat undangan 2 sampai 3 baris. Contoh: *"Dengan memohon restu Gusti Allah, kami mengundang Bapak/Ibu/Saudara untuk hadir di hari bahagia kami."*

### 8.2 Mempelai: double exposure
- Dua **kartu portrait**, foto asli dipadukan dengan **bentuk lengkung gapura gebyok** (SVG ke tekstur alpha) sebagai mask.
- Shader fragmen pada plane 3D (atau canvas 2D sebagai fallback):
  1. Foto menjadi hitam-putih lalu **duotone**: bayangan `#0B0506` → tengah `#6B1424` → terang `#EADFCB`.
  2. Mask gapura: di dalam bentuk foto jelas, di luar memudar ke gradasi maroon pekat, relief ukiran tipis tampak menyatu dengan foto.
  3. Parallax halus mengikuti kursor atau giroskop (maks 12px).
- Di bawah kartu: nama Latin lengkap dan "Putra / Putri dari Bapak … & Ibu …". Bingkai motif sidomukti tone-on-tone.
- Parameter `maskOffset` dan `maskScale` per orang di config agar wajah tidak tertutup bagian gelap.

### 8.3 Hitung mundur dan kalender
- Hitung mundur dari `weddingDate` (WIB), empat angka besar menyala seperti lentera.
- **Simpan ke Kalender:** file `.ics` dan tautan Google Calendar, satu entri per acara.

### 8.4 Acara dan peta
- Tiga acara berjajar (geser horizontal di mobile): **Akad Nikah**, **Panggih**, **Resepsi**, judul aksara + Latin.
- Isi: hari dan tanggal (Masehi dan penanggalan Jawa), jam, tempat, alamat. **Lihat Lokasi** membuka Google Maps di tab baru. Jangan menanam iframe peta.

### 8.5 Hadiah digital
- Daftar rekening dan e-wallet (nama, nomor, atas nama), **Salin Nomor** (berubah menjadi **Tersalin** 2 detik dengan centang kecil). Opsional gambar QR. Alamat pengiriman hadiah (opsional).

### 8.6 RSVP dan ucapan
- RSVP: nama (terisi dari `?to=`), jumlah tamu (stepper 1 sampai 5), Hadir / Berhalangan hadir, **Kirim Konfirmasi**.
- Ucapan: nama, pesan (maks 300 karakter), **Kirim Ucapan**. Daftar ucapan dengan **Lihat lebih banyak**. Perlindungan spam: rate limit dan honeypot.
- Panel `maroon-pekat` 80% dengan backdrop blur di atas latar yang diburamkan.

### 8.7 Penutup
- "Matur Nuwun" (aksara + Latin), nama pasangan, kalimat penutup: *"Matur nuwun atas doa dan restu Panjenengan sekalian."*

### 8.8 Microcopy
Tombol: **Buka Undangan**, **Lihat Lokasi**, **Salin Nomor**, **Simpan ke Kalender**, **Kirim Konfirmasi**, **Kirim Ucapan**, **Berikutnya**, **Sebelumnya**. Gagal kirim: "Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi." Berhasil: "Konfirmasi terkirim. Matur nuwun."

---

## 9. Config Terpusat

Semua konten diedit di `src/invitation.config.ts`:

```ts
export const invitation = {
  couple: {
    bride: { name: "Nama Mempelai Wanita", aksara: "", fullName: "…",
             parents: "Putri dari Bapak … & Ibu …", photo: "/img/bride.jpg", maskOffset: [0, 0], maskScale: 1 },
    groom: { name: "Nama Mempelai Pria", aksara: "", fullName: "…",
             parents: "Putra dari Bapak … & Ibu …", photo: "/img/groom.jpg", maskOffset: [0, 0], maskScale: 1 },
  },
  weddingDate: "2026-12-12T09:00:00+07:00",
  javaneseDate: "Sabtu …",             // periksa pasaran (Legi/Pahing/dst.) untuk tanggal sebenarnya
  events: [
    { title: "Akad Nikah", aksara: "", time: "09:00 WIB", place: "…", address: "…", mapUrl: "https://maps.google.com/..." },
    { title: "Panggih",    aksara: "", time: "11:00 WIB", place: "…", address: "…", mapUrl: "…" },
    { title: "Resepsi",    aksara: "", time: "18:00 WIB", place: "…", address: "…", mapUrl: "…" },
  ],
  gifts: [
    { type: "bank", name: "BCA", number: "0000000000", holder: "Atas Nama" },
    { type: "ewallet", name: "GoPay", number: "08xxxxxxxxxx", holder: "Atas Nama", qr: "" },
  ],
  giftAddress: "",
  seal: { style: "gold" },              // "gold" | "maroon"
  audio: { src: "/audio/song.mp3", loopStart: 0, loopEnd: 0, volume: 0.6, crossfadeMs: 1500 },
  rsvpEndpoint: "",
  wishesEndpoint: "",
  scene: { steps: 7, brideOutfit: "kebaya-maroon", groomOutfit: "beskap-hitam" },
};
```

Daftar shot di `src/scroll/shots.ts`, satu entri per transisi:

```ts
export const SHOTS = [
  { from: 1, to: 2, technique: "zoom-match-cut", target: "gebyok-relief", duration: 2.6, ease: [0.22, 1, 0.36, 1], coupleStep: 1 },
  { from: 2, to: 3, technique: "orbit",           target: "couple",        duration: 2.8, ease: [0.22, 1, 0.36, 1], coupleStep: 2, orbitDeg: 35 },
  { from: 3, to: 4, technique: "tilt-up",         target: "lentera",       duration: 2.4, ease: [0.22, 1, 0.36, 1], coupleStep: 3 },
  { from: 4, to: 5, technique: "whip-pan",        target: "kembar-mayang", duration: 2.4, ease: [0.22, 1, 0.36, 1], coupleStep: 4 },
  { from: 5, to: 6, technique: "macro-iris",      target: "melati-roncen", duration: 2.6, ease: [0.22, 1, 0.36, 1], coupleStep: 5 },
  { from: 6, to: 7, technique: "drape-wipe",      target: "tirai",         duration: 2.2, ease: [0.22, 1, 0.36, 1], coupleStep: 6 },
  { from: 7, to: 8, technique: "crane-out",       target: "pelaminan",     duration: 3.0, ease: [0.22, 1, 0.36, 1], coupleStep: 8 },
];
```

---

## 10. Audio

Lagu: *Young and Beautiful* (Lana Del Rey), **bagian reff**, di-loop.

- **File audio disediakan pemilik.** Agent tidak boleh mengunduh atau menyertakan lagu; sediakan placeholder `public/audio/song.mp3` dan dokumentasikan cara menggantinya.
- Potong reff menjadi satu klip (40 sampai 60 detik), atau isi `loopStart` / `loopEnd` di config.
- **Loop mulus:** dua sumber audio saling crossfade (`crossfadeMs` 1500) di sekitar titik loop.
- Audio dimulai setelah segel amplop ditekan (aturan autoplay browser), fade in 2 detik. Tombol mute / unmute melayang di pojok kanan bawah, status diingat selama sesi. Tab disembunyikan → pause; kembali → fade in.
- **Catatan lisensi (tulis di `README.md`):** lagu berhak cipta; memutar dari file sendiri di situs publik dapat menimbulkan klaim hak cipta atau pemblokiran hosting. Sediakan cadangan: (a) pemutar embed resmi (Spotify / YouTube) yang diklik pengunjung, atau (b) cover / instrumental berlisensi atau bebas royalti. `audio.src` harus mudah diganti.

---

## 11. Struktur Folder

```
src/
  main.tsx  App.tsx  invitation.config.ts
  store/useInvitation.ts
  scroll/
    useSectionNav.ts        // scrub + commit, goTo, keyboard, hash
    shots.ts                // daftar shot (bagian 9)
  scenes/
    Experience.tsx          // Canvas + postprocessing + CameraRig
    CameraRig.tsx           // memainkan shot berdasarkan index dan p
    Envelope.tsx  WaxSeal.tsx  EnvelopeFallback2D.tsx
    Pelaminan.tsx           // set: tangga, dais, lantai, atmosfer
    Gebyok.tsx  KembarMayang.tsx  Roncen.tsx  Lentera.tsx  Tirai.tsx
    Pengantin.tsx           // Bride + Groom (rig sederhana, kain, roncen)
    DustParticles.tsx
  transitions/
    IrisMask.tsx  DrapeWipe.tsx  WhipPanBlur.tsx  LightFlare.tsx
  sections/                 // overlay HTML per section
    Hero.tsx  Greeting.tsx  Couple.tsx  Countdown.tsx
    Events.tsx  Gifts.tsx  Rsvp.tsx  Closing.tsx
  components/
    DoubleExposureCard.tsx  NavDots.tsx  OrnamentFrame.tsx
    AudioToggle.tsx  CopyButton.tsx  InkWipeText.tsx
  audio/loopPlayer.ts
  shaders/
    doubleExposure.frag.ts  motionBlur.frag.ts  cloth.vert.ts
  styles/tokens.css
public/
  img/  audio/  fonts/  assets/
scripts/build-assets.ts
docs/screenshots/
```

---

## 12. Performa dan Aksesibilitas

- Target 60 fps di HP menengah, LCP sampul di bawah 2,5 detik (render amplop dulu, adegan pelaminan dimuat di latar; segel aktif setelah siap).
- `dpr={[1, 1.75]}` dengan `PerformanceMonitor`; bila fps turun, matikan bertahap: DOF → blur gerak → Noise → Bloom → kurangi partikel.
- Muat tekstur shot berikutnya di latar sebelum transisi dimulai.
- Tekstur maksimal 1024px (WebP / KTX2). Foto mempelai 800 sampai 1200px.
- Cek WebGL; tanpa WebGL tampilkan versi 2D statis dengan palet dan tipografi sama (bagian 6.7).
- Informasi penting (nama, tanggal, tempat, rekening) selalu tersedia sebagai teks HTML, bukan hanya di dalam canvas. Fokus keyboard terlihat. Teks alternatif pada foto.
- Responsif 360 sampai 1920px. Portrait: naikkan FOV, geser kamera agar pasangan tetap di sepertiga bawah dan teks tidak tertutup.
- Meta share: `og:title`, `og:description`, `og:image` (tangkapan layar amplop).

---

## 13. Fase 0: Siapkan Aset Dulu (WAJIB sebelum adegan 3D)

Simpan di `public/assets/` dan catat di `ASSETS.md` (nama, ukuran, cara membuat, status). Buat `scripts/build-assets.ts` yang mengubah SVG menjadi height map / PNG alpha otomatis, dan halaman `/assets-preview` (dev) untuk menilai semua aset berdampingan di latar maroon dan hitam.

| Aset | Status |
|---|---|
| `melati-emblem` (segel), `lung-lungan-kanan/kiri` (relief amplop), `kawung`, `parang`, `kayon` (ornamen puncak gebyok) | **Sudah ada** di `assets.zip` (SVG + height map). Boleh diperkaya |
| `wayang-kamajaya/kamaratih` | **Tidak dipakai lagi**, abaikan |
| **Gebyok:** relief kawung + lung-lungan + lengkung gapura, height map 2048x1536 | Dibuat agent |
| **Gapura mask** (lengkung ukir) untuk double exposure, SVG + PNG alpha | Dibuat agent |
| **Kembar mayang**, kursi pengantin, lentera, tirai, janur: bentuk prosedural dari SVG profil | Dibuat agent |
| **Roncen melati:** prosedural (bola gading + benang) | Dibuat agent |
| **Renda kebaya:** tile SVG → bump map | Dibuat agent |
| Font (`@fontsource/noto-sans-javanese`, `cormorant-garamond`, `spectral`), ikon, favicon (melati), gambar OG | Dibuat agent |
| **Foto mempelai** (rasio 4:5, 1200px) | **Pemilik.** Sementara pakai placeholder gradasi maroon |
| **Klip audio reff** | **Pemilik** (bagian 10) |
| **Aksara Jawa** nama mempelai dan judul acara | **Pemilik / penutur aksara** |
| (Opsional) **Model GLB pengantin dari belakang** | Pemilik atau ilustrator 3D, maks 3 MB |

Aturan Fase 0:
1. **Titik berhenti:** setelah aset agent selesai, berhenti dan minta persetujuan pemilik (terutama gebyok, pengantin, dan relief) sebelum lanjut.
2. Ukuran: SVG < 40 KB per file, height map < 400 KB, total `public/assets/` < 2 MB (di luar foto dan audio).
3. Bila bentuk pengantin hasil kode kurang meyakinkan, jangan dipaksakan: catat di `ASSETS.md` dan gunakan opsi 2,5D kontra-cahaya atau minta model dari pemilik.

---

## 14. Rencana Pengerjaan (urutan untuk AI agent)

0. **Fase 0: aset** (bagian 13). Berhenti untuk persetujuan.
1. Inisialisasi Vite + React + TS, dependensi, token CSS, font, `invitation.config.ts`, store.
2. **Layout teks semua section (tanpa 3D)** dengan data placeholder, terbaca di mobile dan desktop. Screenshot dan periksa.
3. **Sistem navigasi** (`useSectionNav`): scrub + commit, keyboard, titik navigasi, hash. Uji dengan transisi placeholder (crossfade) dan pastikan tidak ada lompat dua section.
4. **Amplop** (`Envelope`, `WaxSeal`): bentuk, relief, segel, idle, animasi buka 3,6 detik, audio.
5. **Set pelaminan statis** + pencahayaan kontra-cahaya + pasangan statis di anak tangga 0. Pastikan hero tetap menampilkan teks jelas (bagian 0).
6. **Shot satu per satu** (`CameraRig` + `transitions/`), mulai dari Hero → Salam, lalu berurutan. Setelah tiap shot, ambil screenshot di awal, tengah, akhir transisi; periksa tidak ada layar tanpa teks yang berlangsung lama.
7. **Pasangan naik tangga** (langkah, kain, roncen) sinkron dengan `index` dan `p`.
8. Isi fungsional: hitung mundur + kalender, acara + peta, hadiah (salin), RSVP + ucapan, penutup.
9. Postprocessing, optimasi performa, fallback 2D, reduced motion, tombol Berikutnya / Sebelumnya.
10. Uji dengan daftar periksa, tulis `README.md` (ganti konten, foto, audio, deploy, lisensi lagu).

---

## 15. Daftar Periksa Penerimaan

**Prioritas undangan**
- [ ] Setiap screenshot (amplop, hero, salam, mempelai, hitung mundur, acara, hadiah, RSVP, penutup) menampilkan teks undangan yang terbaca. Tidak ada layar yang hanya berisi adegan.
- [ ] Hero menampilkan nama mempelai (aksara + Latin), tanggal, dan nama tamu dengan jelas.
- [ ] Tidak ada objek lebih dari batas ukuran (pasangan ≤ 45%, dekorasi ≤ 25% tinggi layar) atau menutupi teks.
- [ ] Screenshot mobile dan desktop tersimpan di `docs/screenshots/`.

**Scroll dan transisi**
- [ ] Setiap gerakan scroll memindahkan satu section penuh; gulir sebagian lalu lepas mengembalikan atau menyelesaikan sesuai ambang 35%.
- [ ] Delapan transisi memakai **teknik berbeda** sesuai tabel 6.3 (zoom ke ukiran, orbit, tilt, whip-pan, zoom makro melati, tirai, crane out); tidak hanya zoom maju-mundur.
- [ ] Tiap transisi 2 sampai 3 detik, mulus, tanpa bounce, bisa dibalik.
- [ ] Input tidak bisa melompati dua section; titik navigasi, keyboard, tombol Berikutnya / Sebelumnya, dan hash berfungsi.

**Visual**
- [ ] Palet hanya maroon, hitam, gading; logam hanya di segel lilin (atau tanpa logam bila `seal.style = "maroon"`).
- [ ] Judul beraksara Jawa disertai tulisan Latin.
- [ ] Amplop tampil seperti gambar referensi (panel bergelombang, jahitan titik, segel di tengah); segel tidak bisa ditekan sebelum adegan siap.
- [ ] Pelaminan lengkap (tangga berkarpet, gebyok, kursi, kembar mayang, roncen melati, lentera), tanpa wayang.
- [ ] Pasangan terlihat dari belakang naik tangga, pengantin wanita mengangkat jarik, wajah tidak terlihat; siluet kontra-cahaya terbaca.
- [ ] Foto mempelai berpadu dengan lengkung gapura (double exposure), wajah tetap jelas.

**Fungsi dan kualitas**
- [ ] Hitung mundur berjalan; `.ics` dan tautan Google Calendar berfungsi.
- [ ] Tiga acara tampil dengan tombol **Lihat Lokasi**. Salin rekening berfungsi dan memberi umpan balik.
- [ ] RSVP dan ucapan terkirim, daftar ucapan tampil, error ditangani dengan pesan jelas.
- [ ] Nama tamu muncul dari `?to=`.
- [ ] Audio baru berbunyi setelah segel ditekan, loop tanpa putus, ada tombol mute.
- [ ] Lancar di HP menengah; `prefers-reduced-motion` dan fallback 2D berfungsi.
- [ ] Seluruh konten bisa diganti dari `invitation.config.ts` dan `public/`.

---

## 16. Yang Perlu Disiapkan Pemilik Undangan

- Foto portrait kedua mempelai (wajah jelas, latar sederhana lebih baik untuk double exposure).
- Nama lengkap, nama orang tua, penulisan **aksara Jawa** nama dan judul acara (diperiksa penutur aksara).
- Tanggal, penanggalan Jawa (pasaran), jam, dan alamat tiap acara beserta tautan Google Maps.
- Nomor rekening / e-wallet (dan QR bila ada).
- File audio klip reff yang sah digunakan (bagian 10).
- Endpoint RSVP dan ucapan (Supabase / Google Apps Script), atau minta agent menyiapkan contoh pengaturannya.
- (Opsional) model 3D pengantin dari belakang atau referensi busana (warna kebaya, blangkon) yang diinginkan.
