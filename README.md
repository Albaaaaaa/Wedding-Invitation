# Undangan Pernikahan 3D "Sugeng Rawuh" — Pelaminan Jawa, Maroon & Hitam (Revisi Final)

Aplikasi undangan pernikahan digital interaktif 3D bertema **Pelaminan Keraton Jawa** dengan palet **Maroon Dominan & Hitam** (`#6B1424`, `#3B0A14`, `#0B0506`, `#8E2233`, `#EADFCB`), tipografi **Aksara Jawa** (`Noto Sans Javanese`) berpasangan dengan huruf Latin (`Cormorant Garamond` & `Spectral`), pembukaan amplop 3D bersegel lilin, serta adegan **Pasangan Pengantin Jawa (dilihat dari belakang) menaiki 7 anak tangga Pelaminan Gebyok** dengan **7 teknik transisi kamera sinematik berbeda**.

---

## 1. Keputusan Desain & Prioritas Utama (Revisi Final)

1. **Prioritas #0 — Undangan Terbaca Jelas, 3D Sebagai Latar Pendukung**:
   - Setiap layar wajib menampilkan teks undangan yang kontras dan mudah dibaca (rasio kontras $\ge 4.5:1$ WCAG AA di atas zona teks aman gelap `rgba(11, 5, 6, 0.84)`).
   - **Bagian 1 (`#hero`)** langsung menampilkan **"Kepada Yth. {nama tamu}"** di bagian atas, **nama kedua mempelai (Aksara Jawa + Latin $\ge 18\%$ tinggi layar)** di tengah, dan **tanggal pernikahan** di bawahnya, sementara figur pengantin 3D berdiri di sepertiga bawah layar ($\le 45\%$ tinggi layar).
2. **Tanpa Wayang (`Zero Wayang`)**:
   - Tidak ada siluet wayang atau kelir di seluruh undangan.
   - Adegan 3D menampilkan **Pelaminan Jawa** (`Pelaminan.tsx`, `Gebyok.tsx`, `KembarMayang.tsx`, `Roncen.tsx`, `Lentera.tsx`, `Tirai.tsx`) dan **Pengantin Jawa dilihat dari belakang** (`Pengantin.tsx`) yang menaiki 7 anak tangga pelaminan selangkah demi selangkah di setiap perpindahan bagian hingga duduk bersanding di kursi pengantin pada bagian Penutup (`#penutup`).
3. **Tanpa Warna Logam (Kecuali Segel Lilin di Amplop)**:
   - Seluruh UI, bingkai, ukiran kayu jati Gebyok (`#1A0C0A`), dan ornamen menggunakan palet maroon, hitam, dan gading hangat (`#EADFCB` / `#F2E3C6`).
   - Satu-satunya elemen logam adalah **segel lilin emas kuno (`#B08D57`)** pada sampul amplop 3D (`WaxSeal.tsx`), yang dapat diganti menjadi versi **maroon tanpa logam (`#8E2233`)** melalui `seal.style = "maroon"` di `src/invitation.config.ts` atau parameter URL `?seal=maroon`.
4. **Navigasi Diskrit Per Bagian & 7 Transisi Kamera Berbeda**:
   - Menggulir roda tetikus, mengusap layar sentuh, menekan tombol panah/spasi, atau mengeklik tombol **"Sebelumnya" / "Berikutnya"** maupun indikator 8 titik (`NavDots.tsx`) memindahkan tepat **1 bagian** dalam satu waktu (`threshold |p| > 0.35` pada `src/scroll/useSectionNav.ts`):
     1. `Hero -> Salam` (`zoom-match-cut`, 2.6 dtk): Kamera *dolly-in* & mempersempit FOV menembus lengkung tengah Gebyok.
     2. `Salam -> Mempelai` (`orbit`, 2.8 dtk): Kamera mengorbit ~35° ke kanan menampilkan perspektif tiga-perempat Pelaminan; kartu Double Exposure mempelai bermasker lengkung **Gapura Gebyok** (`public/assets/gapura-mask.svg`) tampil berdampingan.
     3. `Mempelai -> Hitung Mundur` (`tilt-up`, 2.4 dtk): Kamera mendongak ke arah lentera gantung dan untaian roncen melati dengan kilau hangat (`LightFlare.tsx`).
     4. `Hitung Mundur -> Acara` (`whip-pan`, 2.4 dtk): *Fast pan* dengan *directional motion blur* (`WhipPanBlur.tsx`) & *rack focus* ke rangkaian **Kembar Mayang** dan 3 kartu acara sejajar horizontal.
     5. `Acara -> Hadiah` (`macro-iris`, 2.6 dtk): Kamera *zoom* makro ke kuntum bunga melati pada roncen gantung yang membuka sebagai lingkaran iris (`IrisMask.tsx`).
     6. `Hadiah -> RSVP & Doa` (`drape-wipe`, 2.2 dtk): Tirai kain maroon berlipit menyapu layar dari kanan ke kiri (`DrapeWipe.tsx`), menyingkap formulir RSVP dan Ucapan & Doa.
     7. `RSVP & Doa -> Penutup` (`crane-out`, 3.0 dtk): Kamera *crane* naik dan mundur memperlihatkan keseluruhan Pelaminan saat kedua mempelai naik ke panggung utama, berbalik 180° dalam siluet *backlit*, dan duduk bersanding di kursi pengantin.

