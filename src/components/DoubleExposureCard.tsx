import React, { useEffect, useRef, useState } from 'react';
import type { CouplePersonConfig } from '../invitation.config';
import { OrnamentFrame } from './OrnamentFrame';
import { useInvitation } from '../store/useInvitation';

interface DoubleExposureCardProps {
  person: CouplePersonConfig;
  roleLabel: string;
}

/**
 * DoubleExposureCard (Section 5.5 & 7.1 of Revisi Final)
 * Blends the bride/groom portrait with the carved Javanese Gebyok Gapura arch mask (/assets/gapura-mask.svg):
 * 1. Portrait mapped to the Keraton duotone ramp (#0B0506 -> #6B1424 -> #EADFCB)
 * 2. Carved Gapura arch acts as spatial alpha mask with glowing ivory rim (#EADFCB)
 * 3. Subtle Parang batik overlay inside the arch
 * 4. Interactive hover blends up to 35% original photo tones + 12px parallax
 */
export const DoubleExposureCard: React.FC<DoubleExposureCardProps> = ({
  person,
  roleLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useInvitation((s) => s.prefersReducedMotion);
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const gapuraMaskAsset = '/assets/gapura-mask.svg';

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';
    const maskImg = new Image();
    maskImg.crossOrigin = 'anonymous';

    let loadedCount = 0;
    const renderComposite = () => {
      if (cancelled || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Step 1: Deep hitam-kelir to maroon-pekat backdrop outside the arch
      const bgGrad = ctx.createRadialGradient(
        w * 0.5,
        h * 0.46,
        w * 0.08,
        w * 0.5,
        h * 0.5,
        w * 0.72
      );
      bgGrad.addColorStop(0, '#3B0A14');
      bgGrad.addColorStop(1, '#0B0506');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Step 2: Sample Gapura Arch Mask into an offscreen buffer
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d');

      const [offsetX, offsetY] = person.maskOffset;
      const scale = person.maskScale || 1;
      const maskW = w * 0.94 * scale;
      const maskH = h * 0.96 * scale;
      const maskX = (w - maskW) / 2 + offsetX * w;
      const maskY = (h - maskH) / 2 + offsetY * h;

      if (maskCtx && maskImg.complete && maskImg.naturalWidth > 0) {
        maskCtx.fillStyle = '#000000';
        maskCtx.fillRect(0, 0, w, h);
        maskCtx.drawImage(maskImg, maskX, maskY, maskW, maskH);
      }

      const maskPixels = maskCtx ? maskCtx.getImageData(0, 0, w, h).data : null;

      // Step 3: Draw Portrait with Duotone Luminance Mapping clipped by the Gapura Arch Mask
      if (photoImg.complete && photoImg.naturalWidth > 0) {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const offCtx = off.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(photoImg, 0, 0, w, h);
          const imgData = offCtx.getImageData(0, 0, w, h);
          const data = imgData.data;
          const hoverBlend = isHovered ? 0.35 : 0;

          // Duotone color stops: #0B0506 (11,5,6) -> #6B1424 (107,20,36) -> #EADFCB (234,223,203)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            let nr: number;
            let ng: number;
            let nb: number;
            if (lum < 0.55) {
              const t = Math.max(0, (lum - 0.05) / 0.5);
              nr = 11 + t * (107 - 11);
              ng = 5 + t * (20 - 5);
              nb = 6 + t * (36 - 6);
            } else {
              const t = Math.min(1, (lum - 0.55) / 0.4);
              nr = 107 + t * (234 - 107);
              ng = 20 + t * (223 - 20);
              nb = 36 + t * (203 - 36);
            }

            // Mix up to 35% original color when hovered
            nr = nr * (1 - hoverBlend) + r * hoverBlend;
            ng = ng * (1 - hoverBlend) + g * hoverBlend;
            nb = nb * (1 - hoverBlend) + b * hoverBlend;

            // Mask value from gapura-mask.svg (0..1)
            const maskVal = maskPixels ? maskPixels[i] / 255 : 1;

            // Ivory rim highlight along the carved arch boundary
            const isRim = maskVal > 0.18 && maskVal < 0.78;
            if (isRim) {
              const rimFactor = (1 - Math.abs(maskVal - 0.48) / 0.3) * 0.42;
              nr = nr + (234 - nr) * rimFactor;
              ng = ng + (223 - ng) * rimFactor;
              nb = nb + (203 - nb) * rimFactor;
            }

            data[i] = Math.round(nr);
            data[i + 1] = Math.round(ng);
            data[i + 2] = Math.round(nb);
            data[i + 3] = Math.round(Math.min(1, maskVal * 1.15) * 248);
          }
          offCtx.putImageData(imgData, 0, 0);
          ctx.drawImage(off, 0, 0);
        }
      }

      // Step 4: Delicate carved Gebyok filigree outline in warm ivory
      ctx.save();
      ctx.strokeStyle = 'rgba(234, 223, 203, 0.32)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.restore();

      setImageReady(true);
    };

    const onOneLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        renderComposite();
      }
    };

    photoImg.onload = onOneLoaded;
    photoImg.onerror = onOneLoaded;
    maskImg.onload = onOneLoaded;
    maskImg.onerror = onOneLoaded;

    photoImg.src = person.photo;
    maskImg.src = gapuraMaskAsset;

    return () => {
      cancelled = true;
    };
  }, [person.photo, person.maskOffset, person.maskScale, isHovered]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    setParallax({ x: nx * 10, y: ny * 10 });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setParallax({ x: 0, y: 0 });
  };

  return (
    <OrnamentFrame variant="sidomukti" className="flex flex-col items-center text-center p-4 md:p-6">
      {/* Aksara Jawa Name Prominent Above Portrait */}
      <p
        className="font-aksara text-xl md:text-2xl text-[#EADFCB] mb-0.5"
        lang="jv"
      >
        {person.aksara}
      </p>
      <p className="font-display-latin italic text-base md:text-lg text-[#BFB19A] mb-3">
        {roleLabel}
      </p>

      {/* 4:5 Portrait Double Exposure Container (Masked by Gebyok Gapura Arch) */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative w-full max-w-[240px] md:max-w-[270px] aspect-[4/5] overflow-hidden border border-[#EADFCB]/25 bg-[#0B0506] mb-4"
      >
        {/* Accessible Image for Screen Readers */}
        <img
          src={person.photo}
          alt={`Potret ${person.fullName} dalam bingkai lengkung Gapura Gebyok`}
          referrerPolicy="no-referrer"
          className="sr-only"
        />

        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          style={{
            transform: `translate3d(${parallax.x.toFixed(1)}px, ${parallax.y.toFixed(1)}px, 0) scale(1.03)`,
            transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          className={`w-full h-full object-cover ${imageReady ? 'opacity-100' : 'opacity-90'}`}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-[#EADFCB]/15"
        />
      </div>

      {/* Full Latin Name & Parents */}
      <h3
        className="font-display-latin text-xl md:text-2xl font-semibold text-[#EADFCB] tracking-wide mb-1.5"
        style={{ textWrap: 'balance' }}
      >
        {person.fullName}
      </h3>
      <p className="font-body-prose text-xs md:text-sm text-[#BFB19A] max-w-sm leading-relaxed">
        {person.parents}
      </p>
    </OrnamentFrame>
  );
};
