const SERVER_URL = process.env.SERVER_URL || 'https://your-project.vercel.app';

const colors = ["#d199ff", "#b266ff", "#e2b0ff", "#cc8cff"];
const ballCount = 20;
const container = document.getElementById("bg");
const worldHeight = document.documentElement.scrollHeight;
const worldWidth = window.innerWidth;
container.style.height = worldHeight + "px";
const balls = [];
for (let i = 0; i < ballCount; i++) {
  const ball = document.createElement("div");
  ball.className = "ball";
  const size = Math.random() * 100 + 60;
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];
  container.appendChild(ball);
  balls.push({
    el: ball,
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    dx: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? -1 : 1),
    dy: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? -1 : 1),
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

// Account System
let currentUser = null;
let apiKey = null;

// Modals
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const statusModal = document.getElementById('statusModal');
const changelogsModal = document.getElementById('changelogsModal');
const configModal = document.getElementById('configModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const configBtn = document.getElementById('configBtn');
const closes = document.getElementsByClassName('close');

// Close modals
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

// API request helper
async function apiRequest(url, method, data, headers = {}) {
  const response = await fetch(`${SERVER_URL}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data ? JSON.stringify(data) : undefined
  });
  return response.json();
}

// Login
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const response = await apiRequest('/api/login', 'POST', { username, password });
    if (response.error) {
      alert(response.error);
      return;
    }
    currentUser = { username, isAdmin: response.isAdmin };
    apiKey = response.apiKey;
    updateUI();
    loginModal.style.display = 'none';
    alert('Logged in successfully!');
  } catch (error) {
    alert('Error logging in: ' + error.message);
  }
}

// Signup
document.getElementById('signupForm').onsubmit = async function(e) {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const isAdmin = document.getElementById('isAdmin').checked;
  try {
    const response = await apiRequest('/api/signup', 'POST', { username, password, isAdmin });
    if (response.error) {
      alert(response.error);
      return;
    }
    signupModal.style.display = 'none';
    alert('Signed up successfully! Please login.');
  } catch (error) {
    alert('Error signing up: ' + error.message);
  }
}

// Logout
logoutBtn.onclick = function() {
  currentUser = null;
  apiKey = null;
  updateUI();
}

// Update UI based on user
function updateUI() {
  if (currentUser) {
    loginBtn.classList.add('hidden');
    signupBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    configBtn.classList.remove('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    configBtn.classList.add('hidden');
  }
  const editStatus = document.getElementById('editStatus');
  if (currentUser && currentUser.isAdmin) {
    editStatus.classList.remove('hidden');
  } else {
    editStatus.classList.add('hidden');
  }
  const editChangelogs = document.getElementById('editChangelogs');
  if (currentUser && currentUser.isAdmin) {
    editChangelogs.classList.remove('hidden');
  } else {
    editChangelogs.classList.add('hidden');
  }
}
updateUI();

// Open modals
loginBtn.onclick = () => loginModal.style.display = 'block';
signupBtn.onclick = () => signupModal.style.display = 'block';
configBtn.onclick = () => {
  loadConfig();
  configModal.style.display = 'block';
};
statusTab.onclick = () => {
  updateStatusDisplay();
  statusModal.style.display = 'block';
  updateUI();
};
changelogsTab.onclick = () => {
  updateChangelogsDisplay();
  changelogsModal.style.display = 'block';
  updateUI();
};

// Status
async function updateStatusDisplay() {
  try {
    const response = await apiRequest('/api/status', 'GET');
    const status = response.status;
    const circle = document.querySelector('.status-circle');
    const text = document.getElementById('statusText');
    if (status === 'online') {
      circle.style.background = 'green';
      text.textContent = 'Online';
    } else if (status === 'offline') {
      circle.style.background = 'red';
      text.textContent = 'Offline';
    } else {
      circle.style.background = 'yellow';
      text.textContent = 'Maintenance';
    }
    document.getElementById('statusSelect').value = status;
  } catch (error) {
    alert('Error fetching status');
  }
}
document.getElementById('saveStatus').onclick = async () => {
  const newStatus = document.getElementById('statusSelect').value;
  try {
    await apiRequest('/api/status', 'POST', { status: newStatus }, { Authorization: `Bearer ${apiKey}` });
    updateStatusDisplay();
  } catch (error) {
    alert('Error updating status');
  }
};

// Changelogs
async function updateChangelogsDisplay() {
  try {
    const changelogs = await apiRequest('/api/changelogs', 'GET');
    const list = document.getElementById('changelogsList');
    list.innerHTML = '';
    changelogs.forEach(log => {
      const li = document.createElement('li');
      li.textContent = log;
      list.appendChild(li);
    });
  } catch (error) {
    alert('Error fetching changelogs');
  }
}
document.getElementById('addChangelog').onclick = async () => {
  const newLog = document.getElementById('newChangelog').value;
  if (newLog) {
    try {
      await apiRequest('/api/changelogs', 'POST', { log: newLog }, { Authorization: `Bearer ${apiKey}` });
      document.getElementById('newChangelog').value = '';
      updateChangelogsDisplay();
    } catch (error) {
      alert('Error adding changelog');
    }
  }
};

// Config Management
async function loadConfig() {
  try {
    const config = await apiRequest('/api/config', 'GET', null, { Authorization: `Bearer ${apiKey}` });
    document.getElementById('camlockEnabled').checked = config.Camlock?.Enabled || false;
    document.getElementById('camlockAimPart').value = config.Camlock?.AimPart || 'UpperTorso';
    document.getElementById('camlockPredX').value = config.Camlock?.Prediction?.X || 0.0848;
    document.getElementById('camlockPredY').value = config.Camlock?.Prediction?.Y || 0.12345;
    document.getElementById('camlockPredZ').value = config.Camlock?.Prediction?.Z || 0.1239;
    document.getElementById('silentAimEnabled').checked = config.SilentAim?.Enabled || false;
    document.getElementById('silentAimPart').value = config.SilentAim?.AimPart || 'UpperTorso';
    document.getElementById('silentAimHitChance').value = config.SilentAim?.HitChance || 100;
  } catch (error) {
    alert('Error loading config');
  }
}
document.getElementById('configForm').onsubmit = async function(e) {
  e.preventDefault();
  const config = {
    Camlock: {
      Enabled: document.getElementById('camlockEnabled').checked,
      AimPart: document.getElementById('camlockAimPart').value,
      Prediction: {
        X: parseFloat(document.getElementById('camlockPredX').value),
        Y: parseFloat(document.getElementById('camlockPredY').value),
        Z: parseFloat(document.getElementById('camlockPredZ').value)
      }
    },
    SilentAim: {
      Enabled: document.getElementById('silentAimEnabled').checked,
      AimPart: document.getElementById('silentAimPart').value,
      HitChance: parseInt(document.getElementById('silentAimHitChance').value)
    }
  };
  try {
    await apiRequest('/api/config', 'POST', config, { Authorization: `Bearer ${apiKey}` });
    alert('Config saved successfully');
    configModal.style.display = 'none';
  } catch (error) {
    alert('Error saving config');
  }
};
document.getElementById('loadConfig').onclick = loadConfig;
