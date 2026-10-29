import type { WeddingEventConfig } from '../invitation.config';
import { INVITATION_SECTIONS, evaluateShotState, smoothstep01 } from '../scroll/shots';

export interface ParsedInvitationParams {
  guestName: string;
  hasCustomGuest: boolean;
  autostart: boolean;
  isAssetsPreview: boolean;
  sealStyleOverride: 'gold' | 'maroon' | null;
  forceFallback2D: boolean;
  initialSectionIndex: number;
}

export interface CountdownValues {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isCompleted: boolean;
}

export interface EnvelopeTimelineState {
  progress: number;
  isFinished: boolean;
  sealPressScale: number;
  sealLiftZ: number;
  ringExpand: number;
  ringOpacity: number;
  leftPanelProgress: number;
  rightPanelProgress: number;
  slitGlow: number;
  flapFoldProgress: number;
  cameraZ: number;
  cameraFov: number;
  cameraRollRad: number;
  envelopeFade: number;
  heroReveal: number;
}

const JAVANESE_DIGITS = ['꧐', '꧑', '꧒', '꧓', '꧔', '꧕', '꧖', '꧗', '꧘', '꧙'];

export function clamp01(val: number): number {
  if (val <= 0) return 0;
  if (val >= 1) return 1;
  return val;
}

export function rangeProgress(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0;
  return clamp01((t - start) / (end - start));
}

/**
 * Smooth cinematic easing matching cubic-bezier(0.22, 1, 0.36, 1) / power3.inOut
 * Strictly monotonic (zero overshoot or bounce).
 */
export function easeKeratonOut(x: number): number {
  const t = clamp01(x);
  return 1 - Math.pow(1 - t, 3);
}

export function easeKeratonInOut(x: number): number {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function toJavaneseNumerals(value: number | string, padLength = 2): string {
  const str =
    typeof value === 'number'
      ? String(Math.max(0, Math.floor(value))).padStart(padLength, '0')
      : String(value);
  return str
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0) - 48;
      return code >= 0 && code <= 9 ? JAVANESE_DIGITS[code] : ch;
    })
    .join('');
}

export function parseSectionHash(hash: string): number {
  if (!hash) return 0;
  const clean = hash.trim().toLowerCase();
  const normalized = clean.startsWith('#') ? clean : `#${clean}`;
  const found = INVITATION_SECTIONS.find((s) => s.hash === normalized || `#${s.id}` === normalized);
  return found ? found.index : 0;
}

export function parseUrlParameters(
  search: string,
  pathname = '/',
  hash = ''
): ParsedInvitationParams {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const rawTo = params.get('to') || params.get('kepada') || '';
  const cleaned = rawTo
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  const sealParam = params.get('seal');
  const sealStyleOverride =
    sealParam === 'maroon' ? 'maroon' : sealParam === 'gold' ? 'gold' : null;

  const autostart = params.get('autostart') === '1' || params.get('autostart') === 'true';
  const isAssetsPreview =
    pathname.replace(/\/+$/, '') === '/assets-preview' || params.get('preview') === 'assets';
  const forceFallback2D = params.get('fallback2d') === '1' || params.get('webgl') === '0';
  const initialSectionIndex = parseSectionHash(hash);

  return {
    guestName: cleaned || 'Kanjeng Gusti / Bapak / Ibu / Saudara',
    hasCustomGuest: Boolean(cleaned),
    autostart,
    isAssetsPreview,
    sealStyleOverride,
    forceFallback2D,
    initialSectionIndex,
  };
}

/**
 * Pure helper for discrete section scrub & commit logic (Section 5.6).
 * Threshold is |p| > 0.35. Never skips more than 1 section per gesture.
 */