---

## 2. Cara Menjalankan & Memverifikasi

```bash
# 1. Instal dependensi
npm install

# 2. Verifikasi aset Fase 0 (< 40 KB per SVG, total < 2 MB)
npx tsx scripts/build-assets.ts

# 3. Jalankan pengujian unit logika murni (15 pengujian pada 6 suite)
npx tsx --test src/utils/invitationLogic.test.ts

# 4. Jalankan server pengembangan (port 3000)
npm run dev

# 5. Build produksi
npm run build
```

### Parameter URL yang Didukung
- `?to=Nama+Tamu` — Menampilkan nama tamu pada sampul amplop 3D, bagian atas **Hero** (*"Kepada Yth. {nama tamu}"*), serta mengisi otomatis nama pada formulir RSVP dan Ucapan.
- `#hero`, `#salam`, `#mempelai`, `#hitung-mundur`, `#acara`, `#hadiah`, `#rsvp`, `#penutup` — Tautan langsung ke masing-masing dari 8 bagian undangan.
- `?seal=maroon` atau `?seal=gold` — Menguji tampilan segel lilin tanpa logam (`maroon`) atau emas kuno (`gold`).
- `/assets-preview` atau `?preview=assets` — Membuka halaman inspeksi **Galeri Aset Fase 0** berdampingan di latar Maroon (`#6B1424`) dan Hitam (`#0B0506`).
- `?fallback2d=1` — Mengaktifkan tampilan 2D CSS (`EnvelopeFallback2D.tsx`) untuk pengujian perangkat tanpa WebGL.

---

## 3. Panduan Kustomisasi Pemilik (`src/invitation.config.ts`)

Seluruh data undangan terpusat di **`src/invitation.config.ts`**:
1. **Nama Mempelai, Aksara Jawa, & Orang Tua**: Ubah objek `invitation.couple.bride` dan `invitation.couple.groom`. Semua teks Aksara Jawa disimpan secara eksplisit di konfigurasi (tidak dikonversi otomatis) agar ejaan tradisional terjamin akurat.
2. **Foto Mempelai (`Double Exposure` Lengkung Gapura Gebyok)**: Simpan foto mempelai di `public/img/bride.jpg` dan `public/img/groom.jpg`, lalu sesuaikan `maskOffset` serta `maskScale` agar wajah mempelai berada tepat di tengah lengkung Gapura (`public/assets/gapura-mask.svg`).
3. **Detail Acara, Nomor Rekening/QRIS, & Endpoint RSVP**: Ubah `invitation.events`, `invitation.gifts`, `invitation.giftAddress`, `invitation.rsvpEndpoint`, dan `invitation.wishesEndpoint`.

---

## 4. Catatan Lisensi Musik (*Young and Beautiful* — Lana Del Rey)

- Lagu *Young and Beautiful* (Lana Del Rey) dilindungi hak cipta (Universal Music / Interscope) sehingga berkas audio aslinya **tidak disertakan di dalam repositori publik**.
- Pemutar audio (`src/audio/loopPlayer.ts`) mendukung pemutaran berkas `/audio/song.mp3` dengan *loop* dan *crossfade* `1500 ms` antara `loopStart` dan `loopEnd` setelah tamu mengetuk segel lilin.
- Apabila berkas `/audio/song.mp3` belum diunggah oleh pemilik, aplikasi secara otomatis memainkan **synthesizer ambient gamelan/sinematik Web Audio API** yang lembut dan bebas royalti sehingga pengalaman audio tetap berjalan mulus tanpa *error*.
