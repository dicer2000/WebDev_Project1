// main.js

import * as THREE from 'three';
import { initSeaweed, update as updateSeaweed, draw as drawSeaweed } from './seaweed.js';
import { settings } from './settings.js';
// Import turtle logic
import { initTurtle, updateTurtle, getTurtlePosition } from './turtle2.js'; 

// Used to show axis
//import { addAxes } from './axis.js';

// -------------- Scene Setup --------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  settings.farLimit
);
camera.position.z = 20;
const cameraLookAt = new THREE.Vector3(0, 0, 0);

// ---- Renderer with a CSS Background
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add the axis lines (default length = 10)
//addAxes(scene, 10);

// -------------- Lights --------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xccccff, 0.6);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// -------------- Initialize Turtle --------------
initTurtle(scene); // Calls the function that loads the turtle

// -------------- Seaweed Initialization --------------
initSeaweed(scene); // Provide the scene to seaweed.js so it can add objects

// -------------- Animation Loop --------------
function animate(time) {
  requestAnimationFrame(animate);

  // 1) Update seaweed (spawn, wave, remove)
  updateSeaweed(time);
  drawSeaweed();

  // 2) Update turtle animation
  updateTurtle();

  // Smoothly update camera lookAt toward the turtle’s position.
  const turtlePos = getTurtlePosition();
  if (turtlePos) {
    // Now you can smoothly track the camera’s lookAt 
    smoothCameraLookAt(turtlePos, 0.005);
  }

  // 3) Render
  renderer.render(scene, camera);
}
animate();

// -------------- Handle Resizing --------------
window.addEventListener('resize', onWindowResize);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Smoothly adjusts the cameraLookAt vector closer to the turtle's position 
 * by a small factor each frame (0.02 = 2%).
 *
 * @param {THREE.Vector3} targetPos - The turtle's current position.
 * @param {number} alpha - A small lerp factor (e.g., 0.02).
 */
function smoothCameraLookAt(targetPos, alpha) {
  // "cameraLookAt" is a global or higher-scoped variable
  cameraLookAt.lerp(targetPos, alpha);
  camera.lookAt(cameraLookAt);
}