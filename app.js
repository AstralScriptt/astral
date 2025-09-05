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
function drawCar(ctx, x, y, color) {
  const width = 20;
  const height = 40;
  ctx.fillStyle = color;
  // Body
  ctx.fillRect(x + 2, y + 10, width - 4, height - 20);
  // Top
  ctx.fillRect(x + 4, y, width - 8, 15);
  // Cabin
  ctx.fillStyle = '#add8e6';
  ctx.fillRect(x + 5, y + 5, width - 10, 10);
  // Wheels
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 5, y + height - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 5, y + height - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5, y + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 5, y + 10, 5, 0, Math.PI * 2);
  ctx.fill();
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

  // Timer and levels (drawn inside canvas)
  const elapsed = (Date.now() - carStartTime) / 1000;
  const minutes = Math.floor(elapsed / 60);
  const seconds = Math.floor(elapsed % 60);
  carCtx.font = '20px Arial';
  carCtx.fillStyle = '#ffffff';
  carCtx.fillText(`Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`, 10, 30);
  carCtx.fillText('Wanted Level: ' + '★'.repeat(carStars), 10, 60);

  // Player car
  carPlayer.x += carPlayer.vx * carPlayer.boost;
  carPlayer.y += carPlayer.vy * carPlayer.boost;
  if (carPlayer.x < 0) carPlayer.x = 0;
  if (carPlayer.x > 780) carPlayer.x = 780;
  if (carPlayer.y < 0) carPlayer.y = 0;
  if (carPlayer.y > 560) carPlayer.y = 560;
  drawCar(carCtx, carPlayer.x, carPlayer.y, carPlayer.color);

  // Police cars
  policeCars.forEach((p, i) => {
    const dx = carPlayer.x - p.x;
    const dy = carPlayer.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;
    }
    drawCar(carCtx, p.x, p.y, p.color);
    // Collision
    if (Math.abs(p.x - carPlayer.x) < 20 && Math.abs(p.y - carPlayer.y) < 40) {
      alert('Caught by police! Game Over. Survived: ' + Math.floor((Date.now() - carStartTime) / 1000) + ' seconds');
      stopCarGame();
    }
  });
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
// On-screen arrows
const controlContainer = document.createElement('div');
controlContainer.style.position = 'fixed';
controlContainer.style.bottom = '20px';
controlContainer.style.left = '50%';
controlContainer.style.transform = 'translateX(-50%)';
controlContainer.style.zIndex = '1000';
document.body.appendChild(controlContainer);

const upButton = document.createElement('button');
upButton.textContent = '↑';
upButton.style.fontSize = '40px';
upButton.style.margin = '5px';
upButton.style.background = '#fff';
upButton.style.border = '1px solid #000';
upButton.style.cursor = 'pointer';
controlContainer.appendChild(upButton);

const horizontalControls = document.createElement('div');
horizontalControls.style.display = 'flex';
horizontalControls.style.justifyContent = 'center';
controlContainer.appendChild(horizontalControls);

const leftButton = document.createElement('button');
leftButton.textContent = '←';
leftButton.style.fontSize = '40px';
leftButton.style.margin = '5px';
leftButton.style.background = '#fff';
leftButton.style.border = '1px solid #000';
leftButton.style.cursor = 'pointer';
horizontalControls.appendChild(leftButton);

const downButton = document.createElement('button');
downButton.textContent = '↓';
downButton.style.fontSize = '40px';
downButton.style.margin = '5px';
downButton.style.background = '#fff';
downButton.style.border = '1px solid #000';
downButton.style.cursor = 'pointer';
horizontalControls.appendChild(downButton);

const rightButton = document.createElement('button');
rightButton.textContent = '→';
rightButton.style.fontSize = '40px';
rightButton.style.margin = '5px';
rightButton.style.background = '#fff';
rightButton.style.border = '1px solid #000';
rightButton.style.cursor = 'pointer';
horizontalControls.appendChild(rightButton);

function startMove(dir) {
  if (!carGameRunning) return;
  switch (dir) {
    case 'left': carPlayer.vx = -carPlayer.speed; break;
    case 'right': carPlayer.vx = carPlayer.speed; break;
    case 'up': carPlayer.vy = -carPlayer.speed; break;
    case 'down': carPlayer.vy = carPlayer.speed; break;
  }
}
function stopMove(dir) {
  if (!carGameRunning) return;
  switch (dir) {
    case 'left':
    case 'right': carPlayer.vx = 0; break;
    case 'up':
    case 'down': carPlayer.vy = 0; break;
  }
}

// Mouse events
upButton.addEventListener('mousedown', () => startMove('up'));
upButton.addEventListener('mouseup', () => stopMove('up'));
leftButton.addEventListener('mousedown', () => startMove('left'));
leftButton.addEventListener('mouseup', () => stopMove('left'));
downButton.addEventListener('mousedown', () => startMove('down'));
downButton.addEventListener('mouseup', () => stopMove('down'));
rightButton.addEventListener('mousedown', () => startMove('right'));
rightButton.addEventListener('mouseup', () => stopMove('right'));

// Touch events
upButton.addEventListener('touchstart', () => startMove('up'));
upButton.addEventListener('touchend', () => stopMove('up'));
leftButton.addEventListener('touchstart', () => startMove('left'));
leftButton.addEventListener('touchend', () => stopMove('left'));
downButton.addEventListener('touchstart', () => startMove('down'));
downButton.addEventListener('touchend', () => stopMove('down'));
rightButton.addEventListener('touchstart', () => startMove('right'));
rightButton.addEventListener('touchend', () => stopMove('right'));

// Fullscreen option
const fullscreenButton = document.createElement('button');
fullscreenButton.textContent = 'Fullscreen';
fullscreenButton.style.position = 'fixed';
fullscreenButton.style.top = '20px';
fullscreenButton.style.right = '20px';
fullscreenButton.style.fontSize = '20px';
fullscreenButton.style.zIndex = '1000';
fullscreenButton.style.cursor = 'pointer';
document.body.appendChild(fullscreenButton);
fullscreenButton.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

// Customization (kept as modal, assumed to be overlaid inside the game view)
document.getElementById('customizeCar').onclick = () => customizeModal.style.display = 'block';
document.getElementById('customizeForm').onsubmit = (e) => {
  e.preventDefault();
  carPlayer.color = document.getElementById('carColor').value;
  carPlayer.boost = parseFloat(document.getElementById('speedBoost').value);
  customizeModal.style.display = 'none';
};
