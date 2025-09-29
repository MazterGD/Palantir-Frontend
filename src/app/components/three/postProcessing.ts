import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";

export function setupPostProcessing(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
) {
  const composer = new EffectComposer(renderer);

  // Base render
  const renderScene = new RenderPass(scene, camera);
  composer.addPass(renderScene);

  // SMAA antialiasing
  const smaaPass = new SMAAPass();
  composer.addPass(smaaPass);

  // Vignette
  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms["offset"].value = 1.2;
  vignettePass.uniforms["darkness"].value = 1.1;
  composer.addPass(vignettePass);

  // Film grain shader
  // const filmGrainShader = {
  //   uniforms: {
  //     tDiffuse: { value: null },
  //     time: { value: 0.0 },
  //     intensity: { value: 0.1 }
  //   },
  //   vertexShader: `
  //     varying vec2 vUv;
  //     void main() {
  //       vUv = uv;
  //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //     }
  //   `,
  //   fragmentShader: `
  //     uniform sampler2D tDiffuse;
  //     uniform float time;
  //     uniform float intensity;
  //     varying vec2 vUv;

  //     float random(vec2 st) {
  //       return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  //     }

  //     void main() {
  //       vec4 color = texture2D(tDiffuse, vUv);
  //       float noise = (random(vUv + time) - 0.5) * intensity;
  //       color.rgb += noise;
  //       gl_FragColor = color;
  //     }
  //   `
  // };
  // const filmGrainPass = new ShaderPass(filmGrainShader);
  // composer.addPass(filmGrainPass);

  // --- Update function ---
  const update = () => {
    composer.render();
  };

  // --- Resize function ---
  const resize = () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  return { composer, update, resize };
}
