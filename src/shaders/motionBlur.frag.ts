/**
 * Directional horizontal motion blur shader for the whip-pan transition
 * (Section 4 -> Section 5: Hitung Mundur -> Acara).
 */
export const MOTION_BLUR_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const MOTION_BLUR_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform sampler2D uScene;
uniform float uStrength; // 0.0 -> 0.035 during whip-pan peak
uniform float uDirection; // 1.0 or -1.0
varying vec2 vUv;

void main() {
  vec4 acc = vec4(0.0);
  float weights[7];
  weights[0] = 0.07;
  weights[1] = 0.13;
  weights[2] = 0.19;
  weights[3] = 0.22;
  weights[4] = 0.19;
  weights[5] = 0.13;
  weights[6] = 0.07;

  for (int i = -3; i <= 3; i++) {
    float offset = float(i) * uStrength * uDirection * 0.33;
    vec2 sampleUv = clamp(vUv + vec2(offset, 0.0), 0.001, 0.999);
    acc += texture2D(uScene, sampleUv) * weights[i + 3];
  }

  gl_FragColor = acc;
}
`;
