import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  valueToCopy: string;
  label?: string;
  ariaLabel?: string;
}

/**
 * CopyButton (Section 6.4)
 * Displays "Salin Nomor", copies account number on click, and transitions to "Tersalin"
 * for 2 seconds with a crisp checkmark animation.
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  valueToCopy,
  label = 'Salin Nomor',
  ariaLabel,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = valueToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // Fallback still shows feedback in restricted sandbox contexts
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel || `${label} ${valueToCopy}`}
      className="btn-primary-keraton inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EADFCB]"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-[#EADFCB] transition-transform duration-150 scale-110" />
          <span>Tersalin</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-[#EADFCB]/85" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
