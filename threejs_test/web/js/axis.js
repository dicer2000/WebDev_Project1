// axis.js

import * as THREE from 'three';

/**
 * Creates colored arrows on the +X, +Y, +Z axes, plus labels ("x", "y", "z").
 * @param {THREE.Scene} scene - The Three.js scene to which the axes are added.
 * @param {number} length - Length of each axis arrow (default = 10).
 */
export function addAxes(scene, length = 10) {
  // Create an arrow for each axis using THREE.ArrowHelper.
  // The last two parameters (headLength, headWidth) are a fraction of the total length for styling.

  // +X Axis: Red
  const arrowX = new THREE.ArrowHelper(
    new THREE.Vector3(1, 0, 0),  // direction
    new THREE.Vector3(0, 0, 0),  // origin
    length,
    0xff0000,                    // color (red)
    0.02 * length,                // headLength
    0.01 * length                 // headWidth
  );
  scene.add(arrowX);

  // +Y Axis: Green
  const arrowY = new THREE.ArrowHelper(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 0),
    length,
    0x00ff00,
    0.02 * length,
    0.01 * length
  );
  scene.add(arrowY);

  // +Z Axis: Blue
  const arrowZ = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, 0),
    length,
    0x0000ff,
    0.02 * length,
    0.01 * length
  );
  scene.add(arrowZ);

  // Add text labels at the tips of each arrow.
  // We'll use small "text sprites" so no font loaders are required.
  const xLabel = createTextSprite('x', '#ff0000');
  xLabel.position.set(length * 1.05, 0, 0);
  scene.add(xLabel);

  const yLabel = createTextSprite('y', '#00ff00');
  yLabel.position.set(0, length * 1.05, 0);
  scene.add(yLabel);

  const zLabel = createTextSprite('z', '#0000ff');
  zLabel.position.set(0, 0, length * 1.05);
  scene.add(zLabel);
}

/**
 * Creates a small sprite displaying the given text.
 * @param {string} text - The string to display (e.g. "x", "y", "z").
 * @param {string} color - Any valid CSS color (default white).
 * @returns {THREE.Sprite} - A sprite containing the rendered text.
 */
function createTextSprite(text, color = '#ffffff') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Decide how large the canvas should be
  const size = 256;
  canvas.width = size;
  canvas.height = size;

  // Customize font, alignment, color, etc.
  context.font = 'bold 100px sans-serif';
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Draw the text in the center
  context.fillText(text, size / 2, size / 2);

  // Create a texture from the canvas
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  // Make a sprite material from the texture
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);

  // Scale the sprite down so it's not too large in the scene
  sprite.scale.set(2, 2, 1);

  return sprite;
}
