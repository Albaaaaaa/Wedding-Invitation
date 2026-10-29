import React from 'react';

interface InkWipeTextProps {
  active: boolean;
  isExiting?: boolean;
  delayMs?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * InkWipeText (`src/components/InkWipeText.tsx` — Section 4.4 of Revisi Final)
 * Single unified text reveal wrapper across all 8 sections.
 * Ensures immediate 100% legibility (Priority #0) when active, and fades out cleanly when exiting.
 */
export const InkWipeText: React.FC<InkWipeTextProps> = ({
  active,
  isExiting = false,
  className = '',
  children,
}) => {
  const isVisible = active && !isExiting;

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : 'translate3d(0, -6px, 0)',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
