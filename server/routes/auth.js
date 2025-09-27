const express = require('express');
const { pool } = require('../database');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const result = await pool.query(
      'SELECT id, email, role, department, name, password FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0 || result.rows[0].password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userData = result.rows[0];
    const token = `mock_token_${Date.now()}`;
    
    res.json({
      user: {
        id: String(userData.id),
        email: userData.email,
        role: userData.role,
        department: userData.department || undefined,
        name: userData.name || undefined
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
    
    // Check if user already exists
    const existingResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    
    // Insert new user
    const insertResult = await pool.query(
      'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name',
      [normalizedEmail, password, 'user', name || null]
    );
    
    const userData = insertResult.rows[0];
    const token = `mock_token_${Date.now()}`;
    
    res.json({
      user: {
        id: String(userData.id),
        email: userData.email,
        role: 'user',
        name: userData.name || undefined
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
