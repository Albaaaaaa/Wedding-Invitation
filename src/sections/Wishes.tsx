import React, { useState } from 'react';
import { MessageSquareHeart } from 'lucide-react';
import { useInvitation } from '../store/useInvitation';
import { validateWishSubmission } from '../utils/invitationLogic';
import { OrnamentFrame } from '../components/OrnamentFrame';

/**
 * Wishes / Ucapan & Doa Section (Section 4 #8 & Section 6.5)
 * - Wish form: sender name, message (max 300 chars), honeypot + rate limit, "Kirim Ucapan" button
 * - Paginated guest wishes list with "Lihat lebih banyak" button
 */
export const Wishes: React.FC = () => {
  const {
    guestName,
    hasCustomGuest,
    wishes,
    lastWishSubmittedAtMs,
    submitWish,
  } = useInvitation();

  const [senderName, setSenderName] = useState(hasCustomGuest ? guestName : '');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const validation = validateWishSubmission({
      name: senderName,
      message,
      honeypot,
      lastSubmittedAtMs: lastWishSubmittedAtMs,
      nowMs: Date.now(),
    });

    if (!validation.valid) {
      setFeedback({
        type: 'error',
        text:
          validation.error ||
          'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      });
      return;
    }

    const res = await submitWish({
      name: senderName.trim(),
      message: message.trim(),
    });

    if (res.ok) {
      setMessage('');
      setFeedback({
        type: 'success',
        text: 'Konfirmasi terkirim. Matur nuwun.',
      });
    } else {
      setFeedback({
        type: 'error',
        text:
          res.error ||
          'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      });
    }
  };

  const displayedWishes = wishes.slice(0, visibleCount);

  return (
    <section
      id="wishes"
      aria-label="Ucapan dan Doa Restu Tamu"
      className="w-full flex flex-col items-center justify-center pt-8 pb-24 px-4"
    >
      <div className="w-full max-w-2xl">
        <OrnamentFrame variant="keraton">
          <div className="text-center mb-8">
            <h2
              className="font-aksara text-[#EADFCB] mb-1"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
              lang="jv"
            >
              ꦥꦸꦗꦶꦥꦔꦺꦱ꧀ꦠꦸ
            </h2>
            <p className="font-display-latin italic text-xl md:text-2xl text-[#BFB19A]">
              Puji Pangestu — Ucapan &amp; Doa Restu
            </p>
          </div>

          {/* Wish Form */}
          <form onSubmit={handleSubmit} className="text-left space-y-5 mb-10" noValidate>
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="wish-hp-field">Jangan diisi</label>
              <input
                id="wish-hp-field"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="wish-sender-name"
                className="block font-body-prose text-sm font-semibold text-[#EADFCB] mb-2"
              >
                Nama Pengirim Ucapan
              </label>
              <input
                id="wish-sender-name"
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nama Panjenengan"
                className="w-full bg-[#0B0506]/90 border border-[#EADFCB]/35 px-4 py-3 font-body-prose text-base text-[#EADFCB] placeholder-[#BFB19A]/50 focus:outline-none focus:border-[#EADFCB]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="wish-message-input"
                  className="font-body-prose text-sm font-semibold text-[#EADFCB]"
                >
                  Untaian Doa &amp; Ucapan
                </label>
                <span className="font-body-prose text-xs text-[#BFB19A] tabular-nums">
                  {message.length}/300
                </span>
              </div>
              <textarea
                id="wish-message-input"
                rows={3}
                maxLength={300}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan doa restu untuk kedua mempelai…"
                className="w-full bg-[#0B0506]/90 border border-[#EADFCB]/35 px-4 py-3 font-body-prose text-base text-[#EADFCB] placeholder-[#BFB19A]/50 focus:outline-none focus:border-[#EADFCB]"
              />
            </div>

            {feedback && (
              <div
                role="status"
                data-testid="wish-status-message"
                className="p-3.5 border bg-[#6B1424]/85 border-[#EADFCB]/50 font-body-prose text-sm text-[#EADFCB]"
              >
                {feedback.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary-keraton inline-flex items-center gap-2.5 px-7 py-3 text-base font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Kirim Ucapan</span>
            </button>
          </form>

          {/* Guest Wishes List */}
          <div className="border-t border-[#EADFCB]/20 pt-8 text-left space-y-4">
            <p className="font-display-latin italic text-lg text-[#BFB19A] mb-2 tabular-nums">
              {wishes.length} Doa &amp; Ucapan Tamu Kehormatan
            </p>

            <div data-testid="wishes-list" className="space-y-4">
              {displayedWishes.map((w) => (
                <article
                  key={w.id}
                  className="surface-kelir-card p-4 md:p-5 space-y-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display-latin text-lg font-semibold text-[#EADFCB]">
                      {w.name}
                    </h3>
                    <span className="font-body-prose text-xs text-[#BFB19A]">
                      {w.attendanceBadge ? `${w.attendanceBadge} · ` : ''}
                      {w.createdAt}
                    </span>
                  </div>
                  <p className="font-body-prose text-sm md:text-base text-[#EADFCB]/90 leading-relaxed">
                    {w.message}
                  </p>
                </article>
              ))}
            </div>

            {visibleCount < wishes.length && (
              <div className="pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 4)}
                  className="btn-secondary-keraton px-5 py-2.5 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Lihat lebih banyak
                </button>
              </div>
            )}
          </div>
        </OrnamentFrame>
      </div>
    </section>
  );
};
