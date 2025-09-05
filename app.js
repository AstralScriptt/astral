const colors = ["#d199ff", "#b266ff", "#e2b0ff", "#cc8cff", "#ff69b4", "#00ff00", "#ffff00"];
const ballCount = 30; // More balls for awesomeness
const container = document.getElementById("bg");
const worldHeight = document.documentElement.scrollHeight;
const worldWidth = window.innerWidth;
container.style.height = worldHeight + "px";
const balls = [];
for (let i = 0; i < ballCount; i++) {
  const ball = document.createElement("div");
  ball.className = "ball";
  const size = Math.random() * 150 + 80; // Larger balls
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;
  ball.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;
  ball.style.opacity = Math.random() * 0.5 + 0.3;
  container.appendChild(ball);
  balls.push({
    el: ball,
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    dx: (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1),
    dy: (Math.random() * 4 + 1) * (Math.random() < 0.5 ? -1 : 1),
    size
  });
}
function animate() {
  balls.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x <= 0 || b.x + b.size >= worldWidth) b.dx *= -1;
    if (b.y <= 0 || b.y + b.size >= worldHeight) b.dy *= -1;
    b.el.style.left = `${b.x}px`;
    b.el.style.top = `${b.y}px`;
  });
  requestAnimationFrame(animate);
}
animate();

// Modals
const customizeModal = document.getElementById('customizeModal');
const closes = document.getElementsByClassName('close');
for (let close of closes) {
  close.onclick = function() {
    this.parentElement.parentElement.style.display = 'none';
  }
}
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}

// Car Game
const carCanvas = document.getElementById('carCanvas');
const carCtx = carCanvas.getContext('2d');
let carGameRunning = false;
let carPlayer = { x: 400, y: 300, width: 20, height: 40, speed: 3, vx: 0, vy: 0, color: '#ff0000', boost: 1 };
let policeCars = [];
let carStartTime = 0;
let carLevel = 1;
let carStars = 1;
let carEvaded = 0;
let carAnimationFrame;

function spawnPolice(num) {
  for (let i = 0; i < num; i++) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { x = Math.random() * 800; y = -20; }
    else if (side === 1) { x = Math.random() * 800; y = 620; }
    else if (side === 2) { x = -20; y = Math.random() * 600; }
    else { x = 820; y = Math.random() * 600; }
    policeCars.push({ x, y, width: 20, height: 40, speed: 2 + carLevel * 0.5, color: '#0000ff' });
  }
}

function updateCarGame() {
  carCtx.clearRect(0, 0, 800, 600);
  
  // Draw map (simple roads)
  carCtx.fillStyle = '#808080';
  carCtx.fillRect(0, 0, 800, 600); // Ground
  carCtx.fillStyle = '#000000';
  carCtx.fillRect(100, 0, 20, 600); // Vertical roads
  carCtx.fillRect(300, 0, 20, 600);
  carCtx.fillRect(500, 0, 20, 600);
  carCtx.fillRect(700, 0, 20, 600);
  carCtx.fillRect(0, 100, 800, 20); // Horizontal roads
  carCtx.fillRect(0, 300, 800, 20);
  carCtx.fillRect(0, 500, 800, 20);

  // Player car
  carPlayer.x += carPlayer.vx * carPlayer.boost;
  carPlayer.y += carPlayer.vy * carPlayer.boost;
  if (carPlayer.x < 0) carPlayer.x = 0;
  if (carPlayer.x > 780) carPlayer.x = 780;
  if (carPlayer.y < 0) carPlayer.y = 0;
  if (carPlayer.y > 560) carPlayer.y = 560;
  carCtx.fillStyle = carPlayer.color;
  carCtx.fillRect(carPlayer.x, carPlayer.y, carPlayer.width, carPlayer.height);

  // Police cars
  policeCars.forEach((p, i) => {
    const dx = carPlayer.x - p.x;
    const dy = carPlayer.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;
    }
    carCtx.fillStyle = p.color;
    carCtx.fillRect(p.x, p.y, p.width, p.height);

    // Collision
    if (Math.abs(p.x - carPlayer.x) < 20 && Math.abs(p.y - carPlayer.y) < 40) {
      alert('Caught by police! Game Over. Survived: ' + Math.floor((Date.now() - carStartTime) / 1000) + ' seconds');
      stopCarGame();
    }
  });

  // Timer and levels
  const elapsed = (Date.now() - carStartTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
  document.getElementById('carTimer').textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  document.getElementById('carStars').textContent = 'Wanted Level: ' + '★'.repeat(carStars);

  if (elapsed > 300 * carLevel) { // 5 minutes per level
    carLevel++;
    carStars = Math.min(carStars + 1, 5);
    spawnPolice(10 * carLevel); // Add 10 cars per level, up to 5 stars
    if (carStars === 5) spawnPolice(50); // Extra for max
  } else if (Math.random() < 0.01) { // Random spawn
    spawnPolice(1);
  }

  if (carGameRunning) carAnimationFrame = requestAnimationFrame(updateCarGame);
}

function startCarGame() {
  if (carGameRunning) return;
  carGameRunning = true;
  policeCars = [];
  carStartTime = Date.now();
  carLevel = 1;
  carStars = 1;
  spawnPolice(5); // Start with 5 police
  updateCarGame();
}

function stopCarGame() {
  carGameRunning = false;
  cancelAnimationFrame(carAnimationFrame);
}

document.getElementById('startCarGame').onclick = startCarGame;

