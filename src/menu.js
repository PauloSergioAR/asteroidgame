import { retrieveData } from './storageutils.js'

let rankingButton = document.getElementById("ranking_btn")
let startButton = document.getElementById("start_btn")
let backButton = document.getElementById("back_btn")
let tutorialbutton = document.getElementById('tutorial_btn')
let list = document.getElementById('ranking')
let tutorial = document.getElementById('tutorial')

rankingButton.addEventListener('click', () => {
  list.innerHTML = ''
  rankingButton.style.display = "none"
  startButton.style.display = "none"
  tutorialbutton.style.display = "none"
  backButton.style.display = "block"

  let highscores = retrieveData()

  if(highscores != null){
    highscores = Array.from(highscores)

    for(var i = 0; i < highscores.length; i++){
      var listItem = document.createElement('li')
      listItem.classList.add("ranking_list")

      listItem.innerHTML = (i + 1) + "º..... " + highscores[i]

      list.appendChild(listItem)
    }
    list.style.display = "block"
  }
})

tutorialbutton.addEventListener('click', () => {
  rankingButton.style.display = "none"
  startButton.style.display = "none"
  backButton.style.display = "block"
  tutorial.style.display = "block"
  tutorialbutton.style.display = "none"
})

backButton.addEventListener('click', () => {
  rankingButton.style.display = "block"
  startButton.style.display = "block"
  tutorialbutton.style.display = "block"
  backButton.style.display = "none"
  list.style.display = "none"
  tutorial.style.display = "none"
})