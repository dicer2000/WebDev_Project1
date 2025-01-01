// seaweed.js

import * as THREE from 'three';
import { settings } from './settings.js';

// Internal array to track all seaweed
const seaweedArray = [];

// Keep a reference to the scene we’re working with
let sceneRef = null;

// Track the last time new seaweed was spawned
let lastSpawnTime = 0;

/**
 * Initializes the seaweed system by storing a reference to the scene.
 * @param {THREE.Scene} scene - The Three.js scene to which seaweed will be added.
 */
export function initSeaweed(scene) {
  sceneRef = scene;
}

/**
 * Spawns a new multi-segment seaweed line.
 */
function spawnSeaweed() {
    // horizontal spread
    const x = (Math.random() - 0.5) * 60;
  const bottomY = -15;
  const z = 20; // spawn behind the camera at z=30 (camera is around z=20)

  // random seaweed height
  const seaweedHeight = 5 + Math.random() * 9; 

  // build positions array for multiple segments
  const positions = [];
  for (let i = 0; i <= settings.segmentCount; i++) {
    const segmentY = bottomY + (seaweedHeight / settings.segmentCount) * i;
    positions.push(0, segmentY, 0);
  }

  // create BufferGeometry from these points
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );

  // create material and line
  const material = new THREE.LineBasicMaterial({ color: 0x228B22 });
  const seaweedLine = new THREE.Line(geometry, material);

  // place the seaweed in the scene
  seaweedLine.position.set(x, 0, z);
  sceneRef.add(seaweedLine);

  // add to our tracking array
  seaweedArray.push(seaweedLine);
}

/**
 * update() handles:
 * 1) Spawning new seaweed at intervals
 * 2) Moving each seaweed toward the camera
 * 3) Waving motion in the X direction
 * 4) Removing seaweed that's behind the far limit
 * 
 * @param {number} time - The elapsed time (ms) provided by requestAnimationFrame.
 */
export function update(time) {
  // 1) Spawn new seaweed at intervals
  if (time - lastSpawnTime > settings.seaweedSpawnInterval) {
    spawnSeaweed();
    lastSpawnTime = time;
  }

  // 2) Update each seaweed
  for (let i = seaweedArray.length - 1; i >= 0; i--) {
    const weed = seaweedArray[i];

    // Move weed toward camera
    weed.position.z -= settings.seaweedSpeed;

    // Waving motion in X direction
    const geometry = weed.geometry;
    const positionAttr = geometry.attributes.position;
    const posArray = positionAttr.array;

    // time is in ms; convert to seconds for sine wave
    const elapsedSec = time / 1000;

    for (let j = 0; j < posArray.length; j += 3) {
      const baseY = posArray[j + 1];
      const phase = baseY * 0.5; // small offset by Y
      const newX = settings.waveAmplitude * Math.sin(settings.waveSpeed * elapsedSec + phase);
      posArray[j] = newX;
    }
    positionAttr.needsUpdate = true;

    // 3) Remove seaweed if it crosses behind the far limit
    if (weed.position.z < -settings.farLimit) {
      sceneRef.remove(weed);
      seaweedArray.splice(i, 1);
    }
  }
}

/**
 * draw() is separated out, but in Three.js we typically call renderer.render().
 * You could do extra drawing or debug overlays here if needed.
 * For now, we’ll keep it simple.
 */
export function draw() {
  // In Three.js, there's not much to do here unless you're doing custom draws
  // outside of the main renderer. We'll leave this function as a placeholder.
}
