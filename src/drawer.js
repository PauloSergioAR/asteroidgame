export function drawShip(x, y, a, r, ctx, colour = "white") {
  ctx.strokeStyle = colour
  ctx.lineWidth = 30 / 20
  ctx.beginPath()

  ctx.moveTo( //nose
    x + (4 / 3) * r * Math.cos(a),
    y - (4 / 3) * r * Math.sin(a)
  );

  ctx.lineTo( // rear left
    x - r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
    y + r * ((2 / 3) * Math.sin(a) - Math.cos(a))
  );

  ctx.lineTo( // rear right
    x - r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
    y + r * ((2 / 3) * Math.sin(a) + Math.cos(a))
  );

  ctx.closePath()
  ctx.stroke()

  //center of ship
  ctx.fillStyle = "white"
  ctx.fillRect(x - 1, y - 1, 2, 2)
}

export function drawThruster(x, y, a, r, ctx){
  ctx.fillStyle = "#9dc8dd"
  console.log("Drawing")
  ctx.strokeStyle = "#006685"
  ctx.lineWidth = 30 / 10
  ctx.beginPath()

  ctx.moveTo(// rear left
    x - r * ((2 / 3) * Math.cos(a) + .5 * Math.sin(a)),
    y + r * ((2 / 3) * Math.sin(a) - .5 * Math.cos(a))
  );

  ctx.lineTo( // rear center behind
    x - r * ((8 / 3) * Math.cos(a)),
    y + r * ((8 / 3) * Math.sin(a))
  );

  ctx.lineTo( // rear right
    x - r * ((2 / 3) * Math.cos(a) - .5 * Math.sin(a)),
    y + r * ((2 / 3) * Math.sin(a) + .5 * Math.cos(a))
  );

  ctx.fill()
  ctx.closePath()
  ctx.stroke()
}

export function drawAsteroid(x, y, r, a, vert, offsets, ctx){
  ctx.strokeStyle = "slategrey";
  ctx.lineWidth = 30 / 20;

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
}

export function drawLaser(x, y, r, exploding, ctx){
  if(!exploding){
    ctx.fillStyle = "salmon"
    ctx.beginPath()
    ctx.arc(x, y, 30 / 15, 0, Math.PI * 2, false)
    ctx.fill();
  } else {
    ctx.fillStyle = "orange"
    ctx.beginPath()
    ctx.arc(x, y, r * .75, 0, Math.PI * 2, false)
    ctx.fill();

    ctx.fillStyle = "salmon"
    ctx.beginPath()
    ctx.arc(x, y, r * .50, 0, Math.PI * 2, false)
    ctx.fill();

    ctx.fillStyle = "pink"
    ctx.beginPath()
    ctx.arc(x, y, r * .25, 0, Math.PI * 2, false)
    ctx.fill();
  }
}