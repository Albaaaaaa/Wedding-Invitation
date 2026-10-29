import { useCallback, useEffect, useRef } from 'react';
import { INVITATION_SECTIONS, SHOTS, smoothstep01 } from './shots';
import { useInvitation } from '../store/useInvitation';
import { computeScrubReleaseDecision, parseSectionHash } from '../utils/invitationLogic';

/**
 * Checks whether an event target is inside a scrollable inner panel that still has room
 * to scroll in the direction of `deltaY` (Section 4.1 overscroll rule).
 */
function canInnerPanelScroll(target: EventTarget | null, deltaY: number): boolean {
  if (!(target instanceof HTMLElement)) return false;
  let el: HTMLElement | null = target;
  while (el && el !== document.body) {
    if (el.dataset.scrollablePanel === 'true') {
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (scrollHeight > clientHeight + 4) {
        if (deltaY > 0 && scrollTop + clientHeight < scrollHeight - 2) {
          return true;
        }
        if (deltaY < 0 && scrollTop > 2) {
          return true;
        }
      }
    }
    el = el.parentElement;
  }
  return false;
}

function isFormInputFocused(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

function updateUrlHash(sectionIndex: number) {
  if (typeof window === 'undefined') return;
  const section = INVITATION_SECTIONS[sectionIndex];
  if (section && window.location.hash !== section.hash) {
    try {
      window.history.replaceState(null, '', section.hash);
    } catch {
      // Ignore history security errors in sandboxed iframes
    }
  }
}

/**
 * Custom discrete section navigation state machine (Section 5.6 of Revisi Final).
 * - Scrubs `p` in [-1, 1] proportionally to delta / 900 during wheel or touch drag.
 * - Commits transition when |p| > 0.35 after 120ms idle (or touchend), or snaps back to 0.
 * - Never skips more than 1 section per gesture.
 * - Exposes `{ index, p, busy, goTo, next, prev }` and registers `window.__goToSection` for testing.
 */
export function useSectionNav() {
  const envelopePhase = useInvitation((s) => s.envelopePhase);
  const index = useInvitation((s) => s.sectionIndex);
  const p = useInvitation((s) => s.transitionProgress);
  const busy = useInvitation((s) => s.isTransitioning);
  const prefersReducedMotion = useInvitation((s) => s.prefersReducedMotion);
  const setSectionNavState = useInvitation((s) => s.setSectionNavState);

  const animFrameRef = useRef<number | null>(null);
  const wheelReleaseTimerRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchTargetRef = useRef<EventTarget | null>(null);

  const cancelOngoingAnim = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (wheelReleaseTimerRef.current !== null) {
      window.clearTimeout(wheelReleaseTimerRef.current);
      wheelReleaseTimerRef.current = null;
    }
  }, []);

  /**
   * Animates `transitionProgress` from `startP` to `endP` over `durationMs`,
   * then lands on `finalIndex` with `transitionProgress = 0` and `isTransitioning = false`.
   */
  const runTransitionAnimation = useCallback(
    (startP: number, endP: number, durationMs: number, finalIndex: number) => {
      cancelOngoingAnim();

      if (prefersReducedMotion || durationMs <= 40) {
        setSectionNavState({
          sectionIndex: finalIndex,
          transitionProgress: 0,
          isTransitioning: false,
          hasDismissedScrollHint: finalIndex > 0 ? true : undefined,
        });
        updateUrlHash(finalIndex);
        return;
      }

      setSectionNavState({
        transitionProgress: startP,
        isTransitioning: true,
        hasDismissedScrollHint: true,
      });

      const startTime = performance.now();

      const step = (now: number) => {
        const elapsed = now - startTime;
        const rawT = Math.min(1, Math.max(0, elapsed / durationMs));
        const eased = smoothstep01(rawT);
        const currentP = startP + (endP - startP) * eased;

        if (rawT < 1) {
          setSectionNavState({
            transitionProgress: currentP,
            isTransitioning: true,
          });
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
          setSectionNavState({
            sectionIndex: finalIndex,
            transitionProgress: 0,
            isTransitioning: false,
            hasDismissedScrollHint: true,
          });
          updateUrlHash(finalIndex);
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [cancelOngoingAnim, prefersReducedMotion, setSectionNavState]
  );

  /**
   * Evaluates current `p` on wheel/touch release:
   * - If |p| > 0.35, completes transition to `index + sign(p)`
   * - Otherwise snaps `p` back to 0 over 350ms
   */
  const settleScrub = useCallback(() => {
    const state = useInvitation.getState();
    if (state.isTransitioning) return;

    const decision = computeScrubReleaseDecision(
      state.sectionIndex,
      state.transitionProgress,
      INVITATION_SECTIONS.length,
      0.35
    );

    if (!decision.shouldCommit) {
      if (Math.abs(state.transitionProgress) < 0.005) {
        setSectionNavState({ transitionProgress: 0, isTransitioning: false });
        return;
      }
      runTransitionAnimation(state.transitionProgress, 0, 350, state.sectionIndex);
      return;
    }

    const shotIndex =
      decision.direction > 0 ? state.sectionIndex : decision.targetIndex;
    const shotDurationSec = SHOTS[shotIndex]?.duration ?? 2.4;
    const remainingFraction = Math.max(0.18, 1 - Math.abs(state.transitionProgress));
    // Scale animation duration so full shot is smooth and tactile
    const durationMs = remainingFraction * shotDurationSec * 1000;

    runTransitionAnimation(
      state.transitionProgress,
      decision.direction,
      durationMs,
      decision.targetIndex
    );
  }, [runTransitionAnimation, setSectionNavState]);

  const stepByDirection = useCallback(
    (direction: 1 | -1) => {
      const state = useInvitation.getState();
      if (state.envelopePhase !== 'opened' || state.isTransitioning) return;
      const targetIndex = Math.max(
        0,
        Math.min(INVITATION_SECTIONS.length - 1, state.sectionIndex + direction)
      );
      if (targetIndex === state.sectionIndex) return;

      const shotIndex = direction > 0 ? state.sectionIndex : targetIndex;
      const shotDurationSec = SHOTS[shotIndex]?.duration ?? 2.4;
      runTransitionAnimation(0, direction, shotDurationSec * 1000, targetIndex);
    },
    [runTransitionAnimation]
  );

  const next = useCallback(() => {
    stepByDirection(1);
  }, [stepByDirection]);

  const prev = useCallback(() => {
    stepByDirection(-1);
  }, [stepByDirection]);

  const goTo = useCallback(
    (targetIndex: number) => {
      const state = useInvitation.getState();
      const clampedTarget = Math.max(
        0,
        Math.min(INVITATION_SECTIONS.length - 1, targetIndex)
      );
      if (clampedTarget === state.sectionIndex && Math.abs(state.transitionProgress) < 0.01) {
        return;
      }

      // If jumping to an adjacent section, use its full cinematic shot; if jumping across multiple, use 1.2s smooth transition
      const diff = clampedTarget - state.sectionIndex;
      if (Math.abs(diff) === 1 && !state.isTransitioning) {
        const dir: 1 | -1 = diff > 0 ? 1 : -1;
        const shotIndex = dir > 0 ? state.sectionIndex : clampedTarget;
        const durationSec = SHOTS[shotIndex]?.duration ?? 2.4;
        runTransitionAnimation(state.transitionProgress, dir, durationSec * 1000, clampedTarget);
      } else {
        const dir: 1 | -1 = diff >= 0 ? 1 : -1;
        // Set index to targetIndex - dir first so the final shot lands cleanly on clampedTarget over 1.2s
        const approachIndex = Math.max(0, Math.min(INVITATION_SECTIONS.length - 1, clampedTarget - dir));
        setSectionNavState({
          sectionIndex: approachIndex,
          transitionProgress: 0,
          isTransitioning: true,
          hasDismissedScrollHint: true,
        });
        runTransitionAnimation(0, dir, 1200, clampedTarget);
      }
    },
    [runTransitionAnimation, setSectionNavState]
  );

  // Attach global wheel, touch, keyboard, and hashchange listeners when envelope is opened
  useEffect(() => {
    if (envelopePhase !== 'opened') return;

    // Ensure initial URL hash is synced
    updateUrlHash(useInvitation.getState().sectionIndex);

    const onWheel = (e: WheelEvent) => {
      const state = useInvitation.getState();
      if (state.envelopePhase !== 'opened' || state.isTransitioning) {
        e.preventDefault();
        return;
      }
      if (canInnerPanelScroll(e.target, e.deltaY)) {
        return;
      }
      e.preventDefault();

      // Normalize wheel delta (handle both mouse wheel and trackpad)
      const delta = Math.max(-180, Math.min(180, e.deltaY));
      let nextP = state.transitionProgress + delta / 900;

      // Clamp at first and last sections
      if (state.sectionIndex === 0 && nextP < 0) nextP = 0;
      if (state.sectionIndex === INVITATION_SECTIONS.length - 1 && nextP > 0) nextP = 0;
      nextP = Math.max(-1, Math.min(1, nextP));

      setSectionNavState({
        transitionProgress: nextP,
        hasDismissedScrollHint: Math.abs(nextP) > 0.05 ? true : undefined,
      });

      if (wheelReleaseTimerRef.current !== null) {
        window.clearTimeout(wheelReleaseTimerRef.current);
      }

      // If user scrubbed all the way to |p| >= 0.92, commit immediately
      if (Math.abs(nextP) >= 0.92) {
        settleScrub();
      } else {
        wheelReleaseTimerRef.current = window.setTimeout(() => {
          wheelReleaseTimerRef.current = null;
          settleScrub();
        }, 120);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartYRef.current = e.touches[0].clientY;
      touchTargetRef.current = e.target;
    };

    const onTouchMove = (e: TouchEvent) => {
      const state = useInvitation.getState();
      if (
        state.envelopePhase !== 'opened' ||
        state.isTransitioning ||
        touchStartYRef.current === null ||
        e.touches.length !== 1
      ) {
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY; // positive = swipe up (advance forward)

      if (canInnerPanelScroll(touchTargetRef.current, deltaY)) {
        touchStartYRef.current = currentY;
        return;
      }

      if (Math.abs(deltaY) > 6) {
        e.preventDefault();
      }

      // On mobile touch, full swipe is ~320px (equivalent to 900 wheel delta)
      let nextP = (deltaY * 2.6) / 900;
      if (state.sectionIndex === 0 && nextP < 0) nextP = 0;
      if (state.sectionIndex === INVITATION_SECTIONS.length - 1 && nextP > 0) nextP = 0;
      nextP = Math.max(-1, Math.min(1, nextP));

      setSectionNavState({
        transitionProgress: nextP,
        hasDismissedScrollHint: Math.abs(nextP) > 0.05 ? true : undefined,
      });
    };

    const onTouchEnd = () => {
      if (touchStartYRef.current === null) return;
      touchStartYRef.current = null;
      touchTargetRef.current = null;
      settleScrub();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const state = useInvitation.getState();
      if (state.envelopePhase !== 'opened' || state.isTransitioning) return;
      if (isFormInputFocused(e.target)) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        stepByDirection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        stepByDirection(-1);
      }
    };

    const onHashChange = () => {
      const targetIdx = parseSectionHash(window.location.hash);
      goTo(targetIdx);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);

    // Expose programmatic helper for automated browser inspection
    (window as unknown as Record<string, unknown>).__goToSection = (idx: number, immediate = false) => {
      if (immediate) {
        cancelOngoingAnim();
        const clamped = Math.max(0, Math.min(INVITATION_SECTIONS.length - 1, idx));
        setSectionNavState({
          sectionIndex: clamped,
          transitionProgress: 0,
          isTransitioning: false,
          hasDismissedScrollHint: true,
        });
        updateUrlHash(clamped);
      } else {
        goTo(idx);
      }
    };

    return () => {
      cancelOngoingAnim();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [cancelOngoingAnim, envelopePhase, goTo, setSectionNavState, settleScrub, stepByDirection]);

  return {
    index,
    p,
    busy,
    goTo,
    next,
    prev,
  };
}
