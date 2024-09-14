const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-btns')

let stats = {}
let inventory = {}
let character = {}

function startGame(){
  stats = {}
  inventory = {}
  character = {}
  showTextNode(1)
}

function showTextNode(index){
  const textNode = textNodes.find(textNode => textNode.id === index)
  textElement.innerText = textNode.text
  while (optionButtonsElement.firstChild){
    optionButtonsElement.removeChild(optionButtonsElement.firstChild)
  }

  textNode.options.forEach(option => {if (showOption(option)){
    const button = document.createElement('button')
    button.innerText = option.text
    button.classList.add('btn')
    button.classList.add('option-btns')
    button.addEventListener('click', () => selectOption(option))
    optionButtonsElement.appendChild(button)
  }
})
}

function showOption(option){
  if (option.requiredItem == null || option.requiredItem(inventory)){
    return option.requiredStat == null || option.requiredStat(stats)
  }
}

function selectOption(option){
  const nextTextNodeId = option.nextText
  if (option.setStats) {
    stats = Object.assign({}, stats, option.setStats);
  }
  if (option.addItem) {
    inventory = Object.assign({}, inventory, option.addItem);
  }
  showTextNode(nextTextNodeId)
}

const textNodes = [
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
        text: "No... I should take a look in the mirror."
        //would trigger character customization options
      }
    ]
  }
]

startGame();