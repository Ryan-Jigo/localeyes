const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runSingle, executeQuery } = require('../database-sqlite');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'localeyes-dev-secret-change-in-production';
const SALT_ROUNDS = 10;

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const user = await runSingle(
      'SELECT id, email, role, department, name, password FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ bcrypt compare
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Real JWT
    const token = jwt.sign(
      { userId: String(user.id), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: String(user.id),
        email: user.email,
        role: user.role,
        department: user.department || undefined,
        name: user.name || undefined
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await runSingle(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await executeQuery(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)',
      [normalizedEmail, hashedPassword, 'user', name || null]
    );

    // ✅ Real JWT
    const token = jwt.sign(
      { userId: String(result.id), email: normalizedEmail, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: String(result.id),
        email: normalizedEmail,
        role: 'user',
        name: name || undefined
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
