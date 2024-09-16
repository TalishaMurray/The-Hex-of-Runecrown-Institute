const textElement = document.getElementById('text');
const optionButtonsElement = document.getElementById('option-btns');
const canvas = document.getElementById('characterCanvas');
const ctx = canvas.getContext('2d');

let gameHistory = [];
let inventory = {};
let character = {};

// Game choice functions
function startGame() {
  inventory = {};
  character = {
    base: "masc", // Default to masc base
    stats: [],
    looks: [
      { id: "skin", color: "#EFE9DA" },  // Default hex color for skin
      { id: "hair", color: "#000000" },  // Default hex color for hair
      { id: "eyes", color: "#000000" }   // Default hex color for eyes
    ]
  };

  gameHistory = [];
  gameHistory.push({
    character: JSON.parse(JSON.stringify(character)),
    inventory: JSON.parse(JSON.stringify(inventory)),
    currentTextNodeId: 1  // Save the initial state
  });

  drawCharacter(); // Initial draw
  showTextNode(1);  // Show first text node
}

// Show the current text node and its options
function showTextNode(index) {
  const textNode = textNodes.find(textNode => textNode.id === index);
  textElement.innerText = textNode.text;

  // Clear previous options
  while (optionButtonsElement.firstChild) {
    optionButtonsElement.removeChild(optionButtonsElement.firstChild);
  }

  // Loop through options and create buttons or color picker
  textNode.options.forEach(option => {
    if (showOption(option)) {
      if (option.type === 'color-picker') {
        // Create color picker for specific part (skin, hair, eyes, etc.)
        const label = document.createElement('label');
        label.innerText = `Pick your ${option.lookPart} color: `;

        const colorPicker = document.createElement('input');
        colorPicker.className = 'jscolor';
        colorPicker.value = character.looks.find(look => look.id === option.lookPart).color || "#EFE9DA";
        colorPicker.setAttribute('data-jscolor', '{closable:true,closeText:"OK",zIndex:9999}');

        // Update character's look part color on input change
        colorPicker.addEventListener('change', (e) => {
          const selectedColor = colorPicker.jscolor.toString(); // jscolor returns a hex string
          const lookPart = option.lookPart; // "skin", "hair", or "eyes"
          handleColorChange(lookPart, selectedColor); // Update the canvas
        });

        // Append color picker
        optionButtonsElement.appendChild(label);
        optionButtonsElement.appendChild(colorPicker);

        // Initialize jscolor after appending
        jscolor.install();
      } else {
        // Create regular button for other options
        const button = document.createElement('button');
        button.classList.add('btn', 'option-btns');
        button.innerText = option.text;
        button.addEventListener('click', () => selectOption(option));
        optionButtonsElement.appendChild(button);
      }
    }
  });
}

function showOption(option) {
  return !option.requiredItem || option.requiredItem(inventory) && (!option.requiredStat || option.requiredStat(character.stats));
}

function selectOption(option) {
  if (option.isGoBack) {
    goBack();  // If it's a "go back" option, handle it
    return;
  }

  // Handle base change but do not push a new state to gameHistory
  if (option.setBase) {
    character.base = option.setBase;
    drawCharacter();  // Re-draw the character with the chosen base
    return;  // No state change, just redraw
  }

  // Handle looks (color) change without saving the state
  if (option.setLooks) {
    const lookIndex = character.looks.findIndex(look => look.id === option.setLooks.id);
    if (lookIndex > -1) {
      character.looks[lookIndex].color = option.setLooks.color;
    } else {
      character.looks.push({ id: option.setLooks.id, color: option.setLooks.color });
    }
    drawCharacter();  // Re-draw the character with updated looks
    return;  // No state change, just redraw
  }

  // Save the current state **only when moving to a new text node**
  gameHistory.push({
    character: JSON.parse(JSON.stringify(character)),
    inventory: JSON.parse(JSON.stringify(inventory)),
    currentTextNodeId: option.nextText
  });

  showTextNode(option.nextText);
}

function goBack() {
  if (gameHistory.length > 1) {
    gameHistory.pop();  // Remove the current state
    const previousState = gameHistory[gameHistory.length - 1];  // Get the previous state

    // Restore the previous state
    character = JSON.parse(JSON.stringify(previousState.character));
    inventory = JSON.parse(JSON.stringify(previousState.inventory));

    // Show the previous text node
    showTextNode(previousState.currentTextNodeId);
  }
}

// Canvas drawing functions

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
  });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function drawCharacter() {
  clearCanvas();

  try {
    // Load the base image (fem or masc)
    const baseImage = await loadImage(`./images/bases/${character.base}.png`);
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Get the skin color
    const skinColor = character.looks.find(look => look.id === 'skin').color;

    // Modify the image pixel data for skin color
    modifyImagePixelData(skinColor);

  } catch (err) {
    console.error('Error loading images:', err);
  }
}

// Function to modify pixel data of the base image
function modifyImagePixelData(newColor) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert the new hex color to RGB
  const rgbColor = hexToRgb(newColor);

  // Define the threshold for white skin color
  const skinColorThreshold = {
    r: 255,  // Target white (255, 255, 255)
    g: 255,
    b: 255,
    tolerance: 125  // Tolerance to match near-white colors
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
  console.log('Converted RGB color:', rgbColor);

  // Put the modified image data back onto the canvas
  ctx.putImageData(imageData, 0, 0);
}


// Function to convert hex color to RGB
function hexToRgb(hex) {
  // Ensure the hex color starts with '#'
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


function updateCharacterBase(baseType) {
  character.base = baseType;
  drawCharacter();
}

function handleColorChange(part, color) {
  const lookIndex = character.looks.findIndex(look => look.id === part);
  if (lookIndex > -1) {
    // Add '#' prefix if it doesn't exist
    if (!color.startsWith('#')) {
      color = `#${color}`;
    }

    // Update the character's color in the looks array
    character.looks[lookIndex].color = color;
    console.log('Selected color:', color);

    // Re-draw the character with the updated look
    drawCharacter();
  }
}

// Text nodes (game choices)
const textNodes = [
  {
    id: -1,
    text: "You look into your mirror and see...",
    options: [
      { text: "A masculine figure", setBase: "masc" },
      { text: "A feminine figure", setBase: "fem" },
      { text: "Confirm", nextText: -2 },
      { text: "Back", nextText: null, isGoBack: true }
    ]
  },
  {
    id: -2,
    text: "You look into your mirror and see...",
    options: [
      { text: "Pick your own skin color", type: "color-picker", lookPart: "skin" },
      { text: "Confirm skin color", nextText: -3 },
      { text: "Back", nextText: null, isGoBack: true }
    ]
  },
  {
    id: -3,
    text: "You look into the mirror and see...",
    options: [
      { text: "Hairstyles to be added", nextText: -4 },
      { text: "Back", nextText: null, isGoBack: true }
    ]
  },
  {
    id: 1,
    text: "Our story starts on an average day.",
    options: [
      { text: "Step into your first day of life.", nextText: 2 }
    ]
  },
  {
    id: 2,
    text: "Wait a minute, do you know who you are?",
    options: [
      { text: "Yes! I know exactly who I am!" },
      { text: "No... I should take a look in the mirror.", nextText: -1 }
    ]
  }
];

// Start the game
startGame();
