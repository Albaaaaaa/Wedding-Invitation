import * as THREE from 'three';
import {
  computeEnvelopeTimeline,
  evaluateShotState,
  type EnvelopeTimelineState,
} from '../utils/invitationLogic';
import { SECTION_REST_POSES, type ShotTechnique } from '../scroll/shots';
import type { EnvelopePhase } from '../store/useInvitation';

export interface EvaluatedCameraRigState {
  envelopeTimeline: EnvelopeTimelineState;
  coupleStep: number;
  activeTechnique: ShotTechnique | null;
  transitionProgress: number;
  direction: 1 | -1 | 0;
  dimFactor: number;
  dofFocus: number;
  dofBokeh: number;
}

export interface CameraRigController {
  update: (
    camera: THREE.PerspectiveCamera,
    dt: number,
    envelopePhase: EnvelopePhase,
    openingElapsed: number,
    sectionIndex: number,
    transitionP: number,
    reducedMotion: boolean,
    isPortrait: boolean
  ) => EvaluatedCameraRigState;
}

// Pre-allocated scratch vectors (zero GC in render loop)
const _targetPos = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.65, 6.2);
const _targetLookAt = new THREE.Vector3(0, 1.65, 6.2);

/**
 * CameraRig (`src/scenes/CameraRig.tsx` — Section 5.2, 5.6 & Section 6 of Revisi Final)
 * - Cover (`loading` / `ready`): Camera at `[0, 1.65, 8.9]` looking at the 3D Envelope at `[0, 1.65, 6.2]`.
 * - Opening (`0..3.6s`): Smooth dolly through the opened X-slit into the Hero resting pose (`[0, 1.35, 5.4]`).
 * - Opened (`sectionIndex 0..7`, `transitionP -1..1`): Executes the 7 distinct camera shots (`SHOTS`)
 *   framing the Bride & Groom in the lower third (`<= 45%` viewport height) and keeping the upper safe text zone clear.
 */
export function createCameraRigController(): CameraRigController {
  let initialized = false;

  const update = (
    camera: THREE.PerspectiveCamera,
    dt: number,
    envelopePhase: EnvelopePhase,
    openingElapsed: number,
    sectionIndex: number,
    transitionP: number,
    reducedMotion: boolean,
    isPortrait: boolean
  ): EvaluatedCameraRigState => {
    const portraitFovBoost = isPortrait ? 8 : 0;
    const portraitZBoost = isPortrait ? 0.65 : 0;

    const envelopeTimeline = computeEnvelopeTimeline(
      envelopePhase === 'opened' ? 3.6 : openingElapsed
    );
    const shotState = evaluateShotState(sectionIndex, transitionP);

    // Dim factor increases softly on Gifts (5), RSVP (6), and Penutup (7) for maximum form & closing contrast
    let dimFactor = 0.08;
    if (sectionIndex === 5) dimFactor = 0.28;
    else if (sectionIndex === 6) dimFactor = 0.48;
    else if (sectionIndex === 7) dimFactor = 0.35;

    if (envelopePhase === 'loading' || envelopePhase === 'ready') {
      _targetPos.set(0, 1.65, 8.9 + portraitZBoost * 0.5);
      _targetLookAt.set(0, 1.65, 6.2);
      const targetFov = 38 + portraitFovBoost * 0.6;

      if (!initialized || reducedMotion) {
        camera.position.copy(_targetPos);
        _currentLookAt.copy(_targetLookAt);
        camera.fov = targetFov;
        camera.updateProjectionMatrix();
        initialized = true;
      } else {
        const dampFactor = 1 - Math.exp(-4.0 * dt);
        camera.position.lerp(_targetPos, dampFactor);
        _currentLookAt.lerp(_targetLookAt, dampFactor);
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dampFactor);
        camera.updateProjectionMatrix();
      }
      camera.lookAt(_currentLookAt);
      camera.rotation.z = 0;

      return {
        envelopeTimeline,
        coupleStep: 0,
        activeTechnique: null,
        transitionProgress: 0,
        direction: 0,
        dimFactor: 0,
        dofFocus: 2.7,
        dofBokeh: 1.2,
      };
    }

    if (envelopePhase === 'opening') {
      // Smooth 3.6s dolly from Cover [0, 1.65, 8.9] through Envelope [0, 1.65, 6.2] into Hero [0, 1.35, 5.4]
      const heroPose = SECTION_REST_POSES[0];
      const p = envelopeTimeline.progress;
      const eased = p * p * (3 - 2 * p);

      const x = THREE.MathUtils.lerp(0, heroPose.pos[0], eased);
      const y = THREE.MathUtils.lerp(1.65, heroPose.pos[1], eased);
      const z = THREE.MathUtils.lerp(
        8.9 + portraitZBoost * 0.5,
        heroPose.pos[2] + portraitZBoost,
        eased
      );

      _targetPos.set(x, y, z);
      _targetLookAt.set(
        THREE.MathUtils.lerp(0, heroPose.lookAt[0], eased),
        THREE.MathUtils.lerp(1.65, heroPose.lookAt[1], eased),
        THREE.MathUtils.lerp(6.2, heroPose.lookAt[2], eased)
      );

      camera.position.copy(_targetPos);
      _currentLookAt.copy(_targetLookAt);
      camera.fov =
        THREE.MathUtils.lerp(38, heroPose.fov, eased) + portraitFovBoost;
      camera.updateProjectionMatrix();
      camera.lookAt(_currentLookAt);
      camera.rotation.z = envelopeTimeline.cameraRollRad;

      return {
        envelopeTimeline,
        coupleStep: 0,
        activeTechnique: null,
        transitionProgress: 0,
        direction: 0,
        dimFactor: 0.05,
        dofFocus: 4.8,
        dofBokeh: 1.5,
      };
    }

    // Envelope is opened: follow discrete section shot state with responsive damping
    _targetPos.set(
      shotState.pos[0],
      shotState.pos[1],
      shotState.pos[2] + portraitZBoost
    );
    _targetLookAt.set(
      shotState.lookAt[0],
      shotState.lookAt[1],
      shotState.lookAt[2]
    );
    const desiredFov = shotState.fov + portraitFovBoost;

    if (reducedMotion) {
      camera.position.copy(_targetPos);
      _currentLookAt.copy(_targetLookAt);
      camera.fov = desiredFov;
      camera.updateProjectionMatrix();
      camera.lookAt(_currentLookAt);
      camera.rotation.z = 0;
    } else {
      const alpha = 1 - Math.exp(-7.5 * Math.min(dt, 0.1));
      camera.position.lerp(_targetPos, alpha);
      _currentLookAt.lerp(_targetLookAt, alpha);
      if (Math.abs(camera.fov - desiredFov) > 0.02) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, desiredFov, alpha);
        camera.updateProjectionMatrix();
      }
      camera.lookAt(_currentLookAt);
      camera.rotation.z = 0;
    }

    return {
      envelopeTimeline,
      coupleStep: shotState.coupleStep,
      activeTechnique: shotState.activeTechnique,
      transitionProgress: shotState.transitionProgress,
      direction: shotState.direction,
      dimFactor,
      dofFocus: shotState.dofFocus,
      dofBokeh: shotState.dofBokeh,
    };
  };

  return { update };
}
