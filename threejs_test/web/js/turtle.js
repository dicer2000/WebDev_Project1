// turtle.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// We'll store the AnimationMixer here so we can update it each frame
let mixer = null;

// Also store a clock if we want each turtle update to have its own time calculation
// (Alternatively, you could keep a single global clock in main.js)
const clock = new THREE.Clock();

/**
 * Initializes the turtle: loads the model, scales it, positions it, etc.
 * @param {THREE.Scene} scene - The scene where the turtle will be added.
 */
export function initTurtle(scene) {
  const loader = new GLTFLoader();

  loader.load('./models/turtle/scene.gltf', function (gltf) {
    // Position and scale your turtle
    gltf.scene.scale.set(0.1, 0.1, 0.1);
    gltf.scene.position.set(0, -3, 5);
    gltf.scene.rotation.y = Math.PI;

    // Add to scene
    scene.add(gltf.scene);

    // Create an AnimationMixer for the model
    mixer = new THREE.AnimationMixer(gltf.scene);

    // Play any animations included in the glTF
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });
  }, 
  undefined, 
  function (error) {
    console.error('Error loading turtle model:', error);
  });
}

/**
 * Updates the turtle (e.g. animation mixer).
 * Call this from your main animation loop.
 */
export function updateTurtle() {
  if (mixer) {
    const delta = clock.getDelta(); // time in seconds since last frame
    mixer.update(delta);
  }
}

export function getTurtlePosition() {
  return turtle ? turtle.position : null;
}