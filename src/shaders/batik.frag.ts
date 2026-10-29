/**
 * Procedural Batik Parang / Cotton Paper Shader (Section 3.3 & 10A #6)
 */
export const batikFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform float uOpacity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // Diagonal Parang wave coordinates
    float diag = (vUv.x + vUv.y) * 18.0;
    float sWave = sin(diag + sin(vUv.x * 12.0) * 1.5);
    float band = smoothstep(0.2, 0.28, abs(sWave));
    float grain = (hash(vUv * 240.0) - 0.5) * 0.04;

    vec3 col = mix(uColorSecondary, uColorPrimary, band) + grain;
    gl_FragColor = vec4(col, uOpacity);
  }
`;
