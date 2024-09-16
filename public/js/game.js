const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-btns')

let gameHistory = [];
let inventory = {}
let character = {
  stats: [
    {

    }
  ],
  looks: [
    {

    }
  ]
}

function startGame() {
  inventory = {}
  character = {
    stats: [
      {

      }
    ],
    looks: [
      {
        id: "skin",
        color: "grey",
      }
    ]
  }
  gameHistory = [];  // Reset the history when the game starts
  gameHistory.push({
    character: JSON.parse(JSON.stringify(character)),
    inventory: JSON.parse(JSON.stringify(inventory)),
    currentTextNodeId: 1  // Save the initial state
  });
  showTextNode(1)
}

function showTextNode(index) {
  const textNode = textNodes.find(textNode => textNode.id === index);
  textElement.innerText = textNode.text;

  // Clear previous options
  while (optionButtonsElement.firstChild) {
    optionButtonsElement.removeChild(optionButtonsElement.firstChild);
  }

  // Loop through options and create buttons
  textNode.options.forEach(option => {
    if (showOption(option)) {
      const button = document.createElement('button');
      button.classList.add('btn');
      button.classList.add('option-btns');

      // Check if the option has a color property
      if (option.color) {
        // Create a color swatch
        const colorSwatch = document.createElement('div');
        colorSwatch.style.width = "10px";
        colorSwatch.style.height = "10px";
        colorSwatch.style.backgroundColor = option.color;
        colorSwatch.style.display = "inline-block";
        colorSwatch.style.marginRight = "10px";
        colorSwatch.style.border = "1px solid black";  // Optional: to make the swatch more visible

        // Add color swatch before the button text
        button.appendChild(colorSwatch);
      }

      // Add the text after the swatch (if no color, just text)
      const textNode = document.createTextNode(option.text);
      button.appendChild(textNode);

      // Add click event for selecting the option
      button.addEventListener('click', () => selectOption(option));

      // Append the button to the options container
      optionButtonsElement.appendChild(button);
    }
  });
}



function showOption(option) {
  if (option.requiredItem == null || option.requiredItem(inventory)) {
    return option.requiredStat == null || option.requiredStat(stats)
  }
}


function selectOption(option) {
  if (option.isGoBack) {
    goBack();  // If it's a "go back" option, handle it
    return;
  }

  // Save the current state before selecting the next option
  gameHistory.push({
    character: JSON.parse(JSON.stringify(character)),
    inventory: JSON.parse(JSON.stringify(inventory)),
    currentTextNodeId: option.nextText
  });

  const nextTextNodeId = option.nextText;

  if (option.setStats) {
    character.stats = Object.assign({}, character.stats, option.setStats);
  }

  if (option.addItem) {
    inventory = Object.assign({}, inventory, option.addItem);
  }

  if (option.setLooks) {
    const lookIndex = character.looks.findIndex(look => look.id === option.setLooks.id);
    if (lookIndex > -1) {
      character.looks[lookIndex].color = option.setLooks.color;
    } else {
      character.looks.push({ id: option.setLooks.id, color: option.setLooks.color });
    }
  }

  showTextNode(nextTextNodeId);
}



function goBack() {
  if (gameHistory.length > 1) {
    // Remove the current state (which is already displayed) from history
    gameHistory.pop();

    // Get the previous state
    const previousState = gameHistory[gameHistory.length - 1];  // Peek the previous state

    // Restore the previous state
    character = JSON.parse(JSON.stringify(previousState.character));
    inventory = JSON.parse(JSON.stringify(previousState.inventory));

    // Show the previous text node
    showTextNode(previousState.currentTextNodeId);
  }
}


const textNodes = [
  {
    id: -1,
    text: "You look into your mirror and see...",
    options: [
      {
        text: "Pale skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#EFE9DA"
      },
      {
        text: "Light skin",
        nextText: -3,
        setLooks: { id: "skin", color: "Tan" },
        color: "#DAB78D"
      },
      {
        text: "Tan skin",
        nextText: -3,
        setLooks: { id: "skin", color: "Tan" },
        color: "#C48850"
      },
      {
        text: "Dark Tan skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#9c682f"
      },
      {
        text: "Dark skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#653519"
      },
      {
        text: "Deep skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#231103"
      },
      {
        text: "More",
        nextText: -2,

      },
      {
        text: "back...",
        nextText: null,
        isGoBack: true
      }

    ]
  },
  {
    id: -2,
    text: "You look into the mirror and see..",
    options: [
      {
        text: "Green skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#4f964d"
      },
      {
        text: "Blue skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#3c6498"
      },
      {
        text: "Purple skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#744DA8"
      },
      {
        text: "Red skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#8c2c2c"
      },
      {
        text: "Pink skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#d495c4"
      },
      {
        text: "Orange skin",
        nextText: -3,
        setLooks: { id: "skin", color: "pale" },
        color: "#e29630"
      },
      {
        text: "back...",
        nextText: null,
        isGoBack: true
      }
    ]
  },
  {
    id: -3,
    text: "You look into the mirror and see..",
    options: [
      {
        text: "hairstyles to be added",
        nextText: -3
      },
      {
        text: "back...",
        nextText: null,
        isGoBack: true
      }
    ]
  },
  {
    id: 1,
    text: "Our story starts on an average day.",
    options: [
      {
        text: "Step into your first day of life.",
        nextText: 2
      }
    ]
  },
  {
    id: 2,
    text: "wait a minute, do you know who you are?",
    options: [
      {
        text: "Yes! I know exactly who I am!",
        //going to add all the character customization options later
      },
      {
        text: "No... I should take a look in the mirror.",
        nextText: -1
      }
    ]
  }
]

startGame();