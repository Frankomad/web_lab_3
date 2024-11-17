const configPanel = document.getElementById("configPanel")
const startGameButton = document.getElementById("startGameButton")
const ballSpeedInput = document.getElementById("ballSpeed")
const brickRowsInput = document.getElementById("brickRows")
const paddleWidthInput = document.getElementById("paddleWidth")
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let userBallSpeed = 1
let userBrickRows = 5
let paddleSpeed = 10
let paddleWidth = 150

let score = 0
let highScore = localStorage.getItem("highScore") || 0
let bricks = []
let ball = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  dx: getRandomDirection(),
  dy: -userBallSpeed,
}
let paddle = { x: canvas.width / 2 - paddleWidth / 2, y: canvas.height - 30 }
let gameOver = false
let gameWon = false

const BALL_RADIUS = 10
const PADDLE_HEIGHT = 20
const BRICK_WIDTH = 100
const BRICK_HEIGHT = 30
const BRICK_COLS = Math.floor(canvas.width / BRICK_WIDTH) - 1

function createBricks() {
  bricks = []
  for (let row = 0; row < userBrickRows; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricks.push({
        x: col * BRICK_WIDTH,
        y: row * BRICK_HEIGHT,
        isHit: false,
      })
    }
  }
}

function resetGame() {
  gameOver = false
  gameWon = false
  score = 0
  ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    dx: getRandomDirection(),
    dy: -userBallSpeed,
  }
  paddle.x = canvas.width / 2 - paddleWidth / 2
  createBricks()
  draw()
}

function getRandomDirection() {
  return Math.random() < 0.5 ? -userBallSpeed : userBallSpeed
}

function startGame() {
  userBallSpeed = Math.min(Math.max(parseInt(ballSpeedInput.value), 1), 3)
  userBrickRows = Math.min(Math.max(parseInt(brickRowsInput.value), 3), 10)
  paddleWidth = Math.min(Math.max(parseInt(paddleWidthInput.value), 50), 300)
  ball.dx = getRandomDirection()
  ball.dy = -userBallSpeed
  paddleSpeed = 10 + userBallSpeed * 5
  configPanel.style.display = "none"
  canvas.style.display = "block"
  resetGame()
}

function draw() {
  if (gameOver || gameWon) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "40px Arial"
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    if (gameOver) {
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20)
    } else if (gameWon) {
      ctx.fillText("YOU WON!", canvas.width / 2, canvas.height / 2 - 20)
    }
    ctx.font = "20px Arial"
    ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 20)
    ctx.fillText(
      "Press S for Settings",
      canvas.width / 2,
      canvas.height / 2 + 50
    )
    return
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBall()
  drawPaddle()
  drawBricks()
  drawScore()
  moveBall()
  detectBrickCollision()
  requestAnimationFrame(draw)
}

function drawBall() {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = "#FFF"
  ctx.fill()
  ctx.closePath()
}

function drawPaddle() {
  ctx.fillStyle = "red"
  ctx.fillRect(paddle.x, paddle.y, paddleWidth, PADDLE_HEIGHT)
}

function drawBricks() {
  bricks.forEach((brick) => {
    if (!brick.isHit) {
      ctx.fillStyle = "blue"
      ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
      ctx.strokeStyle = "white"
      ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
    }
  })
}

function drawScore() {
  ctx.font = "20px Arial"
  ctx.fillStyle = "#FFF"
  ctx.textAlign = "right"
  ctx.fillText(
    `Score: ${score} | High Score: ${highScore}`,
    canvas.width - 10,
    20
  )
}

function moveBall() {
  const speedMultiplier = 1.8 // Adjust this value to control how much faster the ball gets

  ball.x += ball.dx * speedMultiplier
  ball.y += ball.dy * speedMultiplier

  if (ball.x + BALL_RADIUS > canvas.width) {
    ball.x = canvas.width - BALL_RADIUS
    ball.dx *= -1
  }

  if (ball.x - BALL_RADIUS < 0) {
    ball.x = BALL_RADIUS
    ball.dx *= -1
  }

  if (ball.y - BALL_RADIUS < 0) {
    ball.y = BALL_RADIUS
    ball.dy *= -1
  }

  if (
    ball.y + BALL_RADIUS >= paddle.y &&
    ball.y + BALL_RADIUS <= paddle.y + PADDLE_HEIGHT &&
    ball.x >= paddle.x &&
    ball.x <= paddle.x + paddleWidth
  ) {
    ball.dy = -Math.abs(ball.dy)
    const hitPosition =
      (ball.x - (paddle.x + paddleWidth / 2)) / (paddleWidth / 2)
    ball.dx = hitPosition * userBallSpeed
  }

  if (ball.y - BALL_RADIUS > canvas.height) {
    gameOver = true
    localStorage.setItem("highScore", Math.max(highScore, score))
  }
}

function detectBrickCollision() {
  for (let brick of bricks) {
    if (!brick.isHit) {
      if (
        ball.x + BALL_RADIUS > brick.x &&
        ball.x - BALL_RADIUS < brick.x + BRICK_WIDTH &&
        ball.y + BALL_RADIUS > brick.y &&
        ball.y - BALL_RADIUS < brick.y + BRICK_HEIGHT
      ) {
        const overlapTop = Math.abs(ball.y + BALL_RADIUS - brick.y)
        const overlapBottom = Math.abs(
          ball.y - BALL_RADIUS - (brick.y + BRICK_HEIGHT)
        )
        const overlapLeft = Math.abs(ball.x + BALL_RADIUS - brick.x)
        const overlapRight = Math.abs(
          ball.x - BALL_RADIUS - (brick.x + BRICK_WIDTH)
        )
        const minOverlap = Math.min(
          overlapTop,
          overlapBottom,
          overlapLeft,
          overlapRight
        )
        if (minOverlap === overlapTop) {
          ball.dy = -Math.abs(ball.dy)
        } else if (minOverlap === overlapBottom) {
          ball.dy = Math.abs(ball.dy)
        } else if (minOverlap === overlapLeft) {
          ball.dx = -Math.abs(ball.dx)
        } else if (minOverlap === overlapRight) {
          ball.dx = Math.abs(ball.dx)
        }
        brick.isHit = true
        score++
        break
      }
    }
  }
  if (bricks.every((b) => b.isHit)) {
    gameWon = true
    localStorage.setItem("highScore", Math.max(highScore, score))
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddle.x > 0) {
    paddle.x = Math.max(paddle.x - paddleSpeed, 0)
  }
  if (e.key === "ArrowRight" && paddle.x + paddleWidth < canvas.width) {
    paddle.x = Math.min(paddle.x + paddleSpeed, canvas.width - paddleWidth)
  }
})

document.addEventListener("keydown", (e) => {
  if ((gameOver || gameWon) && e.key.toLowerCase() === "r") {
    resetGame()
  }
  if ((gameOver || gameWon) && e.key.toLowerCase() === "s") {
    configPanel.style.display = "block"
    canvas.style.display = "none"
    gameOver = false
    gameWon = false
  }
})

startGameButton.addEventListener("click", startGame)