export function computeScrubReleaseDecision(
  currentIndex: number,
  currentP: number,
  totalSections = INVITATION_SECTIONS.length,
  commitThreshold = 0.35
): {
  shouldCommit: boolean;
  targetIndex: number;
  direction: 1 | -1 | 0;
} {
  const clampedP = Math.max(-1, Math.min(1, currentP));
  if (Math.abs(clampedP) <= commitThreshold) {
    return {
      shouldCommit: false,
      targetIndex: currentIndex,
      direction: 0,
    };
  }
  const direction: 1 | -1 = clampedP > 0 ? 1 : -1;
  const nextIndex = Math.max(0, Math.min(totalSections - 1, currentIndex + direction));
  if (nextIndex === currentIndex) {
    return {
      shouldCommit: false,
      targetIndex: currentIndex,
      direction: 0,
    };
  }
  return {
    shouldCommit: true,
    targetIndex: nextIndex,
    direction,
  };
}

export function calculateCountdown(targetIso: string, nowMs: number): CountdownValues {
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs) || nowMs >= targetMs) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isCompleted: true,
    };
  }

  const diffSeconds = Math.floor((targetMs - nowMs) / 1000);
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: diffSeconds,
    isCompleted: false,
  };
}

function formatUtcTimestampForIcs(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

export function getEventStartEndDates(
  event: WeddingEventConfig,
  weddingDateIso: string
): { start: Date; end: Date } {
  const baseDate = new Date(weddingDateIso);
  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();

  // WIB is UTC+7
  const wholeHours = Math.floor(event.startHourWib);
  const minutes = Math.round((event.startHourWib - wholeHours) * 60);
  const startUtcMs = Date.UTC(year, month, day, wholeHours - 7, minutes, 0);
  const endUtcMs = startUtcMs + Math.round(event.durationHours * 3600 * 1000);

  return {
    start: new Date(startUtcMs),
    end: new Date(endUtcMs),
  };
}

export function buildGoogleCalendarUrl(
  event: WeddingEventConfig,
  weddingDateIso: string,
  coupleLabel: string
): string {
  const { start, end } = getEventStartEndDates(event, weddingDateIso);
  const dates = `${formatUtcTimestampForIcs(start)}/${formatUtcTimestampForIcs(end)}`;
  const text = `${event.title} — Pawiwahan ${coupleLabel}`;
  const details = `Undangan Pernikahan ${coupleLabel} (${event.javaneseDateLabel}, ${event.time}). Tempat: ${event.place}, ${event.address}`;
  const location = `${event.place}, ${event.address}`;

  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text,
    dates,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}

export function generateIcsContent(
  events: WeddingEventConfig[],
  weddingDateIso: string,
  coupleLabel: string
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sugeng Rawuh//Pawiwahan Keraton Jawa//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  const stamp = formatUtcTimestampForIcs(new Date(weddingDateIso));

  for (const ev of events) {
    const { start, end } = getEventStartEndDates(ev, weddingDateIso);
    lines.push(
      'BEGIN:VEVENT',
      `UID:sugeng-rawuh-${ev.id}@keraton.id`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatUtcTimestampForIcs(start)}`,
      `DTEND:${formatUtcTimestampForIcs(end)}`,
      `SUMMARY:${ev.title} - Pawiwahan ${coupleLabel}`,
      `DESCRIPTION:${ev.title} (${ev.javaneseDateLabel}, ${ev.time}) di ${ev.place}`,
      `LOCATION:${ev.place}, ${ev.address}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * 3.6-second envelope opening choreography (Section 5.2)
 */
export function computeEnvelopeTimeline(elapsedSeconds: number): EnvelopeTimelineState {
  const totalDuration = 3.6;
  const t = Math.max(0, Math.min(totalDuration, elapsedSeconds));
  const progress = t / totalDuration;

  // 0.0 - 0.3s: Seal press dip 1.0 -> 0.94 -> 1.0
  let sealPressScale = 1;
  if (t > 0 && t < 0.3) {
    const p = t / 0.3;
    sealPressScale = 1 - Math.sin(p * Math.PI) * 0.06;
  }

  // 0.3 - 1.0s: Seal lifts slightly forward (z +0.05), ring expands and fades
  const sealLiftZ = easeKeratonOut(rangeProgress(t, 0.3, 1.0)) * 0.05;
  const ringExpand = easeKeratonOut(rangeProgress(t, 0.3, 1.0));
  const ringOpacity = t < 0.3 ? 1 : 1 - ringExpand;

  // 0.6 - 2.6s: Left panel (with seal) slides left & rotates; Right panel follows 0.15s later
  const leftPanelProgress = easeKeratonInOut(rangeProgress(t, 0.6, 2.6));
  const rightPanelProgress = easeKeratonInOut(rangeProgress(t, 0.75, 2.75));

  // 0.8 - 2.4s: Warm ivory light shines from X slit, peaks at 1.6s then softens
  const glowRise = easeKeratonInOut(rangeProgress(t, 0.8, 1.7));
  const glowFall = easeKeratonInOut(rangeProgress(t, 2.2, 3.5));
  const slitGlow = clamp01(glowRise * (1 - glowFall * 0.65));

  // 1.4 - 3.2s: Top & bottom triangular flaps fold outward (±70°)
  const flapFoldProgress = easeKeratonInOut(rangeProgress(t, 1.4, 3.2));

  // 1.0 - 3.4s: Camera dolly z: 6 -> 0.8, FOV: 38 -> 26, roll: 1 deg
  const dolly = easeKeratonInOut(rangeProgress(t, 1.0, 3.4));
  const cameraZ = 6 - dolly * (6 - 0.8);
  const cameraFov = 38 - dolly * (38 - 26);
  const cameraRollRad = Math.sin(dolly * Math.PI) * ((1 * Math.PI) / 180);

  // 2.6 - 3.6s: Envelope fades out completely as camera passes through into Hero Pelaminan
  const envelopeFade = 1 - easeKeratonInOut(rangeProgress(t, 2.4, 3.4));
  const heroReveal = easeKeratonOut(rangeProgress(t, 2.2, 3.6));

  return {
    progress,
    isFinished: elapsedSeconds >= totalDuration,
    sealPressScale,
    sealLiftZ,
    ringExpand,
    ringOpacity,
    leftPanelProgress,
    rightPanelProgress,
    slitGlow,
    flapFoldProgress,
    cameraZ,
    cameraFov,
    cameraRollRad,
    envelopeFade,
    heroReveal,
  };
}

export { evaluateShotState, smoothstep01 };

export interface RsvpSubmissionInput {
  name: string;
  guestsCount: number;
  attendance: 'hadir' | 'berhalangan';
  notes?: string;
  honeypot?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  isSpam?: boolean;
}

export function validateRsvpSubmission(input: RsvpSubmissionInput): ValidationResult {
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { valid: false, isSpam: true, error: 'Deteksi pengiriman otomatis.' };
  }
  const cleanName = input.name.trim();
  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Mohon isi nama lengkap Panjenengan.' };
  }
  if (
    typeof input.guestsCount !== 'number' ||
    Number.isNaN(input.guestsCount) ||
    input.guestsCount < 1 ||
    input.guestsCount > 5
  ) {
    return { valid: false, error: 'Jumlah tamu harus antara 1 sampai 5 orang.' };
  }
  if (input.attendance !== 'hadir' && input.attendance !== 'berhalangan') {
    return { valid: false, error: 'Mohon pilih konfirmasi kehadiran.' };
  }
  return { valid: true };
}

export interface WishSubmissionInput {
  name: string;
  message: string;
  honeypot?: string;
  lastSubmittedAtMs?: number;
  nowMs?: number;
}

export function validateWishSubmission(input: WishSubmissionInput): ValidationResult {
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { valid: false, isSpam: true, error: 'Deteksi pengiriman otomatis.' };
  }
  if (
    input.lastSubmittedAtMs &&
    input.nowMs &&
    input.nowMs - input.lastSubmittedAtMs < 5000
  ) {
    return {
      valid: false,
      error: 'Mohon tunggu beberapa detik sebelum mengirim ucapan berikutnya.',
    };
  }
  const cleanName = input.name.trim();
  const cleanMsg = input.message.trim();
  if (!cleanName || cleanName.length < 2) {
    return { valid: false, error: 'Mohon cantumkan nama pengirim ucapan.' };
  }
  if (!cleanMsg || cleanMsg.length < 3) {
    return { valid: false, error: 'Mohon tuliskan doa atau ucapan singkat.' };
  }
  if (cleanMsg.length > 300) {
    return { valid: false, error: 'Pesan maksimal 300 karakter.' };
  }
  return { valid: true };
}
