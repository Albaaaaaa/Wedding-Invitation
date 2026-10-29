# Daftar Aset Fase 0 — Undangan Pernikahan 3D "Sugeng Rawuh" (Revisi Final: Pelaminan Jawa)

Dokumen ini mencatat seluruh aset vektor prosedural, peta tinggi (*height/bump map*), *alpha mask* Gapura Gebyok, serta berkas yang disiapkan pada **Fase 0** sebelum pembangunan adegan 3D Pelaminan Jawa dimulai.

> **Catatan Revisi Final**: Sesuai keputusan pemilik undangan terbaru, **tidak ada wayang atau kelir** di seluruh undangan. Aset `wayang-*.svg` telah dipensiunkan dan digantikan dengan elemen **Pelaminan Jawa** (`gebyok-relief.svg`, `gapura-mask.svg`, `kembar-mayang.svg`, dan `renda-kebaya.svg`).

---

## 1. Ringkasan Aset & Anggaran Ukuran

Seluruh berkas SVG di bawah `public/assets/` berada jauh di bawah batas **40 KB per SVG**, dan total ukuran seluruh aset di bawah **2 MB** (total saat ini ~26 KB). Verifikasi otomatis dilakukan melalui `npx tsx scripts/build-assets.ts` dan dapat dilihat langsung pada halaman `/assets-preview` (atau `?preview=assets`).

| ID Aset | Lokasi Berkas | Kategori | Status | Keterangan Teknis & Lisensi |
|---|---|---|---|---|
| `gebyok-relief` | `public/assets/gebyok-relief.svg` | Pelaminan & Ukir | **Siap** | Peta tinggi (*height/bump map* grayscale `2048×1024`) untuk dinding kayu jati **Gebyok** (`#1A0C0A`) di belakang pelaminan. Memuat panel Kawung kiri-kanan, tiang Soko Lung-lungan, lengkung **Gapura** tengah, dan ornamen **Kayon** kecil di puncak lengkung. Dibuat orisinal (CC0 / MIT). |
| `gapura-mask` | `public/assets/gapura-mask.svg` | Pelaminan & Ukir | **Siap** | *Alpha mask* siluet lengkung **Gapura Gebyok** dengan lubang tatahan ukir tembus di tepi untuk kartu **Double Exposure** mempelai pada Bagian 3 (`Mempelai`). Dibuat orisinal (CC0 / MIT). |
| `kembar-mayang` | `public/assets/kembar-mayang.svg` | Pelaminan & Ukir | **Siap** | Profil siluet rangkaian janur **Kembar Mayang** di atas bokor kayu untuk referensi proporsi 3D di kiri-kanan panggung pelaminan. Dibuat orisinal (CC0 / MIT). |
| `renda-kebaya` | `public/assets/renda-kebaya.svg` | Pelaminan & Ukir | **Siap** | Tile *seamless* (`256×256`) motif brokat/renda kebaya untuk *bump map* dan tekstur kebaya maroon mempelai wanita. Dibuat orisinal (CC0 / MIT). |
| `kayon-gunungan` | `public/assets/kayon-gunungan.svg` | Pelaminan & Ukir | **Siap** | Ornamen **Kayon / Pohon Hayat** kecil yang dipasang di puncak lengkung tengah Gebyok. Dibuat orisinal (CC0 / MIT). |
| `relief-envelope-melati` | `public/assets/relief-envelope-melati.svg` | Relief / Height Map | **Siap** | Peta tinggi grayscale untuk *bump/normal map* panel amplop 3D. Motif melati dan sulur lung-lungan dikonsentrasikan di tepi luar (45% lebar panel) sehingga area tengah tetap polos di sekitar segel lilin. |
| `seal-melati-emblem` | `public/assets/seal-melati-emblem.svg` | Relief / Height Map | **Siap** | Peta tinggi grayscale untuk cap segel lilin (`WaxSeal.tsx`) dengan cincin ganda dan kuntum bunga melati timbul di tengah. |
| `motif-parang` | `public/assets/motif-parang.svg` | Batik Keraton | **Siap** | Tile *seamless* (`240×240`) motif **Parang Rusak** untuk tekstur kain jarik pengantin dan ekor kain *slepe* yang menjuntai di anak tangga pelaminan. |
| `motif-kawung` | `public/assets/motif-kawung.svg` | Batik Keraton | **Siap** | Tile *seamless* (`200×200`) motif **Kawung** untuk tepi karpet maroon tangga pelaminan, lantai batu gelap, dan panel Gebyok. |
| `motif-sidomukti` | `public/assets/motif-sidomukti.svg` | Batik Keraton | **Siap** | Ornamen sudut **Sidomukti / Sidoasih** dengan sulur lung-lungan untuk bingkai kartu mempelai dan panel teks. |
| `bride-portrait` | `public/img/bride.svg` | Portrait Mempelai | **Placeholder Pemilik** | Ilustrasi potret mempelai wanita (Paes Ageng Jawa) untuk menguji shader *Double Exposure* dengan mask lengkung Gapura Gebyok sebelum pemilik menggantinya dengan foto asli (`public/img/bride.jpg`). |
| `groom-portrait` | `public/img/groom.svg` | Portrait Mempelai | **Placeholder Pemilik** | Ilustrasi potret mempelai pria (Beskap & Blangkon) untuk menguji shader *Double Exposure* dengan mask lengkung Gapura Gebyok sebelum pemilik menggantinya dengan foto asli (`public/img/groom.jpg`). |

