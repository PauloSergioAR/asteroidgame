import { retrieveData, storeScore } from './src/storageutils.js'
import { drawShip, drawThruster, drawAsteroid, drawLaser } from './src/drawer.js'

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

//Ship constants
const SHIP_SIZE = 30
const TURN_SPEED = 360
const THROTTLE_SPEED = 5
const FRICTION = .7
const SHIP_EXPLODE_DUR = .3
const SHIP_INV = 3
const SHIP_BLINK = .1
const LASER_MAX = 10
const LASER_SPEED = 500
const LASER_DIST = .6
const LASER_EXPLODE_DUR = .1
const GAME_LIVES = 3

//Asteroid Constants
const ASTEROID_NUM = 1
const ASTEROID_SIZE = 100
const ASTEROID_SPEED = 50
const ASTEROID_VERTICES = 10
const ASTEROID_JAG = .4

//colision detection
const SHOW_BOUNDING = false

//Text constants
const TEXT_FADE_TIME = 2.5
const TEXT_SIZE = 40

// score constants
const LGE_ASTEROID = 20
const MED_ASTEROID = 50
const SML_ASTEROID = 100

var level, lives, asteroids, ship, text, textAlpha, score, scoreHigh, started

started = false

var highscores

let overlay = document.getElementById('overlay')
let startButton = document.getElementById("start_btn")

startButton.addEventListener('click', () => {
  started = true
  overlay.style.display = 'none'
})


newGame()

function updateScore() {
  highscores = retrieveData()
}

//Asteroid methods
function createAsteroidBelt() {
  asteroids = []

  var x, y
  for (let i = 0; i < ASTEROID_NUM + level; i++) {
    do {
      x = Math.floor(Math.random() * canvas.width)
      y = Math.floor(Math.random() * canvas.height)
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.radius);

    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 2)))
  }
}

function destroyAsteroid(i) {
  var x = asteroids[i].x
  var y = asteroids[i].y
  var r = asteroids[i].radius

  if (r == Math.ceil(ASTEROID_SIZE / 2)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)))
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 4)))
    score += LGE_ASTEROID
  } else if (r == Math.ceil(ASTEROID_SIZE / 4)) {
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)))
    asteroids.push(newAsteroid(x, y, Math.ceil(ASTEROID_SIZE / 8)))
    score += MED_ASTEROID
  } else {
    score += SML_ASTEROID
  }

  if (score > scoreHigh) {
    scoreHigh = score
  }

  asteroids.splice(i, 1)

  if (asteroids.length == 0) {
    level++
    newLevel()
  }
}

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function newAsteroid(x, y, r) {
  var lvlMult = 1 + .1 * level
  var asteroid = {
    x: x,
    y: y,
    xv: Math.random() * ASTEROID_SPEED * lvlMult / 60 * (Math.random() < .5 ? 1 : -1),
    yv: Math.random() * ASTEROID_SPEED * lvlMult / 60 * (Math.random() < .5 ? 1 : -1),
    radius: r,
    angle: Math.random() * Math.PI * 2,
    vertices: Math.floor(Math.random() * (ASTEROID_VERTICES + 1) + ASTEROID_VERTICES / 2),
    offsets: []
  }

  for (var i = 0; i < asteroid.vertices; i++) {
    asteroid.offsets.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG)
  }

  return asteroid
}

//ship functions
function killShip() {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * 60)
}

function newShip() {
  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: SHIP_SIZE / 2,
    angle: 90 / 180 * Math.PI,
    rotation: 0,
    explodeTime: 0,
    canShoot: true,
    dead: false,
    lasers: [],
    blinkNumber: Math.ceil(SHIP_INV / SHIP_BLINK),
    blinkTime: Math.ceil(SHIP_BLINK * 60),
    throttling: false,
    throttle: {
      x: 0,
      y: 0
    }
  }
}

function shootLaser() {
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      x: ship.x + (4 / 3) * ship.radius * Math.cos(ship.angle),
      y: ship.y - (4 / 3) * ship.radius * Math.sin(ship.angle),
      xv: LASER_SPEED * Math.cos(ship.angle) / 60,
      yv: -LASER_SPEED * Math.sin(ship.angle) / 60,
      dist: 0,
      explodeTime: 0
    })
  }

  ship.canShoot = false
}

