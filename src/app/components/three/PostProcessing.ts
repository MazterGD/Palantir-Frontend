import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

export function setupPostProcessing(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  const renderScene = new RenderPass(scene, camera);

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);

  const smaaPass = new SMAAPass();
  composer.addPass(smaaPass);

  const update = () => {
    composer.render();
  };

  const resize = () => {
    composer.setSize(window.innerWidth, window.innerHeight);
  };

  return { composer, update, resize };
}
