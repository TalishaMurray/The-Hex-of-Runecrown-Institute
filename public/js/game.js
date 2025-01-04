const textElement = document.getElementById('text');
const optionButtonsElement = document.getElementById('option-btns');
const canvas = document.getElementById('characterCanvas');
const ctx = canvas.getContext('2d');


let gameHistory = [];
let inventory = {};
let character = {};
let locations = {};
let day = 1;
let hours = 6;
let minutes = 0;
let timeOfDay = 'morning';
let dollar = 10;
let cents = 0;



// Game choice functions

function startGame() {
  inventory = {};
  character = {
    base: "masc",
    stats: [
      {id: 'strength', level: 1},
      {id: 'dexterity', level: 1},
      {id: 'wisdom', level: 1},
      {id: 'charisma', level: 1},
      {id: 'stamina', level: 100}
    ],
    looks: [
      { id: "skin", },  
      { id: "hair", },  
      { id: "eyes", }   
    ]
  };
  locations ={
    Quad: {
      desc: "The main center of campus, you can get to nearly any location on campus from here.",
      connectedloc: ["Dorms","Nurse","Classes","Library","Greenhouse","StationZero"],
      events:[]
    },
    Dorms: {
      desc: `The dorm building from the outside looks like a small wooden building that's 
      barely being held together by a single rusty nail and hopes and dreams, the inside is somehow far larger and nicer.`,
      connectedloc: ["Nurse","Quad","Room"],
      events:[]
    },
    Room: {
      MazeEnterance: {
        desc: "",
        connectedloc: [],
        events:[]
      },
    },
    Nurse: {
      desc: " There's a row of twin XL beds that line either side of the room with curtain separators. The main doctor can usually be found sleeping or drinking tea in the back corner on a cushioned chair.",
      connectedloc: [],
      events:[]
    },
    Library: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    Classes: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    Greenhouse: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    Finnigans: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    StationZero: {desc: "",
      connectedloc: [],
      events:[]
    },
    TheMaw: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    MullersLake: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    TheMines: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    MazeEnterance: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    Maze: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    MazeCenter: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    ThicketEnterance: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    Thicket: {
      desc: "",
      connectedloc: [],
      events:[]
    },
    ThicketClearing: {
      desc: "",
      connectedloc: [],
      events:[]
    },

  }

  gameHistory = [];
  gameHistory.push({
    character: JSON.parse(JSON.stringify(character)),
    inventory: JSON.parse(JSON.stringify(inventory)),
    currentTextNodeId: 1  // Save the initial state
  });
  displayMoney();
  displayTime();
  drawCharacter();
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
      
        // Create regular buttons
        const button = document.createElement('button');
        button.classList.add('btn', 'option-btns');
        button.innerText = option.text;
        button.addEventListener('click', () => selectOption(option));
        optionButtonsElement.appendChild(button);
      
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
  if (option.setHours || option.setMinute){
    advanceTime(option.setHours, option.setMinute);
  }
  if(option.setStamina){
    exhuastCharacter(option.setStamina);
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
function displayTime() {
  const timeDisplay = document.getElementById('timeDisplay');
  timeDisplay.innerText = `Day ${day}, ${timeOfDay} (${hours}:${minutes.toString().padStart(2, '0')})`;
}
function displayMoney(){
  const moneyDisplay = document.getElementById('moneyDisplay');
  moneyDisplay.innerText = `$${dollar}.${cents.toString().padStart(2, '0')}`
}
function addMoney(dollarsAdded, centsAdded){
  dollars += dollarsAdded;
  cents += centsAdded;
  if(cents > 100){
    dollar += 1;
    cents = cents % 100;
  }
}
function advanceTime(hoursPassed, minutesPassed) {
  hours += hoursPassed;
  minutes += minutesPassed;

  // Update the time of day based on hours
  if (hours >= 6 && hours < 12) {
    timeOfDay = 'morning';
  } else if (hours >= 12 && hours < 18) {
    timeOfDay = 'afternoon';
  } else if (hours >= 18 && hours < 24) {
    timeOfDay = 'night';
  } else {
    // If 24 hours have passed, it's a new day
    day++;
    hours = hours % 24; // Reset hours after 24
    timeOfDay = 'morning';
  }
  if (minutes > 60){
    if (minutes % 60 > 0){
      minutes = minutes % 60;
    }else{
      minutes = 0;
    }
  }

  displayTime(); // Show updated time
}

function exhuastCharacter(drain){
  character.stats[4].level -= drain;
  //still implement an exhaustion message and force rest
}


// Toggle function for dropdown
function toggleDropdown(id) {
  const content = document.getElementById(id);
  if (content.classList.contains('hidden')) {
    // Measure the full height of the content when it's not hidden
    content.style.maxHeight = content.scrollHeight + "px";
  } else {
    // Set max-height to 0 to trigger the closing transition
    content.style.maxHeight = "0px";
  }
  content.classList.toggle('hidden');
}






// Canvas drawing functions
// I have decided to go back to a different method for the time being
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

   const skinColor = character.looks.find(look => look.id === 'skin').color;
  } catch (err) {
    console.error('Error loading images:', err);
  }
}


function updateCharacterBase(baseType) {
  character.base = baseType;
  drawCharacter();
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
      // will fill this back in with skin color options
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
    text: ` You're about to start your first day at a pristigious university. Although almost no information is known as to 
    the public about this school it's nearly impossible to be accepted, people even theorize that there's some sort of secret
    requirement for acceptance.`,
    options: [
      { text: "Next", nextText: 2 }
    ]
  },
  {
    id: 2,
    text: ` Anxiety shakes you as you wait outside the school perimiter with the groups of other acceptees. 
    At least the school has enough forethought to provide a comfortable waiting area.
    As you look around you spot a mirror, maybe freshening up a bit would help calm your nerves?`,
    options: [
      { text: "I don't have time to worry about looks right now.", nextText: 3}, // start game with defualt character eventually
      { text: "It can't hurt to freshen up a bit", nextText: -1 }
    ]
  },
  {
    id: 3,
    text: `   Just as you look away from the mirror, a very proper-looking woman walks through the front entrance of the school.
Something about her presence draws the crowd's attention, and the previous nervous chatter comes to an abrupt halt.
    "Apologies for the wait. We're now ready to commence the welcome ceremony. Parents of students should, at this point, 
start making their way home. Students, you may follow me to begin your first day," the woman states with a flat affect, looking almost bored.
  Murmurs ripple through the crowd—some parents saying goodbye, others complaining. Either way, you were here alone to begin with.`,
    options: [
      { text: "Time to start the first day of the rest of my life.",}
    ]
  }
];

// Start the game
startGame();
