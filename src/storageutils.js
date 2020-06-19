export function storeScore(score) {
  var highscores = retrieveData()

  highscores.push(score)
  highscores.sort((a, b) => a-b)
  highscores.reverse()
  highscores = highscores.slice(0, 5)
  localStorage.setItem("highscores", JSON.stringify(highscores))
}

export function retrieveData() {
  var highscores = localStorage.getItem("highscores")

  if (highscores != null) {
    highscores = Array.from(JSON.parse(localStorage.getItem("highscores"))).map((item) => parseInt(item)).sort((a, b) => a - b).reverse()
  } else {
    highscores = []
  }

  return highscores
}