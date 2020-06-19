var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

//Ship constants
const SHIP_SIZE = 30
const TURN_SPEED = 360
const THROTTLE_SPEED = 5
const FRICTION = .7

//Asteroid Constants
const ASTEROID_NUM = 3
const ASTEROID_SIZE = 100
const ASTEROID_SPEED = 50
const ASTEROID_VERTICES = 10
const ASTEROID_JAG = .4


var ship = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: SHIP_SIZE / 2,
  angle: 90 / 180 * Math.PI,
  rotation: 0,
  throttling: false,
  throttle: {
    x: 0,
    y: 0
  }
}

// asteroids
var asteroids = []
createAsteroidBelt()

function createAsteroidBelt() {
  asteroids = []

  var x, y
  for (let i = 0; i < ASTEROID_NUM; i++) {
    do{
      x = Math.floor(Math.random() * canvas.width)
      y = Math.floor(Math.random() * canvas.height)
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2 + ship.radius);
    
    asteroids.push(newAsteroid(x, y))
  }
}

function distBetweenPoints(x1, y1, x2, y2){
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

function newAsteroid(x, y) {
  var asteroid = {
    x: x,
    y: y,
    xv: Math.random() * ASTEROID_SPEED / 60 * (Math.random() < .5 ? 1 : -1),
    yv: Math.random() * ASTEROID_SPEED / 60 * (Math.random() < .5 ? 1 : -1),
    radius: ASTEROID_SIZE / 2,
    angle: Math.random() * Math.PI * 2,
    vertices: Math.floor(Math.random() * (ASTEROID_VERTICES + 1) + ASTEROID_VERTICES / 2),
    offsets: []
  }

  for(var i = 0; i < asteroid.vertices; i++){
    asteroid.offsets.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG)
  }

  return asteroid
}

//event handlers

document.addEventListener("keydown", (e) => {
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
  }
})

document.addEventListener("keyup", (e) => {
  switch (e.keyCode) {
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
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)


  //throttle

  if (ship.throttling) {
    ship.throttle.x += THROTTLE_SPEED * Math.cos(ship.angle) / 60
    ship.throttle.y -= THROTTLE_SPEED * Math.sin(ship.angle) / 60

    //draw thruster
    ctx.fillStyle = "#9dc8dd"
    ctx.strokeStyle = "#006685"
    ctx.lineWidth = SHIP_SIZE / 10
    ctx.beginPath()

    ctx.moveTo(// rear left
      ship.x - ship.radius * ((2 / 3) * Math.cos(ship.angle) + .5 * Math.sin(ship.angle)),
      ship.y + ship.radius * ((2 / 3) * Math.sin(ship.angle) - .5 * Math.cos(ship.angle))
    );

    ctx.lineTo( // rear center behind
      ship.x - ship.radius * ((8 / 3) * Math.cos(ship.angle)),
      ship.y + ship.radius * ((8 / 3) * Math.sin(ship.angle))
    );

    ctx.lineTo( // rear right
      ship.x - ship.radius * ((2 / 3) * Math.cos(ship.angle) - .5 * Math.sin(ship.angle)),
      ship.y + ship.radius * ((2 / 3) * Math.sin(ship.angle) + .5 * Math.cos(ship.angle))
    );
    ctx.fill();
    ctx.closePath()
    ctx.stroke()

  } else {
    ship.throttle.x -= FRICTION * ship.throttle.x / 60
    ship.throttle.y -= FRICTION * ship.throttle.y / 60
  }

  //draw ship
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = SHIP_SIZE / 20
  ctx.beginPath()

  ctx.moveTo( //nose
    ship.x + (4 / 3) * ship.radius * Math.cos(ship.angle),
    ship.y - (4 / 3) * ship.radius * Math.sin(ship.angle)
  );

  ctx.lineTo( // rear left
    ship.x - ship.radius * ((2 / 3) * Math.cos(ship.angle) + Math.sin(ship.angle)),
    ship.y + ship.radius * ((2 / 3) * Math.sin(ship.angle) - Math.cos(ship.angle))
  );

  ctx.lineTo( // rear right
    ship.x - ship.radius * ((2 / 3) * Math.cos(ship.angle) - Math.sin(ship.angle)),
    ship.y + ship.radius * ((2 / 3) * Math.sin(ship.angle) + Math.cos(ship.angle))
  );

  ctx.closePath()
  ctx.stroke()

  ctx.strokeStyle = "slategrey";
  ctx.lineWidth = SHIP_SIZE / 20;
  var a, r, x, y, vert, offset;
  for (var i = 0; i < asteroids.length; i++) {

    // get the asteroid properties
    a = asteroids[i].angle
    r = asteroids[i].radius
    x = asteroids[i].x
    y = asteroids[i].y
    offsets = asteroids[i].offsets
    
    vert = asteroids[i].vertices

    // draw the path
    ctx.beginPath()
    ctx.moveTo(
      x + r * offsets[0] * Math.cos(a),
      y + r * offsets[0] * Math.sin(a)
    )

    // draw the polygon
    for (var j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offsets[j] * Math.cos(a + j * Math.PI * 2 / vert),
        y + r * offsets[j] * Math.sin(a + j * Math.PI * 2 / vert)
      );
    }
    ctx.closePath()
    ctx.stroke()

    //moove asteroid
    asteroids[i].x += asteroids[i].xv
    asteroids[i].y += asteroids[i].yv

    //off the screen

    if(asteroids[i].x < 0 - asteroids[i].radius){
      asteroids[i].x = canvas.width + asteroids[i].radius
    } else if(asteroids[i].x > canvas.width + asteroids[i].radius){
      asteroids[i].x = 0 - asteroids[i].radius
    }

    if(asteroids[i].y < 0 - asteroids[i].radius){
      asteroids[i].y = canvas.height + asteroids[i].radius
    } else if(asteroids[i].x > canvas.height + asteroids[i].radius){
      asteroids[i].y = 0 - asteroids[i].radius
    }
  }

  //center of ship
  ctx.fillStyle = "white"
  ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2)

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

  window.requestAnimationFrame(draw)
}

draw();