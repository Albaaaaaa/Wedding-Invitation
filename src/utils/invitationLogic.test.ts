import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseUrlParameters,
  parseSectionHash,
  computeScrubReleaseDecision,
  calculateCountdown,
  toJavaneseNumerals,
  buildGoogleCalendarUrl,
  generateIcsContent,
  computeEnvelopeTimeline,
  evaluateShotState,
  validateRsvpSubmission,
  validateWishSubmission,
} from './invitationLogic';
import { INVITATION_SECTIONS, SHOTS } from '../scroll/shots';
import { invitation } from '../invitation.config';

describe('URL Parameter & Hash Sanitization (Section 4 & 9)', () => {
  it('sanitizes ?to= guest name and strips HTML tags', () => {
    const res = parseUrlParameters('?to=%3Cscript%3Ealert(1)%3C/script%3EK.R.T.%20Suryo%20Atmojo');
    assert.equal(res.guestName, 'alert(1)K.R.T. Suryo Atmojo');
    assert.equal(res.hasCustomGuest, true);
  });

  it('provides fallback guest greeting when ?to= is absent', () => {
    const res = parseUrlParameters('');
    assert.equal(res.guestName, 'Kanjeng Gusti / Bapak / Ibu / Saudara');
    assert.equal(res.hasCustomGuest, false);
  });

  it('parses ?autostart=1, ?seal=maroon, /assets-preview, and section hash (#acara)', () => {
    const res = parseUrlParameters('?autostart=1&seal=maroon', '/assets-preview', '#acara');
    assert.equal(res.autostart, true);
    assert.equal(res.sealStyleOverride, 'maroon');
    assert.equal(res.isAssetsPreview, true);
    assert.equal(res.initialSectionIndex, 4);
  });

  it('maps all 8 section hashes accurately', () => {
    assert.equal(parseSectionHash('#hero'), 0);
    assert.equal(parseSectionHash('#salam'), 1);
    assert.equal(parseSectionHash('#mempelai'), 2);
    assert.equal(parseSectionHash('#hitung-mundur'), 3);
    assert.equal(parseSectionHash('#acara'), 4);
    assert.equal(parseSectionHash('#hadiah'), 5);
    assert.equal(parseSectionHash('#rsvp'), 6);
    assert.equal(parseSectionHash('#penutup'), 7);
  });
});

describe('Discrete Section Scrub & Commit State Machine (Section 5.6)', () => {
  it('snaps back to current section when |p| <= 0.35', () => {
    const d1 = computeScrubReleaseDecision(2, 0.34);
    assert.equal(d1.shouldCommit, false);
    assert.equal(d1.targetIndex, 2);

    const d2 = computeScrubReleaseDecision(2, -0.35);
    assert.equal(d2.shouldCommit, false);
    assert.equal(d2.targetIndex, 2);
  });

  it('commits forward by exactly 1 section when p > 0.35', () => {
    const d = computeScrubReleaseDecision(2, 0.36);
    assert.equal(d.shouldCommit, true);
    assert.equal(d.targetIndex, 3);
    assert.equal(d.direction, 1);
  });

  it('commits backward by exactly 1 section when p < -0.35', () => {
    const d = computeScrubReleaseDecision(4, -0.45);
    assert.equal(d.shouldCommit, true);
    assert.equal(d.targetIndex, 3);
    assert.equal(d.direction, -1);
  });

  it('clamps at boundaries (section 0 and section 7)', () => {
    const atStart = computeScrubReleaseDecision(0, -0.8);
    assert.equal(atStart.shouldCommit, false);
    assert.equal(atStart.targetIndex, 0);

    const atEnd = computeScrubReleaseDecision(7, 0.9);
    assert.equal(atEnd.shouldCommit, false);
    assert.equal(atEnd.targetIndex, 7);
  });
});

describe('7 Cinematic Camera Shots & Couple Stair Progression (Section 4.3 & 6)', () => {
  it('defines 8 sections and 7 distinct transition techniques', () => {
    assert.equal(INVITATION_SECTIONS.length, 8);
    assert.equal(SHOTS.length, 7);
    const techniques = SHOTS.map((s) => s.technique);
    assert.deepEqual(techniques, [
      'zoom-match-cut',
      'orbit',
      'tilt-up',
      'whip-pan',
      'macro-iris',
      'drape-wipe',
      'crane-out',
    ]);
  });

  it('progresses the couple up the 7 Pelaminan steps and onto the bridal chairs at Penutup', () => {
    const heroState = evaluateShotState(0, 0);
    assert.equal(heroState.coupleStep, 0);
    assert.equal(heroState.activeTechnique, null);

    const midZoom = evaluateShotState(0, 0.5);
    assert.equal(midZoom.activeTechnique, 'zoom-match-cut');
    assert.ok(midZoom.coupleStep > 0 && midZoom.coupleStep < 1);
    assert.ok(midZoom.fov < 30);

    const rsvpState = evaluateShotState(6, 0);
    assert.equal(rsvpState.coupleStep, 6);

    const penutupState = evaluateShotState(7, 0);
    assert.equal(penutupState.coupleStep, 8);
    assert.ok(penutupState.pos[2] > 6.0);
  });
});

describe('Countdown & Javanese Numerals', () => {
  it('calculates remaining days, hours, minutes, seconds accurately', () => {
    const target = '2026-12-12T09:00:00+07:00';
    const targetMs = new Date(target).getTime();
    const nowMs = targetMs - (2 * 86400 + 3 * 3600 + 15 * 60 + 42) * 1000;
    const res = calculateCountdown(target, nowMs);
    assert.equal(res.isCompleted, false);
    assert.equal(res.days, 2);
    assert.equal(res.hours, 3);
    assert.equal(res.minutes, 15);
    assert.equal(res.seconds, 42);
  });

  it('converts Latin numbers to Javanese numerals', () => {
    assert.equal(toJavaneseNumerals(12), '꧑꧒');
    assert.equal(toJavaneseNumerals(5, 2), '꧐꧕');
  });
});

describe('Calendar URL & ICS Generation', () => {
  it('builds Google Calendar template URL and valid VCALENDAR with 3 VEVENT blocks', () => {
    const coupleLabel = `${invitation.couple.bride.name} & ${invitation.couple.groom.name}`;
    const url = buildGoogleCalendarUrl(
      invitation.events[0],
      invitation.weddingDate,
      coupleLabel
    );
    assert.ok(url.startsWith('https://calendar.google.com/calendar/render?'));
    const ics = generateIcsContent(invitation.events, invitation.weddingDate, coupleLabel);
    const eventMatches = ics.match(/BEGIN:VEVENT/g);
    assert.equal(eventMatches?.length, 3);
  });
});

describe('3.6s Envelope Opening Timeline & Form Validation', () => {
  it('computes envelope opening phases smoothly from 0s to 3.6s', () => {
    const mid = computeEnvelopeTimeline(0.15);
    assert.ok(mid.sealPressScale < 0.96);
    const end = computeEnvelopeTimeline(3.6);
    assert.equal(end.isFinished, true);
    assert.ok(Math.abs(end.cameraZ - 0.8) < 1e-6);
  });

  it('validates RSVP & Wish submissions', () => {
    assert.equal(
      validateRsvpSubmission({ name: 'R.M. Suryo', guestsCount: 2, attendance: 'hadir' }).valid,
      true
    );
    assert.equal(
      validateWishSubmission({
        name: 'Bapak Haryo',
        message: 'Selamat berbahagia',
        lastSubmittedAtMs: 1000,
        nowMs: 3000,
      }).valid,
      false
    );
  });
});