function gameOver() {
  storeScore(score)

  ship.dead = true
  text = "Game Over"
  textAlpha = 1.0
}

function newGame() {
  updateScore()
  scoreHigh = highscores[0] ? highscores[0] : 0
  score = 0
  lives = GAME_LIVES
  level = 0;
  ship = newShip()
  newLevel()
}

function newLevel() {
  text = "Level " + (level + 1)
  textAlpha = 1.0
  createAsteroidBelt();
}

//event handlers
document.addEventListener("keydown", (e) => {
  if (ship.dead || !started)
    return

  switch (e.keyCode) {
    case 37: //rotate left
      ship.rotation = TURN_SPEED / 180 * Math.PI / 60
      break
    case 38: //throttle
      ship.throttling = true
      break
    case 39: //rotate right
      ship.rotation = -(TURN_SPEED / 180 * Math.PI / 60)
      break
    case 32: //shoot
      shootLaser()
      break
    case 27: //exit
      storeScore(score)
      newGame()
      started = false
      overlay.style.display = 'flex'
      break;
  }
})

document.addEventListener("keyup", (e) => {
  if (ship.dead)
    return

  switch (e.keyCode) {
    case 32: //shoot
      ship.canShoot = true
      break
    case 37: //stop rotate left
      ship.rotation = 0
      break
    case 38: //stop throttle
      ship.throttling = false
      break
    case 39: //stop rotate right
      ship.rotation = 0
      break
  }
})

