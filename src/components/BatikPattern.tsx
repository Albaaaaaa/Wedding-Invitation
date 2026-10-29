import React from 'react';

interface BatikPatternProps {
  variant?: 'divider' | 'parang-strip' | 'kawung-strip';
  className?: string;
}

/**
 * BatikPattern (Section 3.3)
 * Tone-on-tone Lung-lungan / Melati section divider & subtle Parang/Kawung ornamental strips.
 */
export const BatikPattern: React.FC<BatikPatternProps> = ({
  variant = 'divider',
  className = '',
}) => {
  if (variant === 'parang-strip') {
    return (
      <div
        aria-hidden="true"
        className={`w-full h-3 opacity-30 bg-repeat-x ${className}`}
        style={{
          backgroundImage: 'url(/assets/motif-parang.svg)',
          backgroundSize: '48px 48px',
        }}
      />
    );
  }

  if (variant === 'kawung-strip') {
    return (
      <div
        aria-hidden="true"
        className={`w-full h-3 opacity-30 bg-repeat-x ${className}`}
        style={{
          backgroundImage: 'url(/assets/motif-kawung.svg)',
          backgroundSize: '36px 36px',
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-4 my-6 select-none ${className}`}
    >
      <span className="h-px w-16 md:w-24 bg-[#EADFCB]/25" />
      <svg
        viewBox="0 0 120 28"
        className="w-28 h-6 text-[#EADFCB]/45"
        fill="none"
      >
        {/* Symmetrical Lung-lungan tendrils flanking a Melati blossom */}
        <path
          d="M6 14 C22 14 28 4 40 8 C46 10 44 18 38 17"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M114 14 C98 14 92 4 80 8 C74 10 76 18 82 17"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="60" cy="14" r="4.5" fill="#8E2233" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="51" cy="14" r="2" fill="currentColor" />
        <circle cx="69" cy="14" r="2" fill="currentColor" />
        <circle cx="60" cy="6" r="2" fill="currentColor" />
        <circle cx="60" cy="22" r="2" fill="currentColor" />
      </svg>
      <span className="h-px w-16 md:w-24 bg-[#EADFCB]/25" />
    </div>
  );
};