document.addEventListener('keydown', (e) => {
  if (!carGameRunning) return;
  if (e.key === 'ArrowLeft') carPlayer.vx = -carPlayer.speed;
  if (e.key === 'ArrowRight') carPlayer.vx = carPlayer.speed;
  if (e.key === 'ArrowUp') carPlayer.vy = -carPlayer.speed;
  if (e.key === 'ArrowDown') carPlayer.vy = carPlayer.speed;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') carPlayer.vx = 0;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') carPlayer.vy = 0;
});

// Customization
document.getElementById('customizeCar').onclick = () => customizeModal.style.display = 'block';

document.getElementById('customizeForm').onsubmit = (e) => {
  e.preventDefault();
  carPlayer.color = document.getElementById('carColor').value;
  carPlayer.boost = parseFloat(document.getElementById('speedBoost').value);
  customizeModal.style.display = 'none';
};

// Football Game
const footballCanvas = document.getElementById('footballCanvas');
const footballCtx = footballCanvas.getContext('2d');
let footballGameRunning = false;
let player = { x: 100, y: 200, size: 10, speed: 4, vx: 0, vy: 0 };
let opponent = { x: 700, y: 200, size: 10, speed: 3 };
let ball = { x: 400, y: 200, size: 5, vx: 0, vy: 0 };
let playerScore = 0;
let opponentScore = 0;
let footballStartTime = 0;
let footballAnimationFrame;

function updateFootballGame() {
  footballCtx.clearRect(0, 0, 800, 400);
  
  // Draw field
  footballCtx.fillStyle = '#00ff00';
  footballCtx.fillRect(0, 0, 800, 400);
  footballCtx.strokeStyle = '#ffffff';
  footballCtx.lineWidth = 2;
  footballCtx.strokeRect(0, 0, 800, 400);
  footballCtx.beginPath();
  footballCtx.arc(400, 200, 50, 0, Math.PI * 2);
  footballCtx.stroke();
  footballCtx.fillStyle = '#ffffff';
  footballCtx.fillRect(0, 150, 20, 100); // Left goal
  footballCtx.fillRect(780, 150, 20, 100); // Right goal

  // Player
  player.x += player.vx;
  player.y += player.vy;
  if (player.x < 0) player.x = 0;
  if (player.x > 790) player.x = 790;
  if (player.y < 0) player.y = 0;
  if (player.y > 390) player.y = 390;
  footballCtx.fillStyle = '#ff0000';
  footballCtx.beginPath();
  footballCtx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  footballCtx.fill();

  // Opponent AI
  const ballDx = ball.x - opponent.x;
  const ballDy = ball.y - opponent.y;
  const ballDist = Math.sqrt(ballDx * ballDx + ballDy * ballDy);
  if (ballDist > 0) {
    opponent.x += (ballDx / ballDist) * opponent.speed;
    opponent.y += (ballDy / ballDist) * opponent.speed;
  }
  footballCtx.fillStyle = '#0000ff';
  footballCtx.beginPath();
  footballCtx.arc(opponent.x, opponent.y, opponent.size, 0, Math.PI * 2);
  footballCtx.fill();

  // Ball
  ball.x += ball.vx;
  ball.y += ball.vy;
  ball.vx *= 0.98; // Friction
  ball.vy *= 0.98;
  if (ball.y < 0 || ball.y > 395) ball.vy *= -1;
  if (ball.x < 0 || ball.x > 795) ball.vx *= -1;
  footballCtx.fillStyle = '#ffffff';
  footballCtx.beginPath();
  footballCtx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  footballCtx.fill();

  // Kick
  const playerBallDist = Math.hypot(player.x - ball.x, player.y - ball.y);
  if (playerBallDist < 15 && kicking) {
    ball.vx = (ball.x - player.x) / 5 + player.vx;
    ball.vy = (ball.y - player.y) / 5 + player.vy;
  }
  const oppBallDist = Math.hypot(opponent.x - ball.x, opponent.y - ball.y);
  if (oppBallDist < 15) {
    ball.vx = (ball.x - opponent.x) / 5 - 2; // AI kicks towards left
    ball.vy = (ball.y - opponent.y) / 5;
  }

  // Goals
  if (ball.x < 20 && ball.y > 150 && ball.y < 250) {
    opponentScore++;
    resetFootball();
  }
  if (ball.x > 780 && ball.y > 150 && ball.y < 250) {
    playerScore++;
    resetFootball();
  }

  document.getElementById('footballScore').textContent = `Score: ${playerScore} - ${opponentScore}`;

  // Timer
  const elapsed = (Date.now() - footballStartTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
  document.getElementById('footballTimer').textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (footballGameRunning) footballAnimationFrame = requestAnimationFrame(updateFootballGame);
}

function resetFootball() {
  ball.x = 400;
  ball.y = 200;
  ball.vx = 0;
  ball.vy = 0;
  player.x = 100;
  player.y = 200;
  opponent.x = 700;
  opponent.y = 200;
}

function startFootballGame() {
  if (footballGameRunning) return;
  footballGameRunning = true;
  playerScore = 0;
  opponentScore = 0;
  footballStartTime = Date.now();
  resetFootball();
  updateFootballGame();
}

function stopFootballGame() {
  footballGameRunning = false;
  cancelAnimationFrame(footballAnimationFrame);
}

document.getElementById('startFootballGame').onclick = startFootballGame;

let kicking = false;
document.addEventListener('keydown', (e) => {
  if (!footballGameRunning) return;
  if (e.key === 'ArrowLeft') player.vx = -player.speed;
  if (e.key === 'ArrowRight') player.vx = player.speed;
  if (e.key === 'ArrowUp') player.vy = -player.speed;
  if (e.key === 'ArrowDown') player.vy = player.speed;
  if (e.key === ' ') kicking = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.vx = 0;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') player.vy = 0;
  if (e.key === ' ') kicking = false;
});
