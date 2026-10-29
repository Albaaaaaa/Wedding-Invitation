/**
 * Vertex displacement shader for waving maroon drapes (Tirai) and trailing jarik slepe cloth.
 */
export const CLOTH_VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uSwayAmp;
uniform float uSweepProgress; // 0.0 -> 1.0 for drape wipe

varying vec2 vUv;
varying float vFold;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Vertical pleat folds along X
  float pleat = sin(uv.x * 28.0 + uTime * 1.1) * 0.035 * (1.0 - uv.y * 0.35);
  // Gentle breeze wave increasing toward bottom hem (uv.y -> 0)
  float breeze = sin(uv.y * 5.0 - uTime * 1.4 + uv.x * 3.0) * uSwayAmp * (1.0 - uv.y * 0.6);

  pos.z += pleat + breeze;
  pos.x += sin(uv.y * 3.14159) * uSweepProgress * 0.18;

  vFold = pleat * 14.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const CLOTH_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform vec3 uColorBase;   // #6B1424 Maroon Keraton
uniform vec3 uColorShadow; // #3B0A14 Maroon Pekat
uniform vec3 uColorTrim;   // #EADFCB Gading
uniform float uOpacity;

varying vec2 vUv;
varying float vFold;

void main() {
  float shade = clamp(0.5 + vFold, 0.0, 1.0);
  vec3 col = mix(uColorShadow, uColorBase, shade);

  // Subtle vertical woven silk sheen & ivory hem trim
  float edgeTrim = smoothstep(0.025, 0.008, vUv.x) + smoothstep(0.975, 0.992, vUv.x);
  col = mix(col, uColorTrim, clamp(edgeTrim * 0.35, 0.0, 0.35));

  gl_FragColor = vec4(col, uOpacity);
}
`;
