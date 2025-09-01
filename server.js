const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Add this line
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String, // In production, hash with bcrypt
  isAdmin: Boolean,
  apiKey: String,
  config: Object
});
const User = mongoose.model('User', userSchema);

// Status schema
const statusSchema = new mongoose.Schema({
  status: String
});
const Status = mongoose.model('Status', statusSchema);

// Changelog schema
const changelogSchema = new mongoose.Schema({
  log: String
});
const Changelog = mongoose.model('Changelog', changelogSchema);

// Middleware to verify API key
const verifyApiKey = async (req, res, next) => {
  const apiKey = req.headers.authorization?.split('Bearer ')[1];
  if (!apiKey) return res.status(401).json({ error: 'API key required' });
  const user = await User.findOne({ apiKey });
  if (!user) return res.status(401).json({ error: 'Invalid API key' });
  req.user = user;
  next();
};

// User routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ apiKey: user.apiKey, isAdmin: user.isAdmin });
});

app.post('/api/signup', async (req, res) => {
  const { username, password, isAdmin } = req.body;
  if (await User.findOne({ username })) return res.status(400).json({ error: 'Username exists' });
  const apiKey = require('crypto').randomUUID();
  const user = new User({ username, password, isAdmin, apiKey, config: {} });
  await user.save();
  res.json({ message: 'Signed up successfully', apiKey });
});

// Config routes
app.get('/api/config', verifyApiKey, async (req, res) => {
  res.json(req.user.config || {});
});

app.post('/api/config', verifyApiKey, async (req, res) => {
  req.user.config = req.body;
  await req.user.save();
  res.json({ message: 'Config updated' });
});

// Status routes
app.get('/api/status', async (req, res) => {
  const status = await Status.findOne();
  res.json({ status: status?.status || 'online' });
});

app.post('/api/status', verifyApiKey, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  await Status.findOneAndUpdate({}, { status: req.body.status }, { upsert: true });
  res.json({ message: 'Status updated' });
});

// Changelog routes
app.get('/api/changelogs', async (req, res) => {
  const changelogs = await Changelog.find();
  res.json(changelogs.map(c => c.log));
});

app.post('/api/changelogs', verifyApiKey, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  const changelog = new Changelog({ log: req.body.log });
  await changelog.save();
  res.json({ message: 'Changelog added' });
});

// Export for Vercel
module.exports = app;
