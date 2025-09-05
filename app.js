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
let carPlayer = { x: 400, y: 300, width: 30, height: 60, speed: 3, vx: 0, vy: 0, color: '#ff0000', boost: 1 };
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
    policeCars.push({ x, y, width: 30, height: 60, speed: 2 + carLevel * 0.5, color: '#0000ff' });
  }
}
function drawHyperRealisticCar(ctx, x, y, color, isPolice = false) {
  const width = 30;
  const height = 60;

  // Body with gradient
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
  bodyGradient.addColorStop(0, color);
  bodyGradient.addColorStop(1, '#000000');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + width - 5, y);
  ctx.quadraticCurveTo(x + width, y + 10, x + width, y + 20);
  ctx.lineTo(x + width, y + height - 20);
  ctx.quadraticCurveTo(x + width, y + height - 10, x + width - 5, y + height);
  ctx.lineTo(x + 5, y + height);
  ctx.quadraticCurveTo(x, y + height - 10, x, y + height - 20);
  ctx.lineTo(x, y + 20);
  ctx.quadraticCurveTo(x, y + 10, x + 5, y);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#add8e6';
  ctx.fillRect(x + 5, y + 10, width - 10, 15); // Front window
  ctx.fillRect(x + 5, y + 30, width - 10, 15); // Side windows

  // Headlights
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.ellipse(x + 5, y + 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width - 5, y + 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Taillights
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.ellipse(x + 5, y + height - 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width - 5, y + height - 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels with details
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(x + 7, y + height - 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 7, y + height - 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 7, y + 10, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 7, y + 10, 8, 0, Math.PI * 2);
  ctx.fill();

  // Hubcaps
  ctx.fillStyle = '#cccccc';
  ctx.beginPath();
  ctx.arc(x + 7, y + height - 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 7, y + height - 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 7, y + 10, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width - 7, y + 10, 4, 0, Math.PI * 2);
  ctx.fill();

  if (isPolice) {
    // Police lights
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 10, y - 5, 5, 5);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(x + width - 15, y - 5, 5, 5);
  }
}
function drawRealisticMap(ctx) {
  // Grass background
  ctx.fillStyle = '#228b22';
  ctx.fillRect(0, 0, 800, 600);

  // Roads with asphalt color
  ctx.fillStyle = '#696969';
  // Vertical roads
  ctx.fillRect(80, 0, 60, 600);
  ctx.fillRect(280, 0, 60, 600);
  ctx.fillRect(480, 0, 60, 600);
  ctx.fillRect(680, 0, 60, 600);
  // Horizontal roads
  ctx.fillRect(0, 80, 800, 60);
  ctx.fillRect(0, 280, 800, 60);
  ctx.fillRect(0, 480, 800, 60);

  // Road lines - dashed white lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);

  // Vertical lines
  ctx.beginPath();
  ctx.moveTo(110, 0);
  ctx.lineTo(110, 600);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(310, 0);
  ctx.lineTo(310, 600);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(510, 0);
  ctx.lineTo(510, 600);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(710, 0);
  ctx.lineTo(710, 600);
  ctx.stroke();

  // Horizontal lines
  ctx.beginPath();
  ctx.moveTo(0, 110);
  ctx.lineTo(800, 110);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 310);
  ctx.lineTo(800, 310);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 510);
  ctx.lineTo(800, 510);
  ctx.stroke();

  ctx.setLineDash([]); // Reset dash
}
function updateCarGame() {
  carCtx.clearRect(0, 0, 800, 600);
 
  // Draw realistic map
  drawRealisticMap(carCtx);

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
  if (carPlayer.x > 770) carPlayer.x = 770;
  if (carPlayer.y < 0) carPlayer.y = 0;
  if (carPlayer.y > 540) carPlayer.y = 540;
  drawHyperRealisticCar(carCtx, carPlayer.x, carPlayer.y, carPlayer.color);

  // Police cars
  policeCars.forEach((p, i) => {
    const dx = carPlayer.x - p.x;
    const dy = carPlayer.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;
    }
    drawHyperRealisticCar(carCtx, p.x, p.y, p.color, true);
    // Collision
    if (Math.abs(p.x - carPlayer.x) < 30 && Math.abs(p.y - carPlayer.y) < 60) {
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
const loadingScreen = document.createElement('div');
loadingScreen.style.position = 'fixed';
loadingScreen.style.top = '0';
loadingScreen.style.left = '0';
loadingScreen.style.width = '100%';
loadingScreen.style.height = '100%';
loadingScreen.style.background = '#000';
loadingScreen.style.color = '#fff';
loadingScreen.style.display = 'flex';
loadingScreen.style.alignItems = 'center';
loadingScreen.style.justifyContent = 'center';
loadingScreen.style.fontSize = '24px';
loadingScreen.style.zIndex = '1001';
loadingScreen.style.textAlign = 'center';
loadingScreen.innerHTML = 'Brailyn idk if i spelt your name wrong but this the beta version of the game itle be more realistic soon i tried my best ngl<br><br>Loading...';
document.body.appendChild(loadingScreen);

function startCarGame() {
  if (carGameRunning) return;
  loadingScreen.style.display = 'flex';
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    carGameRunning = true;
    policeCars = [];
    carStartTime = Date.now();
    carLevel = 1;
    carStars = 1;
    spawnPolice(5); // Start with 5 police
    controlContainer.style.display = 'block';
    updateCarGame();
  }, 4); // 4 seconds loading
}
function stopCarGame() {
  carGameRunning = false;
  cancelAnimationFrame(carAnimationFrame);
  controlContainer.style.display = 'none';
}
document.getElementById('startCarGame').onclick = startCarGame;
document.addEventListener('keydown', (e) => {
  if (!carGameRunning) return;
  if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') carPlayer.vx = -carPlayer.speed;
  if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') carPlayer.vx = carPlayer.speed;
  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') carPlayer.vy = -carPlayer.speed;
  if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') carPlayer.vy = carPlayer.speed;
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd') carPlayer.vx = 0;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's') carPlayer.vy = 0;
});
// On-screen arrows laid out like WASD
const controlContainer = document.createElement('div');
controlContainer.style.position = 'fixed';
controlContainer.style.bottom = '20px';
controlContainer.style.left = '20px';
controlContainer.style.zIndex = '1000';
controlContainer.style.display = 'none';
document.body.appendChild(controlContainer);

const upButton = document.createElement('button');
upButton.textContent = '↑';
upButton.style.fontSize = '40px';
upButton.style.margin = '5px';
upButton.style.background = '#fff';
upButton.style.border = '1px solid #000';
upButton.style.cursor = 'pointer';
upButton.style.display = 'block';
upButton.style.marginLeft = '50px'; // Center the up button
controlContainer.appendChild(upButton);

const bottomRow = document.createElement('div');
bottomRow.style.display = 'flex';
controlContainer.appendChild(bottomRow);

const leftButton = document.createElement('button');
leftButton.textContent = '←';
leftButton.style.fontSize = '40px';
leftButton.style.margin = '5px';
leftButton.style.background = '#fff';
leftButton.style.border = '1px solid #000';
leftButton.style.cursor = 'pointer';
bottomRow.appendChild(leftButton);

const downButton = document.createElement('button');
downButton.textContent = '↓';
downButton.style.fontSize = '40px';
downButton.style.margin = '5px';
downButton.style.background = '#fff';
downButton.style.border = '1px solid #000';
downButton.style.cursor = 'pointer';
bottomRow.appendChild(downButton);

const rightButton = document.createElement('button');
rightButton.textContent = '→';
rightButton.style.fontSize = '40px';
rightButton.style.margin = '5px';
rightButton.style.background = '#fff';
rightButton.style.border = '1px solid #000';
rightButton.style.cursor = 'pointer';
bottomRow.appendChild(rightButton);

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

// Fullscreen button on the game
const fullscreenButton = document.createElement('button');
fullscreenButton.textContent = 'Fullscreen';
fullscreenButton.style.position = 'absolute';
fullscreenButton.style.top = '10px';
fullscreenButton.style.right = '10px';
fullscreenButton.style.fontSize = '20px';
fullscreenButton.style.zIndex = '1000';
fullscreenButton.style.cursor = 'pointer';
carCanvas.parentElement.style.position = 'relative'; // Assuming canvas has a parent
carCanvas.parentElement.appendChild(fullscreenButton);
fullscreenButton.onclick = () => {
  if (!document.fullscreenElement) {
    carCanvas.requestFullscreen().catch(err => {
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

