// Dohvaćanje elemenata iz HTML-a
const configPanel = document.getElementById("configPanel")
const startGameButton = document.getElementById("startGameButton")
const ballSpeedInput = document.getElementById("ballSpeed")
const brickRowsInput = document.getElementById("brickRows")
const paddleWidthInput = document.getElementById("paddleWidth")
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

// Postavljanje dimenzija platna
canvas.width = window.innerWidth - 10
canvas.height = window.innerHeight - 10

// Početne postavke igre
let userBallSpeed = 1
let userBrickRows = 5
let paddleSpeed = 10
let paddleWidth = 150

// Varijable za igru
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

// Konstante
const BALL_RADIUS = 10
const PADDLE_HEIGHT = 20
const BRICK_HEIGHT = 30

// Calculate BRICK_WIDTH dynamically to fit the canvas width
const BRICK_COLS = Math.floor(canvas.width / 100) // Approximate number of columns
const BRICK_WIDTH = canvas.width / BRICK_COLS // Dynamically calculate brick width

// Funkcija za generiranje cigli
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

// Resetiranje igre
function resetGame() {
  gameOver = false
  gameWon = false
  score = 0

  const angle = (Math.random() * 30 + 30) * (Math.PI / 180) // Random angle in radians
  const speed = userBallSpeed // Use the user-specified speed

  const direction = Math.random() < 0.5 ? -1 : 1 // -1 for left, 1 for right

  ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    dx: Math.cos(angle) * speed * direction, // Horizontal velocity
    dy: -Math.abs(Math.cos(angle) * speed * 2), // Vertical velocity (always upwards)
  }

  paddle.x = canvas.width / 2 - paddleWidth / 2
  createBricks()
  draw()
}

// Generira nasumični smjer za loptu (lijevo ili desno)
function getRandomDirection() {
  return Math.random() < 0.5 ? -userBallSpeed : userBallSpeed
}

// Funkcija za početak igre
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

// Glavna funkcija za crtanje igre
function draw() {
  if (gameOver || gameWon) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "40px Arial"
    ctx.fillStyle = "red"
    ctx.textAlign = "center"
    ctx.fillText(
      gameOver ? "GAME OVER" : "YOU WON!",
      canvas.width / 2,
      canvas.height / 2 - 20
    )
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

// Funkcija za crtanje lopte
function drawBall() {
  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = "#FFF"
  ctx.fill()
  ctx.closePath()
}

// Funkcija za crtanje platforme
function drawPaddle() {
  ctx.shadowColor = "rgba(255, 0, 0, 0.5)"
  ctx.shadowOffsetX = 3
  ctx.shadowOffsetY = 3
  ctx.fillStyle = "red"
  ctx.fillRect(paddle.x, paddle.y, paddleWidth, PADDLE_HEIGHT)
  ctx.strokeStyle = "#ff5722"
  ctx.lineWidth = 2
  ctx.strokeRect(paddle.x, paddle.y, paddleWidth, PADDLE_HEIGHT)
  ctx.shadowColor = "transparent"
}

// Funkcija za crtanje cigli
function drawBricks() {
  bricks.forEach((brick) => {
    if (!brick.isHit) {
      ctx.shadowColor = "rgba(255, 0, 0, 0.5)"
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
      ctx.fillStyle = "blue"
      ctx.fillRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.strokeRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT)
      ctx.shadowColor = "transparent"
    }
  })
}

// Funkcija za prikaz rezultata
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

// Pomicanje lopte
function moveBall() {
  const speed = userBallSpeed // Desired constant speed
  const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy) // Calculate current speed
  ball.dx = (ball.dx / currentSpeed) * speed // Normalize dx
  ball.dy = (ball.dy / currentSpeed) * speed // Normalize dy

  ball.x += ball.dx
  ball.y += ball.dy

  if (ball.x + BALL_RADIUS > canvas.width || ball.x - BALL_RADIUS < 0) {
    ball.dx *= -1
  }

  if (ball.y - BALL_RADIUS < 0) {
    ball.dy *= -1
  }

  if (
    ball.y + BALL_RADIUS >= paddle.y &&
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
  }
}

// Detekcija sudara s ciglama
function detectBrickCollision() {
  for (let brick of bricks) {
    if (
      !brick.isHit &&
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
      if (minOverlap === overlapTop || minOverlap === overlapBottom)
        ball.dy *= -1
      if (minOverlap === overlapLeft || minOverlap === overlapRight)
        ball.dx *= -1
      brick.isHit = true
      score++
      break
    }
  }
  if (bricks.every((b) => b.isHit)) gameWon = true
}

// Slušanje događaja za kontrole
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && paddle.x > 0)
    paddle.x = Math.max(paddle.x - paddleSpeed, 0)
  if (e.key === "ArrowRight" && paddle.x + paddleWidth < canvas.width)
    paddle.x = Math.min(paddle.x + paddleSpeed, canvas.width - paddleWidth)
})

// Kontrole za ponovno pokretanje i postavke
document.addEventListener("keydown", (e) => {
  if ((gameOver || gameWon) && e.key.toLowerCase() === "r") resetGame()
  if ((gameOver || gameWon) && e.key.toLowerCase() === "s") {
    configPanel.style.display = "block"
    canvas.style.display = "none"
    gameOver = false
    gameWon = false
  }
})

startGameButton.addEventListener("click", startGame)
