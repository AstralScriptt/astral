const colors = ["#d199ff", "#b266ff", "#e2b0ff", "#cc8cff"];
const ballCount = 20; // Increased for more visual appeal
const container = document.getElementById("bg");

// Get full page height automatically
const worldHeight = document.documentElement.scrollHeight;
const worldWidth = window.innerWidth;
container.style.height = worldHeight + "px";

const balls = [];

for (let i = 0; i < ballCount; i++) {
  const ball = document.createElement("div");
  ball.className = "ball";

  const size = Math.random() * 100 + 60; // Larger balls for more impact
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];

  container.appendChild(ball);

  balls.push({
    el: ball,
    x: Math.random() * worldWidth,
    y: Math.random() * worldHeight,
    dx: (Math.random() * 3 + 1) * (Math.random() < 0.5 ? -1 : 1), // Faster movement
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

// Account System using localStorage
let currentUser = null;

// Initialize data if not present
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify([]));
}
if (!localStorage.getItem('status')) {
  localStorage.setItem('status', 'online');
}
if (!localStorage.getItem('changelogs')) {
  localStorage.setItem('changelogs', JSON.stringify([]));
}

// Modals
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const statusModal = document.getElementById('statusModal');
const changelogsModal = document.getElementById('changelogsModal');

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusTab = document.getElementById('statusTab');
const changelogsTab = document.getElementById('changelogsTab');

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

// Login
document.getElementById('loginForm').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    updateUI();
    loginModal.style.display = 'none';
    alert('Logged in successfully!');
  } else {
    alert('Invalid credentials');
  }
}

// Signup
document.getElementById('signupForm').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const isAdmin = document.getElementById('isAdmin').checked;
  const users = JSON.parse(localStorage.getItem('users'));
  if (users.find(u => u.username === username)) {
    alert('Username exists');
    return;
  }
  users.push({ username, password, isAdmin });
  localStorage.setItem('users', JSON.stringify(users));
  signupModal.style.display = 'none';
  alert('Signed up successfully! Please login.');
}

// Logout
logoutBtn.onclick = function() {
  currentUser = null;
  updateUI();
}

// Update UI based on user
function updateUI() {
  if (currentUser) {
    loginBtn.classList.add('hidden');
    signupBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  } else {
    loginBtn.classList.remove('hidden');
    signupBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
  }
  // For status
  const editStatus = document.getElementById('editStatus');
  if (currentUser && currentUser.isAdmin) {
    editStatus.classList.remove('hidden');
  } else {
    editStatus.classList.add('hidden');
  }
  // For changelogs
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
statusTab.onclick = () => {
  updateStatusDisplay();
  statusModal.style.display = 'block';
  updateUI();
}
changelogsTab.onclick = () => {
  updateChangelogsDisplay();
  changelogsModal.style.display = 'block';
  updateUI();
}

// Status
function updateStatusDisplay() {
  const status = localStorage.getItem('status');
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
}

document.getElementById('saveStatus').onclick = () => {
  const newStatus = document.getElementById('statusSelect').value;
  localStorage.setItem('status', newStatus);
  updateStatusDisplay();
}

// Changelogs
function updateChangelogsDisplay() {
  const changelogs = JSON.parse(localStorage.getItem('changelogs'));
  const list = document.getElementById('changelogsList');
  list.innerHTML = '';
  changelogs.forEach(log => {
    const li = document.createElement('li');
    li.textContent = log;
    list.appendChild(li);
  });
}

document.getElementById('addChangelog').onclick = () => {
  const newLog = document.getElementById('newChangelog').value;
  if (newLog) {
    const changelogs = JSON.parse(localStorage.getItem('changelogs'));
    changelogs.push(newLog);
    localStorage.setItem('changelogs', JSON.stringify(changelogs));
    document.getElementById('newChangelog').value = '';
    updateChangelogsDisplay();
  }
}
