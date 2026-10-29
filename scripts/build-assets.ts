/**
 * Fase 0 Asset Verification & Height-Map Manifest Builder (Revisi Final Pelaminan Jawa)
 * Run via: npx --yes tsx scripts/build-assets.ts
 *
 * Verifies all Pelaminan, Gebyok, Gapura mask, Kembar Mayang, Kebaya lace, batik tiles,
 * and height-map sources in public/assets/, ensures every SVG is under the 40 KB budget
 * and total public/assets/ is under 2 MB, and outputs public/assets/manifest.json for /assets-preview.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface AssetEntry {
  id: string;
  file: string;
  category: 'pelaminan' | 'relief' | 'batik' | 'portrait';
  sizeBytes: number;
  sizeKB: string;
  status: 'siap' | 'placeholder-pemilik';
  description: string;
}

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const IMG_DIR = path.join(ROOT, 'public', 'img');

const EXPECTED_ASSETS: Array<{
  id: string;
  dir: string;
  file: string;
  category: AssetEntry['category'];
  status: AssetEntry['status'];
  description: string;
}> = [
  {
    id: 'gebyok-relief',
    dir: ASSETS_DIR,
    file: 'gebyok-relief.svg',
    category: 'pelaminan',
    status: 'siap',
    description:
      'Peta tinggi (height/bump map) ukiran Gebyok jati Jawa dengan panel Kawung, tiang Lung-lungan, lengkung Gapura tengah, dan ornamen Kayon kecil di puncak.',
  },
  {
    id: 'gapura-mask',
    dir: ASSETS_DIR,
    file: 'gapura-mask.svg',
    category: 'pelaminan',
    status: 'siap',
    description:
      'Alpha mask lengkung Gapura Gebyok berukir tembus untuk kartu Double Exposure mempelai (menggantikan siluet wayang).',
  },
  {
    id: 'kembar-mayang',
    dir: ASSETS_DIR,
    file: 'kembar-mayang.svg',
    category: 'pelaminan',
    status: 'siap',
    description:
      'Profil siluet rangkaian janur Kembar Mayang dan bokor kayu di kiri-kanan panggung pelaminan.',
  },
  {
    id: 'renda-kebaya',
    dir: ASSETS_DIR,
    file: 'renda-kebaya.svg',
    category: 'pelaminan',
    status: 'siap',
    description:
      'Tile seamless motif brokat/renda kebaya maroon pekat untuk tekstur pakaian mempelai wanita.',
  },
  {
    id: 'kayon-gunungan',
    dir: ASSETS_DIR,
    file: 'kayon-gunungan.svg',
    category: 'pelaminan',
    status: 'siap',
    description:
      'Ornamen Kayon / Pohon Hayat kecil yang dipasang di puncak lengkung tengah Gebyok.',
  },
  {
    id: 'relief-envelope-melati',
    dir: ASSETS_DIR,
    file: 'relief-envelope-melati.svg',
    category: 'relief',
    status: 'siap',
    description:
      'Peta tinggi (height map) grayscale motif bunga melati & lung-lungan di tepi panel amplop (tengah polos).',
  },
  {
    id: 'seal-melati-emblem',
    dir: ASSETS_DIR,
    file: 'seal-melati-emblem.svg',
    category: 'relief',
    status: 'siap',
    description:
      'Peta tinggi (height map) emblem segel lilin dengan kuntum melati timbul dan cincin tepi.',
  },
  {
    id: 'motif-parang',
    dir: ASSETS_DIR,
    file: 'motif-parang.svg',
    category: 'batik',
    status: 'siap',
    description:
      'Tile seamless motif Parang Rusak diagonal untuk kain jarik pengantin dan slepe di tangga pelaminan.',
  },
  {
    id: 'motif-kawung',
    dir: ASSETS_DIR,
    file: 'motif-kawung.svg',
    category: 'batik',
    status: 'siap',
    description:
      'Tile seamless motif Kawung Keraton untuk tepi karpet tangga pelaminan, lantai batu, dan panel ukir.',
  },
  {
    id: 'motif-sidomukti',
    dir: ASSETS_DIR,
    file: 'motif-sidomukti.svg',
    category: 'batik',
    status: 'siap',
    description:
      'Motif bingkai Sidomukti / Sidoasih dengan sulur lung-lungan sudut untuk kartu mempelai.',
  },
  {
    id: 'bride-portrait',
    dir: IMG_DIR,
    file: 'bride.svg',
    category: 'portrait',
    status: 'placeholder-pemilik',
    description:
      'Ilustrasi portrait mempelai wanita untuk pengujian shader Double Exposure Gapura Gebyok sebelum foto asli pemilik.',
  },
  {
    id: 'groom-portrait',
    dir: IMG_DIR,
    file: 'groom.svg',
    category: 'portrait',
    status: 'placeholder-pemilik',
    description:
      'Ilustrasi portrait mempelai pria untuk pengujian shader Double Exposure Gapura Gebyok sebelum foto asli pemilik.',
  },
];

function buildManifest() {
  const entries: AssetEntry[] = [];
  let totalBytes = 0;

  for (const item of EXPECTED_ASSETS) {
    const fullPath = path.join(item.dir, item.file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Missing required Phase 0 asset: ${fullPath}`);
    }
    const stat = fs.statSync(fullPath);
    if (stat.size > 40 * 1024) {
      throw new Error(`Asset ${item.file} exceeds 40 KB SVG budget (${stat.size} bytes)`);
    }
    totalBytes += stat.size;

    entries.push({
      id: item.id,
      file: item.dir === ASSETS_DIR ? `/assets/${item.file}` : `/img/${item.file}`,
      category: item.category,
      sizeBytes: stat.size,
      sizeKB: (stat.size / 1024).toFixed(2) + ' KB',
      status: item.status,
      description: item.description,
    });
  }

  if (totalBytes > 2 * 1024 * 1024) {
    throw new Error(`Total assets size exceeds 2 MB limit (${totalBytes} bytes)`);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    totalSizeBytes: totalBytes,
    totalSizeKB: (totalBytes / 1024).toFixed(2) + ' KB',
    budgetPassed: true,
    assets: entries,
  };

  fs.writeFileSync(path.join(ASSETS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(
    `Fase 0 Pelaminan assets verified: ${entries.length} assets, total ${(totalBytes / 1024).toFixed(2)} KB (< 2 MB budget).`
  );
}

buildManifest();
