import React from 'react';

interface OrnamentFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'sidomukti' | 'keraton';
}

/**
 * OrnamentFrame (Section 3.3 & 6.1)
 * Tone-on-tone Javanese Sidomukti & Lung-lungan woodcarving corner frame.
 * Strictly zero metallic colors: uses maroon-sogan (#8E2233) and gading (#EADFCB) at 25-35% opacity.
 */
export const OrnamentFrame: React.FC<OrnamentFrameProps> = ({
  children,
  className = '',
  variant = 'sidomukti',
}) => {
  return (
    <div className={`relative surface-keraton p-6 md:p-8 ${className}`}>
      {/* Inner hairline border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-2.5 border border-[#EADFCB]/15"
      />

      {/* Four Lung-lungan & Sidomukti Corner Ornaments */}
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="pointer-events-none absolute top-1.5 left-1.5 w-8 h-8 text-[#EADFCB]/35"
      >
        <path
          d="M4 36 L4 10 C4 6 6 4 10 4 L36 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 24 C10 14 14 10 24 10 C18 16 16 18 10 24 Z"
          fill={variant === 'sidomukti' ? '#8E2233' : 'none'}
          fillOpacity="0.55"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="pointer-events-none absolute top-1.5 right-1.5 w-8 h-8 text-[#EADFCB]/35 -scale-x-100"
      >
        <path
          d="M4 36 L4 10 C4 6 6 4 10 4 L36 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 24 C10 14 14 10 24 10 C18 16 16 18 10 24 Z"
          fill={variant === 'sidomukti' ? '#8E2233' : 'none'}
          fillOpacity="0.55"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="pointer-events-none absolute bottom-1.5 left-1.5 w-8 h-8 text-[#EADFCB]/35 -scale-y-100"
      >
        <path
          d="M4 36 L4 10 C4 6 6 4 10 4 L36 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 24 C10 14 14 10 24 10 C18 16 16 18 10 24 Z"
          fill={variant === 'sidomukti' ? '#8E2233' : 'none'}
          fillOpacity="0.55"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="pointer-events-none absolute bottom-1.5 right-1.5 w-8 h-8 text-[#EADFCB]/35 -scale-x-100 -scale-y-100"
      >
        <path
          d="M4 36 L4 10 C4 6 6 4 10 4 L36 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 24 C10 14 14 10 24 10 C18 16 16 18 10 24 Z"
          fill={variant === 'sidomukti' ? '#8E2233' : 'none'}
          fillOpacity="0.55"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="8" cy="8" r="2" fill="currentColor" />
      </svg>

      <div className="relative z-10">{children}</div>
    </div>
  );
};
