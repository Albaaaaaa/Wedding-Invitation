import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { useInvitation } from '../store/useInvitation';
import { invitation } from '../invitation.config';
import { createEnvelopeRig } from './Envelope';
import { createPelaminanScene } from './Pelaminan';
import { createPengantinScene } from './Pengantin';
import { createDustParticlesRig } from './DustParticles';
import { createCameraRigController } from './CameraRig';
import { EnvelopeFallback2D } from './EnvelopeFallback2D';

function detectSoftwareWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof document === 'undefined') {
    return { supported: false, isSoftwareGl: true };
  }
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      probeCanvas.getContext('webgl2') ||
      probeCanvas.getContext('webgl') ||
      probeCanvas.getContext('experimental-webgl');
    if (!gl) {
      return { supported: false, isSoftwareGl: true };
    }
    const glCtx = gl as WebGLRenderingContext;
    const ext = glCtx.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : glCtx.RENDERER;
    const gpu = String(glCtx.getParameter(param) || '');
    glCtx.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: true };
  }
}

/**
 * Experience (`src/scenes/Experience.tsx` — Revisi Final: Pelaminan Jawa & Pengantin)
 * Single continuous WebGL canvas containing:
 * 1. 3D Maroon Scalloped Envelope + Wax Seal (`Envelope.tsx` & `WaxSeal.tsx`) at z = 6.2
 * 2. 3D Pelaminan Jawa (`Pelaminan.tsx`, `Gebyok.tsx`, `KembarMayang.tsx`, `Roncen.tsx`, `Lentera.tsx`, `Tirai.tsx`)
 * 3. 3D Bride & Groom seen from behind ascending the 7 Pelaminan stairs (`Pengantin.tsx`)
 * 4. Warm ivory (#F2E3C6) backlighting + dust particles + safe dark text zones
 */
