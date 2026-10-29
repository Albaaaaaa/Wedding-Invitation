import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useInvitation } from '../store/useInvitation';

interface PreviewAssetItem {
  id: string;
  title: string;
  aksara: string;
  file: string;
  category: string;
  status: 'Siap' | 'Placeholder Pemilik';
  notes: string;
}

const PREVIEW_ASSETS: PreviewAssetItem[] = [
  {
    id: 'gebyok-relief',
    title: 'Ukiran Gebyok Jati & Lengkung Gapura',
    aksara: 'ꦒꦼꦧꦾꦺꦴꦏ꧀ꦗꦮ',
    file: '/assets/gebyok-relief.svg',
    category: 'Height/Bump Map Pelaminan (2048×1024)',
    status: 'Siap',
    notes:
      'Dinding kayu jati ukir (#1A0C0A) di belakang pelaminan dengan panel Kawung kiri-kanan, tiang Soko Lung-lungan, lengkung Gapura tengah, dan ornamen Kayon kecil di puncak.',
  },
  {
    id: 'gapura-mask',
    title: 'Alpha Mask Lengkung Gapura Gebyok',
    aksara: 'ꦒꦥꦸꦫꦩꦱ꧀ꦏ꧀',
    file: '/assets/gapura-mask.svg',
    category: 'Mask Double Exposure Mempelai',
    status: 'Siap',
    notes:
      'Siluet lengkung Gapura Gebyok dengan lubang tatahan ukir tembus di tepi untuk membingkai potret duotone mempelai pada Bagian 3 (menggantikan wayang).',
  },
  {
    id: 'kembar-mayang',
    title: 'Rangkaian Janur Kembar Mayang',
    aksara: 'ꦏꦼꦩ꧀ꦧꦂꦩꦪꦁ',
    file: '/assets/kembar-mayang.svg',
    category: 'Ornamen Pelaminan Jawa',
    status: 'Siap',
    notes:
      'Rangkaian janur kuning-gading melengkung di atas bokor kayu di kiri dan kanan panggung pelaminan (tinggi 1.6m).',
  },
  {
    id: 'renda-kebaya',
    title: 'Motif Brokat & Renda Kebaya Maroon',
    aksara: 'ꦉꦤ꧀ꦢꦏꦼꦧꦪ',
    file: '/assets/renda-kebaya.svg',
    category: 'Bump/Opacity Tile Kebaya Pengantin',
    status: 'Siap',
    notes:
      'Tile seamless 256×256 motif renda brokat untuk busana kebaya maroon pekat (#4A0E1B) mempelai wanita yang dilihat dari belakang.',
  },
  {
    id: 'kayon-gunungan',
    title: 'Ornamen Kayon Puncak Gebyok',
    aksara: 'ꦏꦪꦺꦴꦤ꧀',
    file: '/assets/kayon-gunungan.svg',
    category: 'Ornamen Puncak Lengkung Gebyok & Loader',
    status: 'Siap',
    notes:
      'Pohon kehidupan Kalpataru / Kayon kecil yang terpasang di puncak lengkung tengah Gebyok pelaminan.',
  },
  {
    id: 'relief-envelope-melati',
    title: 'Peta Tinggi (Height Map) Relief Amplop',
    aksara: 'ꦉꦭꦶꦪꦺꦥ꦳꧀ꦩꦼꦭꦠꦶ',
    file: '/assets/relief-envelope-melati.svg',
    category: 'Bump Map Amplop 2048px',
    status: 'Siap',
    notes:
      'Rangkaian bunga melati dan sulur lung-lungan merambat di tepi panel amplop; bagian tengah dibiarkan polos di sekitar segel lilin.',
  },
  {
    id: 'seal-melati-emblem',
    title: 'Peta Tinggi Emblem Segel Lilin',
    aksara: 'ꦱꦺꦒꦼꦭ꧀ꦩꦼꦭꦠꦶ',
    file: '/assets/seal-melati-emblem.svg',
    category: 'Bump Map Segel 512px',
    status: 'Siap',
    notes:
      'Kuntum bunga melati lima kelopak timbul di tengah dengan cincin tepi lilin bergelombang.',
  },
  {
    id: 'motif-parang',
    title: 'Motif Batik Parang Rusak (Jarik & Slepe)',
    aksara: 'ꦥꦫꦁꦫꦸꦱꦏ꧀',
    file: '/assets/motif-parang.svg',
    category: 'Tekstur Kain Jarik Pengantin',
    status: 'Siap',
    notes:
      'Tile diagonal motif Parang untuk kain jarik pengantin pria/wanita dan ekor kain slepe yang menjuntai di anak tangga pelaminan.',
  },
  {
    id: 'motif-kawung',
    title: 'Motif Batik Kawung Keraton (Tangga & Lantai)',
    aksara: 'ꦏꦮꦸꦁ',
    file: '/assets/motif-kawung.svg',
    category: 'Tepi Karpet Tangga & Lantai Pelaminan',
    status: 'Siap',
    notes:
      'Empat bulatan simetris dengan isen cecek gading untuk tepi karpet maroon 7 anak tangga pelaminan.',
  },
  {
    id: 'motif-sidomukti',
    title: 'Motif Bingkai Sidomukti / Sidoasih',
    aksara: 'ꦱꦶꦢꦩꦸꦏ꧀ꦠꦶ',
    file: '/assets/motif-sidomukti.svg',
    category: 'Bingkai Kartu Mempelai & Panel',
    status: 'Siap',
    notes:
      'Motif khas pernikahan Jawa dengan sulur lung-lungan di keempat sudut panel undangan.',
  },
];

