/**
 * Blencong Oil Lamp Warm Ivory Halo Shader (Section 3.1 & 5.3)
 * Warm ivory #F2E3C6 (never yellow) with gentle organic flicker 0.92..1.08.
 */
export const flameVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const flameFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 center = vec2(0.5, 0.52);
    float dist = distance(vUv, center);

    // Gentle blencong oil lamp flicker (0.92 to 1.08)
    float flicker = 1.0 + 0.05 * sin(uTime * 2.7) + 0.03 * cos(uTime * 4.3);
    float radial = smoothstep(0.68, 0.0, dist) * flicker * uIntensity;

    vec3 colBlencong = vec3(0.949, 0.890, 0.776); // #F2E3C6
    vec3 colGading = vec3(0.918, 0.875, 0.796);   // #EADFCB
    vec3 colMaroonPekat = vec3(0.231, 0.039, 0.078); // #3B0A14

    vec3 color = mix(colMaroonPekat, mix(colGading, colBlencong, radial), clamp(radial * 1.15, 0.0, 1.0));
    gl_FragColor = vec4(color, 1.0);
  }
`;