function draw() {
  var blinkOn = ship.blinkNumber % 2 == 0
  var exploding = ship.explodeTime > 0

  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  //throttle

  if (ship.throttling && !ship.dead) {
    ship.throttle.x += THROTTLE_SPEED * Math.cos(ship.angle) / 60
    ship.throttle.y -= THROTTLE_SPEED * Math.sin(ship.angle) / 60

    if (!exploding && blinkOn) {
      //draw thruster
      drawThruster(ship.x, ship.y, ship.angle, ship.radius, ctx)
    }

  } else {
    ship.throttle.x -= FRICTION * ship.throttle.x / 60
    ship.throttle.y -= FRICTION * ship.throttle.y / 60
  }

  //draw ship
  if (!exploding) {

    if (blinkOn && !ship.dead) {
      drawShip(ship.x, ship.y, ship.angle, ship.radius, ctx)
    }

    if (ship.blinkNumber > 0) {
      ship.blinkTime--

      if (ship.blinkTime == 0) {
        ship.blinkTime = Math.ceil(SHIP_BLINK * 60)
        ship.blinkNumber--
      }
    }

  } else {
    //explode
    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.radius * 1.5, 0, Math.PI * 2, false)
    ctx.fill()

    ctx.fillStyle = "orange"
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.radius * 0.9, 0, Math.PI * 2, false)
    ctx.fill()

    ctx.fillStyle = "yellow"
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.radius * 0.6, 0, Math.PI * 2, false)
    ctx.fill()

    ctx.fillStyle = "orange"
    ctx.beginPath()
    ctx.arc(ship.x, ship.y, ship.radius * 1.5, 0, Math.PI * 2, false)
    ctx.stroke()

  }

  //draw asteroids
  for (var i = 0; i < asteroids.length; i++) {

    drawAsteroid(
      asteroids[i].x,
      asteroids[i].y,
      asteroids[i].radius,
      asteroids[i].angle,
      asteroids[i].vertices,
      asteroids[i].offsets,
      ctx)
  }

  //draw lasers
  for (var i = 0; i < ship.lasers.length; i++) {
    var laser = ship.lasers[i]

    drawLaser(laser.x, laser.y, ship.radius, !(ship.lasers[i].explodeTime == 0), ctx)
  }

  //detect laser hit
  var ax, ay, ar, lx, ly

  for (var i = asteroids.length - 1; i >= 0; i--) {
    ax = asteroids[i].x
    ay = asteroids[i].y
    ar = asteroids[i].radius

    for (var j = ship.lasers.length - 1; j >= 0; j--) {
      lx = ship.lasers[j].x
      ly = ship.lasers[j].y

      if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {
        ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * 60)
        destroyAsteroid(i)
        break
      }
    }
  }

  if (!exploding) {
    //move
    ship.x += ship.throttle.x
    ship.y += ship.throttle.y

    //rotate ship
    ship.angle += ship.rotation

    //handle edge of screen
    if (ship.x < 0 - ship.radius) {
      ship.x = canvas.width + ship.radius
    } else if (ship.x > canvas.width + ship.radius) {
      ship.x = 0 + ship.radius
    }

    if (ship.y < 0 - ship.radius) {
      ship.y = canvas.height + ship.radius
    } else if (ship.y > canvas.height + ship.radius) {
      ship.y = 0 + ship.radius
    }

    //move lasers
    for (var i = ship.lasers.length - 1; i >= 0; i--) {
      if (ship.lasers[i].dist > LASER_DIST * canvas.width) {
        ship.lasers.splice(i, 1)
        continue
      }

      if (ship.lasers[i].explodeTime > 0) {
        ship.lasers[i].explodeTime--

        if (ship.lasers[i].explodeTime == 0) {
          ship.lasers.splice(i, 1)
          continue
        }
      }

      else {
        ship.lasers[i].x += ship.lasers[i].xv
        ship.lasers[i].y += ship.lasers[i].yv

        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2))

        //edge
        if (ship.lasers[i].x < 0) {
          ship.lasers[i].x = canvas.width
        } else if (ship.lasers[i].x > canvas.width) {
          ship.lasers[i].x = 0
        }

        if (ship.lasers[i].y < 0) {
          ship.lasers[i].y = canvas.height
        } else if (ship.lasers[i].y > canvas.height) {
          ship.lasers[i].y = 0
        }
      }
    }

    //handle colisions
    if (ship.blinkNumber == 0 && !ship.dead && started) {
      for (var i = 0; i < asteroids.length; i++) {
        if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.radius + asteroids[i].radius) {
          killShip()
          destroyAsteroid(i)
          break
        }
      }
    }

  } else {
    ship.explodeTime--

    if (ship.explodeTime == 0) {
      lives--
      if (lives == 0) {
        gameOver()
      } else {
        ship = newShip()
      }
    }
  }

  for (var i = 0; i < asteroids.length; i++) {
    //move asteroid
    asteroids[i].x += asteroids[i].xv
    asteroids[i].y += asteroids[i].yv

    //handle edge
    if (asteroids[i].x < 0 - asteroids[i].radius) {
      asteroids[i].x = canvas.width + asteroids[i].radius;
    } else if (asteroids[i].x > canvas.width + asteroids[i].radius) {
      asteroids[i].x = 0 - asteroids[i].radius
    }
    if (asteroids[i].y < 0 - asteroids[i].radius) {
      asteroids[i].y = canvas.height + asteroids[i].radius;
    } else if (asteroids[i].y > canvas.height + asteroids[i].radius) {
      asteroids[i].y = 0 - asteroids[i].radius
    }
  }

  //Draw Text
  if (textAlpha >= 0) {
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "rgba(255,255,255," + textAlpha + ")"
    ctx.font = "small-caps " + TEXT_SIZE + "px dejavu sans mono"
    ctx.fillText(text, canvas.width / 2, canvas.height * .75)
    textAlpha -= (1.0 / TEXT_FADE_TIME / 60)
  } else if (ship.dead) {
    newGame()
  }

  //Draw Lives
  if (started) {
    var lifeColour
    for (var i = 0; i < lives; i++) {
      lifeColour = exploding && i == lives - 1 ? "red" : "green"
      drawShip(SHIP_SIZE + i * SHIP_SIZE * 1.2, SHIP_SIZE, .5 * Math.PI, ship.radius, ctx, lifeColour)
    }


    //draw score
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white"
    ctx.font = TEXT_SIZE + "px dejavu sans mono"
    ctx.fillText(score, canvas.width - SHIP_SIZE / 2, SHIP_SIZE)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "yellow"
    ctx.font = (TEXT_SIZE * .75) + "px dejavu sans mono"
    ctx.fillText("Best: " + scoreHigh, canvas.width / 2, SHIP_SIZE)
  }

  window.requestAnimationFrame(draw)
}

draw();