export const Experience: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const vignetteOverlayRef = useRef<HTMLDivElement | null>(null);

  const isFallback2D = useInvitation((s) => s.isFallback2D);
  const envelopePhase = useInvitation((s) => s.envelopePhase);

  // Store reactive state in ref so Three.js render loop reads latest values without re-mounting WebGL
  const stateRef = useRef(useInvitation.getState());
  useEffect(() => {
    const unsub = useInvitation.subscribe((nextState) => {
      stateRef.current = nextState;
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isFallback2D) {
      useInvitation.getState().markSceneReady();
      return;
    }

    const mountEl = canvasMountRef.current;
    if (!mountEl) return;

    const { supported, isSoftwareGl } = detectSoftwareWebGL();
    if (!supported) {
      useInvitation.getState().setFallback2D(true);
      useInvitation.getState().markSceneReady();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      useInvitation.getState().setFallback2D(true);
      useInvitation.getState().markSceneReady();
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0506);
    scene.fog = new THREE.FogExp2(0x0b0506, 0.045);

    // Procedural Studio Environment Map for Antique Gold Wax Seal Reflections (Section 5.1)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      38,
      window.innerWidth / Math.max(1, window.innerHeight),
      0.1,
      60
    );
    camera.position.set(0, 1.65, 8.9);

    // Lighting (Section 5.4):
    // 1. Strong warm ivory backlight (#F2E3C6) from the Pelaminan dais toward the couple (creates dramatic rim-light on sanggul, blangkon, shoulders, and keris!)
    const pelaminanBacklight = new THREE.SpotLight(
      0xf2e3c6,
      2.6,
      16,
      Math.PI / 3,
      0.55,
      1.2
    );
    pelaminanBacklight.position.set(0, 3.6, -2.6);
    pelaminanBacklight.target.position.set(0, 1.1, 0.5);
    scene.add(pelaminanBacklight);
    scene.add(pelaminanBacklight.target);

    // 2. Soft Maroon-Sogan fill light (#8E2233, intensity 0.35) from behind the camera so the couple's back kebaya/beskap details remain visible
    const frontFillLight = new THREE.DirectionalLight(0x8e2233, 0.48);
    frontFillLight.position.set(0, 2.4, 7.5);
    scene.add(frontFillLight);

    // 3. Warm Key Light for the 3D Envelope & Gebyok
    const keyLight = new THREE.DirectionalLight(0xf2e3c6, 1.15);
    keyLight.position.set(-2.4, 4.2, 9.5);
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xf2e3c6, 0x3b0a14, 0.52);
    scene.add(hemiLight);

    const initialState = stateRef.current;

    // Build all 3D Pelaminan Jawa & Pengantin layers in the SAME Canvas (Section 5.3)
    const pelaminan = createPelaminanScene();
    scene.add(pelaminan.group);

    const pengantin = createPengantinScene();
    scene.add(pengantin.group);

    const dustParticles = createDustParticlesRig(isSoftwareGl ? 60 : 120);
    scene.add(dustParticles.points);

    // 3D Maroon Scalloped Envelope + Wax Seal at z = 6.2
    const envelopeRig = createEnvelopeRig(
      initialState.sealStyle,
      initialState.guestName,
      invitation.couple.initials
    );
    scene.add(envelopeRig.group);

    const cameraRig = createCameraRigController();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      pointerY = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = Math.max(1, window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Progressive Kayon loader readiness
    const readyTimer = window.setTimeout(() => {
      useInvitation.getState().setLoadingProgress(68);
    }, 100);
    const fullReadyTimer = window.setTimeout(() => {
      useInvitation.getState().markSceneReady();
    }, 280);

    let frameId = 0;
    let lastTimeMs = performance.now();
    let openingStartMs: number | null = null;
    let prevSealStyle = initialState.sealStyle;
    let prevGuestName = initialState.guestName;

    // Software WebGL fence-sync frame pacing so headless Chromium never stalls
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (!sync) {
            frameId = window.setTimeout(cb, 80);
            return;
          }
          const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (status === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const nowMs = performance.now();
      const rawDt = (nowMs - lastTimeMs) / 1000;
      const dt = Math.min(0.25, rawDt);
      lastTimeMs = nowMs;
      const elapsedSec = nowMs / 1000;

      const st = stateRef.current;

      if (st.sealStyle !== prevSealStyle) {
        prevSealStyle = st.sealStyle;
        envelopeRig.waxSeal.setStyle(st.sealStyle);
      }
      if (st.guestName !== prevGuestName) {
        prevGuestName = st.guestName;
        envelopeRig.updateGuestTexture(st.guestName, invitation.couple.initials);
      }

      // Advance 3.6s envelope opening timeline using real wall-clock elapsed time
      let currentOpeningElapsed = st.openingElapsed;
      if (st.envelopePhase === 'opening') {
        if (openingStartMs === null) {
          openingStartMs = nowMs - st.openingElapsed * 1000;
        }
        currentOpeningElapsed = Math.min(3.6, (nowMs - openingStartMs) / 1000);
        useInvitation.getState().setOpeningElapsed(currentOpeningElapsed);
      } else {
        openingStartMs = null;
      }

      const isPortrait = window.innerHeight > window.innerWidth;
      const rigState = cameraRig.update(
        camera,
        dt,
        st.envelopePhase,
        currentOpeningElapsed,
        st.sectionIndex,
        st.transitionProgress,
        st.prefersReducedMotion,
        isPortrait
      );

      // Update 3D Envelope
      envelopeRig.update(
        elapsedSec,
        rigState.envelopeTimeline,
        st.dragOpenProgress,
        pointerX,
        pointerY
      );

      // Update Pelaminan, Pengantin (climbing steps 0..8), and Dust Particles
      pelaminan.update(elapsedSec, rigState.dimFactor);
      pengantin.update(elapsedSec, rigState.coupleStep);
      dustParticles.update(elapsedSec, st.prefersReducedMotion);

      // Update safe text zone gradient & atmospheric vignette
      if (vignetteOverlayRef.current) {
        const extraDim = rigState.dimFactor * 0.55;
        vignetteOverlayRef.current.style.backgroundColor = `rgba(11, 5, 6, ${extraDim.toFixed(3)})`;
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      window.clearTimeout(readyTimer);
      window.clearTimeout(fullReadyTimer);
      cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      pelaminan.dispose();
      pengantin.dispose();
      renderer.dispose();
    };
  }, [isFallback2D]);

  if (isFallback2D) {
    return <EnvelopeFallback2D />;
  }

  return (
    <div
      data-testid="experience-canvas"
      data-envelope-phase={envelopePhase}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0506]"
    >
      <div ref={canvasMountRef} className="w-full h-full" />
      {/* Safe Text Zone Top/Bottom Gradient + Cinematic Vignette (Section 0.3 & 5.5) */}
      <div
        ref={vignetteOverlayRef}
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(11,5,6,0.82) 0%, rgba(11,5,6,0.28) 38%, rgba(11,5,6,0.18) 68%, rgba(11,5,6,0.86) 100%), radial-gradient(circle at 50% 58%, rgba(11,5,6,0) 38%, rgba(11,5,6,0.72) 86%, rgba(11,5,6,0.94) 100%)',
        }}
      />
    </div>
  );
};