---

## 2. Spesifikasi Visual Pengantin & Pelaminan 3D (Prosedural)

Selain berkas SVG di atas, figur **Pengantin (dilihat dari belakang)** dan struktur **Pelaminan Jawa** dibangun secara prosedural di Three.js (`src/scenes/Pelaminan.tsx`, `Gebyok.tsx`, `KembarMayang.tsx`, `Roncen.tsx`, `Lentera.tsx`, `Tirai.tsx`, dan `Pengantin.tsx`):

1. **Tangga & Panggung Pelaminan (`Pelaminan.tsx`)**:
   - **7 anak tangga** berlapis karpet maroon (`#6B1424`) dengan list gading tipis (`#EADFCB`, opasitas 30%) dan motif Kawung halus di tepinya (`lebar 3.2m`, `injakan 0.40m`, `tinggi 0.22m`).
   - **Panggung utama (Dais)**: `lebar 4.0m`, `dalam 3.0m`, `tinggi 1.54m` di atas lantai batu gelap terpoles (`roughness: 0.4`).
   - **Dua kursi pengantin** bersandaran tinggi dari kayu jati ukir gelap (`#1A0C0A`) dengan bantalan beludru maroon (`#6B1424`).
2. **Pengantin dari Belakang (`Pengantin.tsx`)**:
   - **Mempelai Wanita (kiri, tinggi 1.62m)**: Sanggul Jawa hitam dengan tusuk konde gading dan **roncen melati** menjuntai sampai bahu (bergoyang halus seperti pendulum), kebaya renda maroon pekat (`#4A0E1B`), kain jarik batik Parang dengan ekor kain (*slepe*) menjuntai 1 anak tangga di belakang, tangan kiri sedikit mengangkat kain jarik (*nyincing*), tangan kanan menggandeng tangan kiri mempelai pria.
   - **Mempelai Pria (kanan, tinggi 1.72m)**: Blangkon batik dengan *mondholan* di belakang kepala, beskap hitam pekat (`#0E0708`), kain jarik batik Parang senada, dan **keris** terselip di pinggang belakang dengan gagang kayu ukir tampak jelas dari belakang.

---

## 3. Aset yang Harus Diganti oleh Pemilik Sebelum Rilis Publik

1. **Foto Asli Mempelai (`public/img/bride.jpg` & `public/img/groom.jpg`)**:
   - Ganti nilai `couple.bride.photo` dan `couple.groom.photo` di `src/invitation.config.ts`.
   - Atur `maskOffset` dan `maskScale` agar wajah mempelai tepat berada di tengah lengkung Gapura Gebyok (`public/assets/gapura-mask.svg`).
2. **Berkas Musik Reff (`public/audio/song.mp3`)**:
   - Karena lagu *Young and Beautiful* (Lana Del Rey) berhak cipta, repositori menyediakan synthesizer ambient gamelan/sinematik bawaan Web Audio API sebagai *fallback* otomatis dan mendukung berkas `public/audio/song.mp3` yang diunggah sendiri oleh pemilik untuk penggunaan pribadi.