/**
 * AssetsPreview (/assets-preview)
 * Displays all Phase 0 Pelaminan, Gebyok, Gapura mask, batik, and height-map assets
 * side-by-side on Maroon (#6B1424) and Black (#0B0506) backgrounds.
 */
export const AssetsPreview: React.FC = () => {
  const setIsAssetsPreview = useInvitation((s) => s.setIsAssetsPreview);
  const [bgMode, setBgMode] = useState<'both' | 'maroon' | 'black'>('both');

  const handleBackToInvitation = () => {
    if (window.location.pathname === '/assets-preview') {
      window.history.pushState({}, '', '/');
    }
    setIsAssetsPreview(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0506] text-[#EADFCB] py-10 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#EADFCB]/20">
          <div>
            <p className="font-aksara text-2xl text-[#EADFCB]" lang="jv">
              ꦒꦭꦺꦫꦶꦲꦱꦺꦠ꧀ꦥ꦳ꦱꦼ꧇꧐꧇
            </p>
            <h1 className="font-display-latin text-3xl md:text-4xl font-semibold text-[#EADFCB]">
              Inspeksi Aset Fase 0 — Pelaminan Jawa, Gebyok, Ornamen &amp; Height Map
            </h1>
            <p className="font-body-prose text-sm text-[#BFB19A] mt-1">
              Menampilkan seluruh aset vektor SVG Pelaminan Jawa, lengkung Gapura Gebyok, Kembar Mayang,
              dan peta tinggi relief berdampingan di latar Maroon Keraton (#6B1424) serta Hitam (#0B0506).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex border border-[#EADFCB]/30 bg-[#3B0A14]">
              <button
                type="button"
                onClick={() => setBgMode('both')}
                className={`px-3 py-1.5 text-xs font-body-prose cursor-pointer ${
                  bgMode === 'both' ? 'bg-[#8E2233] text-[#EADFCB]' : 'text-[#BFB19A]'
                }`}
              >
                Berdampingan
              </button>
              <button
                type="button"
                onClick={() => setBgMode('maroon')}
                className={`px-3 py-1.5 text-xs font-body-prose cursor-pointer ${
                  bgMode === 'maroon' ? 'bg-[#8E2233] text-[#EADFCB]' : 'text-[#BFB19A]'
                }`}
              >
                Latar Maroon
              </button>
              <button
                type="button"
                onClick={() => setBgMode('black')}
                className={`px-3 py-1.5 text-xs font-body-prose cursor-pointer ${
                  bgMode === 'black' ? 'bg-[#8E2233] text-[#EADFCB]' : 'text-[#BFB19A]'
                }`}
              >
                Latar Hitam
              </button>
            </div>

            <button
              type="button"
              onClick={handleBackToInvitation}
              className="btn-primary-keraton inline-flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Undangan 3D</span>
            </button>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {PREVIEW_ASSETS.map((item) => (
            <article key={item.id} className="surface-keraton p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-aksara text-lg text-[#BFB19A]" lang="jv">
                      {item.aksara}
                    </p>
                    <h2 className="font-display-latin text-2xl font-semibold text-[#EADFCB]">
                      {item.title}
                    </h2>
                    <p className="font-body-prose text-xs text-[#BFB19A]">
                      {item.category} · <code>{item.file}</code>
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-body-prose text-[#EADFCB]">
                    <CheckCircle2 className="w-4 h-4 text-[#EADFCB]" />
                    {item.status}
                  </span>
                </div>

                {/* Side-by-side Maroon & Black Preview Swatches */}
                <div
                  className={`grid gap-4 my-4 ${
                    bgMode === 'both' ? 'grid-cols-2' : 'grid-cols-1'
                  }`}
                >
                  {(bgMode === 'both' || bgMode === 'maroon') && (
                    <div className="bg-[#6B1424] border border-[#EADFCB]/25 p-4 flex flex-col items-center justify-center aspect-square">
                      <img
                        src={item.file}
                        alt={`${item.title} di latar Maroon`}
                        referrerPolicy="no-referrer"
                        className="max-h-52 w-auto object-contain"
                      />
                      <span className="font-body-prose text-[11px] text-[#EADFCB]/75 mt-2">
                        Latar Maroon Keraton (#6B1424)
                      </span>
                    </div>
                  )}

                  {(bgMode === 'both' || bgMode === 'black') && (
                    <div className="bg-[#0B0506] border border-[#EADFCB]/25 p-4 flex flex-col items-center justify-center aspect-square">
                      <img
                        src={item.file}
                        alt={`${item.title} di latar Hitam`}
                        referrerPolicy="no-referrer"
                        className="max-h-52 w-auto object-contain"
                      />
                      <span className="font-body-prose text-[11px] text-[#BFB19A] mt-2">
                        Latar Hitam (#0B0506)
                      </span>
                    </div>
                  )}
                </div>

                <p className="font-body-prose text-sm text-[#EADFCB]/90 leading-relaxed">
                  {item.notes}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
