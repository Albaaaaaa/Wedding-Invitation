import React, { useEffect, useState } from 'react';
import { Minus, Plus, Send, MessageSquareHeart } from 'lucide-react';
import { useInvitation } from '../store/useInvitation';
import { validateRsvpSubmission, validateWishSubmission } from '../utils/invitationLogic';
import { OrnamentFrame } from '../components/OrnamentFrame';
import { InkWipeText } from '../components/InkWipeText';

interface SectionProps {
  active?: boolean;
  isExiting?: boolean;
}

/**
 * RSVP & Ucapan Doa Section (Bagian 7 — `#rsvp`, Section 4.2, 6 & 7.5 of Revisi Final)
 * Unveiled via the pleated maroon silk curtain `drape-wipe` as the couple reaches the top stair landing (step 6).
 * Combines the RSVP attendance confirmation form and the Guest Wishes & Doa form + list.
 */
export const Rsvp: React.FC<SectionProps> = ({ active = true, isExiting = false }) => {
  const {
    guestName,
    hasCustomGuest,
    submitRsvp,
    lastRsvpSubmitted,
    wishes,
    lastWishSubmittedAtMs,
    submitWish,
  } = useInvitation();

  // RSVP State
  const [name, setName] = useState(hasCustomGuest ? guestName : '');
  const [guestsCount, setGuestsCount] = useState(2);
  const [attendance, setAttendance] = useState<'hadir' | 'berhalangan'>('hadir');
  const [rsvpHoneypot, setRsvpHoneypot] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  // Wishes State
  const [senderName, setSenderName] = useState(hasCustomGuest ? guestName : '');
  const [message, setMessage] = useState('');
  const [wishHoneypot, setWishHoneypot] = useState('');
  const [visibleCount, setVisibleCount] = useState(3);
  const [wishFeedback, setWishFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (hasCustomGuest) {
      if (!name) setName(guestName);
      if (!senderName) setSenderName(guestName);
    }
  }, [guestName, hasCustomGuest, name, senderName]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpStatus(null);

    const validation = validateRsvpSubmission({
      name,
      guestsCount,
      attendance,
      honeypot: rsvpHoneypot,
    });

    if (!validation.valid) {
      setRsvpStatus({
        type: 'error',
        text:
          validation.error ||
          'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      });
      return;
    }

    setSubmittingRsvp(true);
    const result = await submitRsvp({
      name: name.trim(),
      guestsCount,
      attendance,
    });
    setSubmittingRsvp(false);

    if (result.ok) {
      setRsvpStatus({
        type: 'success',
        text: 'Konfirmasi terkirim. Matur nuwun.',
      });
    } else {
      setRsvpStatus({
        type: 'error',
        text:
          result.error ||
          'Pesan belum terkirim. Periksa koneksi, lalu tekan Kirim lagi.',
      });
    }
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWishFeedback(null);

    const validation = validateWishSubmission({
      name: senderName,
      message,
      honeypot: wishHoneypot,
      lastSubmittedAtMs: lastWishSubmittedAtMs,
      nowMs: Date.now(),
    });

    if (!validation.valid) {
      setWishFeedback({
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
      setWishFeedback({
        type: 'success',
        text: 'Konfirmasi terkirim. Matur nuwun.',
      });
    } else {
      setWishFeedback({
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
      id="rsvp"
      aria-label="Konfirmasi Kehadiran dan Ucapan Doa Restu"
      data-scrollable-panel="true"
      className="h-full w-full overflow-y-auto flex flex-col items-center justify-start pt-10 md:pt-12 pb-24 px-4 pointer-events-auto"
    >
      <InkWipeText active={active} isExiting={isExiting} className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: RSVP Attendance Form */}
          <OrnamentFrame variant="keraton" className="p-5 md:p-6">
            <div className="text-center mb-5">
              <h2
                className="font-aksara text-[#EADFCB] mb-1"
                style={{ fontSize: 'clamp(1.65rem, 3.2vw, 2.5rem)' }}
                lang="jv"
              >
                ꦥꦔꦧꦫꦤ꧀ꦫꦮꦸꦃ
              </h2>
              <p className="font-display-latin italic text-lg md:text-xl text-[#BFB19A]">
                Pangabaran Rawuh — Konfirmasi Kehadiran
              </p>
            </div>

            <form onSubmit={handleRsvpSubmit} className="text-left space-y-4" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="rsvp-website-hp">Jangan diisi</label>
                <input
                  id="rsvp-website-hp"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={rsvpHoneypot}
                  onChange={(e) => setRsvpHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="rsvp-guest-name"
                  className="block font-body-prose text-xs md:text-sm font-semibold text-[#EADFCB] mb-1.5"
                >
                  Nama Lengkap Tamu
                </label>
                <input
                  id="rsvp-guest-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: K.P.H. Suryo Hadiningrat"
                  className="w-full bg-[#0B0506]/90 border border-[#EADFCB]/35 px-3.5 py-2.5 font-body-prose text-sm md:text-base text-[#EADFCB] placeholder-[#BFB19A]/50 focus:outline-none focus:border-[#EADFCB]"
                />
              </div>

              <fieldset>
                <legend className="block font-body-prose text-xs md:text-sm font-semibold text-[#EADFCB] mb-2">
                  Konfirmasi Kehadiran
                </legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 border cursor-pointer transition-colors ${
                      attendance === 'hadir'
                        ? 'bg-[#8E2233]/75 border-[#EADFCB] text-[#EADFCB]'
                        : 'bg-[#0B0506]/80 border-[#EADFCB]/25 text-[#BFB19A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="hadir"
                      checked={attendance === 'hadir'}
                      onChange={() => setAttendance('hadir')}
                      className="accent-[#8E2233]"
                    />
                    <span className="font-body-prose text-sm">Hadir</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 border cursor-pointer transition-colors ${
                      attendance === 'berhalangan'
                        ? 'bg-[#8E2233]/75 border-[#EADFCB] text-[#EADFCB]'
                        : 'bg-[#0B0506]/80 border-[#EADFCB]/25 text-[#BFB19A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="attendance"
                      value="berhalangan"
                      checked={attendance === 'berhalangan'}
                      onChange={() => setAttendance('berhalangan')}
                      className="accent-[#8E2233]"
                    />
                    <span className="font-body-prose text-sm">Berhalangan hadir</span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="rsvp-guest-count"
                  className="block font-body-prose text-xs md:text-sm font-semibold text-[#EADFCB] mb-1.5"
                >
                  Jumlah Tamu (1 – 5 orang)
                </label>
                <div className="inline-flex items-center border border-[#EADFCB]/35 bg-[#0B0506]/90">
                  <button
                    type="button"
                    onClick={() => setGuestsCount((c) => Math.max(1, c - 1))}
                    disabled={guestsCount <= 1}
                    aria-label="Kurangi jumlah tamu"
                    className="w-10 h-10 flex items-center justify-center text-[#EADFCB] hover:bg-[#8E2233] disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    id="rsvp-guest-count"
                    data-testid="rsvp-guest-count"
                    className="w-12 text-center font-display-latin text-lg font-semibold text-[#EADFCB] tabular-nums"
                  >
                    {guestsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuestsCount((c) => Math.min(5, c + 1))}
                    disabled={guestsCount >= 5}
                    aria-label="Tambah jumlah tamu"
                    className="w-10 h-10 flex items-center justify-center text-[#EADFCB] hover:bg-[#8E2233] disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {rsvpStatus && (
                <div
                  role="status"
                  data-testid="rsvp-status-message"
                  className={`p-3 border font-body-prose text-xs md:text-sm ${
                    rsvpStatus.type === 'success'
                      ? 'bg-[#6B1424]/85 border-[#EADFCB]/50 text-[#EADFCB]'
                      : 'bg-[#3B0A14] border-[#8E2233] text-[#EADFCB]'
                  }`}
                >
                  {rsvpStatus.text}
                </div>
              )}

              {lastRsvpSubmitted && (
                <p className="font-body-prose text-xs text-[#BFB19A]">
                  Status tercatat:{' '}
                  <strong className="text-[#EADFCB]">{lastRsvpSubmitted.name}</strong> (
                  {lastRsvpSubmitted.attendance === 'hadir'
                    ? `Hadir · ${lastRsvpSubmitted.guestsCount} orang`
                    : 'Berhalangan hadir'}
                  )
                </p>
              )}

              <button
                type="submit"
                disabled={submittingRsvp}
                className="btn-primary-keraton w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm md:text-base font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submittingRsvp ? 'Mengirim…' : 'Kirim Konfirmasi'}</span>
              </button>
            </form>
          </OrnamentFrame>

          {/* Right Column: Ucapan & Doa Restu Form + List */}
          <OrnamentFrame variant="keraton" className="p-5 md:p-6">
            <div className="text-center mb-5">
              <h2
                className="font-aksara text-[#EADFCB] mb-1"
                style={{ fontSize: 'clamp(1.65rem, 3.2vw, 2.5rem)' }}
                lang="jv"
              >
                ꦥꦸꦗꦶꦥꦔꦺꦱ꧀ꦠꦸ
              </h2>
              <p className="font-display-latin italic text-lg md:text-xl text-[#BFB19A]">
                Puji Pangestu — Ucapan &amp; Doa Restu
              </p>
            </div>

            <form onSubmit={handleWishSubmit} className="text-left space-y-4 mb-6" noValidate>
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="wish-hp-field">Jangan diisi</label>
                <input
                  id="wish-hp-field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={wishHoneypot}
                  onChange={(e) => setWishHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="wish-sender-name"
                  className="block font-body-prose text-xs md:text-sm font-semibold text-[#EADFCB] mb-1.5"
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
                  className="w-full bg-[#0B0506]/90 border border-[#EADFCB]/35 px-3.5 py-2.5 font-body-prose text-sm md:text-base text-[#EADFCB] placeholder-[#BFB19A]/50 focus:outline-none focus:border-[#EADFCB]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="wish-message-input"
                    className="font-body-prose text-xs md:text-sm font-semibold text-[#EADFCB]"
                  >
                    Untaian Doa &amp; Ucapan
                  </label>
                  <span className="font-body-prose text-xs text-[#BFB19A] tabular-nums">
                    {message.length}/300
                  </span>
                </div>
                <textarea
                  id="wish-message-input"
                  rows={2}
                  maxLength={300}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan doa restu untuk kedua mempelai…"
                  className="w-full bg-[#0B0506]/90 border border-[#EADFCB]/35 px-3.5 py-2 font-body-prose text-sm md:text-base text-[#EADFCB] placeholder-[#BFB19A]/50 focus:outline-none focus:border-[#EADFCB]"
                />
              </div>

              {wishFeedback && (
                <div
                  role="status"
                  data-testid="wish-status-message"
                  className="p-3 border bg-[#6B1424]/85 border-[#EADFCB]/50 font-body-prose text-xs md:text-sm text-[#EADFCB]"
                >
                  {wishFeedback.text}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary-keraton inline-flex items-center gap-2 px-6 py-2.5 text-sm md:text-base font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>Kirim Ucapan</span>
              </button>
            </form>

            {/* Guest Wishes List */}
            <div className="border-t border-[#EADFCB]/20 pt-4 text-left space-y-3">
              <p className="font-display-latin italic text-sm md:text-base text-[#BFB19A] tabular-nums">
                {wishes.length} Doa &amp; Ucapan Tamu Kehormatan
              </p>

              <div data-testid="wishes-list" className="space-y-2.5">
                {displayedWishes.map((w) => (
                  <article key={w.id} className="surface-kelir-card p-3.5 space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-display-latin text-base font-semibold text-[#EADFCB]">
                        {w.name}
                      </h3>
                      <span className="font-body-prose text-[11px] text-[#BFB19A]">
                        {w.attendanceBadge ? `${w.attendanceBadge} · ` : ''}
                        {w.createdAt}
                      </span>
                    </div>
                    <p className="font-body-prose text-xs md:text-sm text-[#EADFCB]/90 leading-relaxed">
                      {w.message}
                    </p>
                  </article>
                ))}
              </div>

              {visibleCount < wishes.length && (
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + 4)}
                    className="btn-secondary-keraton px-4 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Lihat lebih banyak
                  </button>
                </div>
              )}
            </div>
          </OrnamentFrame>
        </div>
      </InkWipeText>
    </section>
  );
};
