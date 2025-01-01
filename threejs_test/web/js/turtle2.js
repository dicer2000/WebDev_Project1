// turtle.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let currentTweenStart = null;
let currentTweenDuration = 0;
let startPos = new THREE.Vector3();
let endPos = new THREE.Vector3();
let tweenActive = false;

// Rotation tween
let rotationTweenStart = null;
let rotationTweenDuration = 0;
let rotationTweenActive = false;
let rotationStartAngle = 0;
let rotationEndAngle = 0;

const DEFAULT_ANGLE = Math.PI;
const MAX_TURN_DEG = 10;
const MAX_TURN_RAD = THREE.MathUtils.degToRad(MAX_TURN_DEG);

const regionPositions = [
  new THREE.Vector3(-5,  5, 5),
  new THREE.Vector3( 0,  5, 5),
  new THREE.Vector3( 5,  5, 5),
  new THREE.Vector3(-5,  0, 5),
  new THREE.Vector3( 0,  0, 5),
  new THREE.Vector3( 5,  0, 5),
  new THREE.Vector3(-5, -3, 5),
  new THREE.Vector3( 0, -3, 5),
  new THREE.Vector3( 5, -3, 5)
];

let currentRegionIndex = -1;
let regionTimeout = 0;
let lastRegionChange = 0;

let turtle = null;
let mixer = null;
const clock = new THREE.Clock();

export function initTurtle(scene) {
  const loader = new GLTFLoader();
  loader.load('./models/turtle/scene.gltf', function(gltf) {
    turtle = gltf.scene;
    turtle.scale.set(0.1, 0.1, 0.1);
    turtle.position.set(0, -8, 12);
    turtle.rotation.y = DEFAULT_ANGLE;

    scene.add(turtle);

    mixer = new THREE.AnimationMixer(turtle);
    gltf.animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.play();
    });

    // Let the turtle pick a region on the next update
    lastRegionChange = performance.now() - 999999;
    regionTimeout = 0;
  },
  undefined,
  function(error) {
    console.error('Error loading turtle model:', error);
  });
}

export function updateTurtle() {
  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }
  if (!turtle) return;

  const now = performance.now();

  if (!tweenActive && !rotationTweenActive && (now - lastRegionChange > regionTimeout)) {
    pickNewRegion(); 
  }

  // Movement tween
  if (tweenActive) {
    const elapsed = now - currentTweenStart;
    const t = Math.min(elapsed / currentTweenDuration, 1.0);
    turtle.position.lerpVectors(startPos, endPos, easeInOutQuad(t));
    if (t >= 1.0) {
      tweenActive = false;
      startRotateBackToDefault();
    }
  }

  // Rotation tween
  if (rotationTweenActive) {
    const elapsedRot = now - rotationTweenStart;
    const tr = Math.min(elapsedRot / rotationTweenDuration, 1.0);
    const currentAngle = lerpAngle(rotationStartAngle, rotationEndAngle, easeInOutQuad(tr));
    turtle.rotation.y = currentAngle;

    if (tr >= 1.0) {
      rotationTweenActive = false;

      // Once a rotation to DEFAULT_ANGLE finishes, set idle time
      if (!tweenActive && rotationEndAngle === DEFAULT_ANGLE) {
        lastRegionChange = performance.now();
        regionTimeout = 3000 + Math.random() * 3000; // 3–6s
      }
    }
  }
}

// *** CHANGED *** 
// We'll rotate FIRST, then set up the movement tween inside the .then() callback.
// This prevents any 'jump' when the rotation finishes.
function pickNewRegion() {
  let newIndex = currentRegionIndex;
  while (newIndex === currentRegionIndex) {
    newIndex = Math.floor(Math.random() * regionPositions.length);
  }

  // If starting out, set the new newIndex to the middle
  if (currentRegionIndex < 0) {
    newIndex = 4;  // center-middle
  } else {
    while (newIndex === currentRegionIndex) {
      newIndex = Math.floor(Math.random() * regionPositions.length);
    }
  }
  currentRegionIndex = newIndex;

  // We'll remember where we want to end up,
  // but DON'T set startPos yet.
  const nextPos = regionPositions[currentRegionIndex];

  // Figure out how we want to rotate
  const direction = new THREE.Vector3().subVectors(nextPos, turtle.position).normalize();
  const rawAngle = Math.atan2(direction.x, direction.z);
  let angleDelta = DEFAULT_ANGLE - rawAngle;
  angleDelta = normalizeAngleDelta(angleDelta);
  angleDelta = THREE.MathUtils.clamp(angleDelta, -MAX_TURN_RAD, MAX_TURN_RAD);

  const desiredAngle = DEFAULT_ANGLE + angleDelta;

  // 1) Rotate in place
  rotateToTarget(desiredAngle, 2000).then(() => {
    // 2) After rotation completes, set up the movement tween
    startPos.copy(turtle.position);                // new start is wherever we ended rotation
    endPos.copy(nextPos);                          // region target
    currentTweenStart = performance.now();
    currentTweenDuration = 5000;                   // slow movement
    tweenActive = true;
  });
}

function rotateToTarget(angle, duration) {
  return new Promise((resolve) => {
    rotationTweenActive = true;
    rotationTweenStart = performance.now();
    rotationTweenDuration = duration;

    rotationStartAngle = turtle.rotation.y;
    rotationEndAngle = angle;

    const checkRotationDone = () => {
      if (!rotationTweenActive) resolve();
      else requestAnimationFrame(checkRotationDone);
    };
    requestAnimationFrame(checkRotationDone);
  });
}

// *** CHANGED ***
// Keep the same 2s rotate back to default, but you can adjust if you want
function startRotateBackToDefault() {
  rotateToTarget(DEFAULT_ANGLE, 2000);
}

function normalizeAngleDelta(angleDelta) {
  while (angleDelta > Math.PI) {
    angleDelta -= 2 * Math.PI;
  }
  while (angleDelta < -Math.PI) {
    angleDelta += 2 * Math.PI;
  }
  return angleDelta;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerpAngle(start, end, alpha) {
  return start + (end - start) * alpha;
}

export function getTurtlePosition() {
    return turtle ? turtle.position : null;
  }