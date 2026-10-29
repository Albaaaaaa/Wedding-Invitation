/**
 * Double Exposure Shader (Section 5.5 of Revisi Final):
 * Blends couple portrait photo (duotone #0B0506 -> #6B1424 -> #EADFCB)
 * inside the carved Javanese Gebyok Gapura arch alpha mask (/assets/gapura-mask.svg).
 */
export const DOUBLE_EXPOSURE_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const DOUBLE_EXPOSURE_FRAGMENT_SHADER = /* glsl */ `
precision mediump float;

uniform sampler2D uPhoto;
uniform sampler2D uMask;      // Siluet lengkung Gapura Gebyok (/assets/gapura-mask.svg)
uniform sampler2D uBatik;     // Tekstur halus motif parang/kawung
uniform float uReveal;        // 0 -> 1 saat kartu masuk
uniform float uHover;         // 0 -> 1 saat disentuh / hover
uniform vec2 uMaskOffset;     // Penyesuaian posisi wajah di dalam lengkung
uniform float uMaskScale;
varying vec2 vUv;

const vec3 HITAM  = vec3(0.043, 0.020, 0.024); // #0B0506
const vec3 MAROON = vec3(0.420, 0.078, 0.141); // #6B1424
const vec3 GADING = vec3(0.918, 0.875, 0.796); // #EADFCB

void main() {
  vec2 mUv = (vUv - 0.5) / uMaskScale + 0.5 + uMaskOffset;
  float mask = texture2D(uMask, clamp(mUv, 0.0, 1.0)).r;

  vec4 photo = texture2D(uPhoto, vUv);
  float luma = dot(photo.rgb, vec3(0.299, 0.587, 0.114));

  // Duotone: bayangan -> hitam, tengah -> maroon, terang -> gading
  vec3 duotone = mix(HITAM, MAROON, smoothstep(0.05, 0.55, luma));
  duotone = mix(duotone, GADING, smoothstep(0.55, 0.95, luma));

  // Saat hover, tampilkan sedikit warna asli foto (maks 35%)
  vec3 toned = mix(duotone, photo.rgb, uHover * 0.35);

  float batik = texture2D(uBatik, vUv * 3.0).r;
  vec3 inside = mix(toned, GADING, batik * 0.08);

  // Tepi siluet lengkung gapura berpendar gading tipis
  float rim = smoothstep(0.15, 0.5, mask) - smoothstep(0.5, 0.85, mask);
  vec3 color = mix(HITAM, inside, smoothstep(0.2, 0.7, mask));
  color += GADING * rim * 0.35;

  float alpha = smoothstep(0.1, 0.6, mask) * uReveal;
  gl_FragColor = vec4(color, alpha);
}
`;
