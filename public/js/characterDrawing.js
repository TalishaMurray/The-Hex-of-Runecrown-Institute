// Canvas-related functions for drawing the character

// Function to clear the canvas
export function clearCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Load image from source
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

// Draw character with different parts and colors
export async function drawCharacter(ctx, canvas, character) {
  clearCanvas(ctx, canvas);
  try {
    // Load base image (masc or fem)
    const baseImage = await loadImage(`./images/bases/${character.base}.png`);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Get the skin color
    const skinColor = character.looks.find((look) => look.id === 'skin').color;

    // Modify the image pixel data for skin color
    modifyImagePixelData(ctx, skinColor, canvas);

  } catch (err) {
    console.error('Error loading images:', err);
  }
}

// Function to modify pixel data of the base image
export function modifyImagePixelData(ctx, newColor, canvas) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert the new hex color to RGB
  const rgbColor = hexToRgb(newColor);

  // Define the threshold for white skin color
  const skinColorThreshold = {
    r: 255,  // Target white (255, 255, 255)
    g: 255,
    b: 255,
    tolerance: 150  // Tolerance to match near-white colors
  };

  // Loop through every pixel in the image
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];     // Red
    const g = data[i + 1]; // Green
    const b = data[i + 2]; // Blue

    // Check if the pixel is close to white
    if (
      Math.abs(r - skinColorThreshold.r) < skinColorThreshold.tolerance &&
      Math.abs(g - skinColorThreshold.g) < skinColorThreshold.tolerance &&
      Math.abs(b - skinColorThreshold.b) < skinColorThreshold.tolerance
    ) {
      // Replace the pixel with the new skin color
      data[i] = rgbColor.r;      // Red
      data[i + 1] = rgbColor.g;  // Green
      data[i + 2] = rgbColor.b;  // Blue
    }
  }

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, 0, 0);
}

// Function to convert hex color to RGB
export function hexToRgb(hex) {
  hex = hex.replace('#', '');

  // Convert shorthand hex (e.g., #FFF) to full hex (e.g., #FFFFFF)
  if (hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
  }

  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

export { clearCanvas, loadImage, drawCharacter, hexToRgb, modifyImagePixelData };

