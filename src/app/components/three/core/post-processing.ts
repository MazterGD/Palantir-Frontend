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

  const renderScene = new RenderPass(scene, camera);
  composer.addPass(renderScene);

  const smaaPass = new SMAAPass();
  composer.addPass(smaaPass);

  const vignettePass = new ShaderPass(VignetteShader);
  vignettePass.uniforms["offset"].value = 1.2;
  vignettePass.uniforms["darkness"].value = 1.1;
  composer.addPass(vignettePass);

  const update = () => {
    composer.render();
  };

  const resize = () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  return { composer, update, resize };
}
