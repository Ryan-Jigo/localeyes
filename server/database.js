const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'localeyes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database schema and seed data
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        department TEXT,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        department TEXT NOT NULL,
        status TEXT NOT NULL,
        location JSONB NOT NULL,
        images JSONB DEFAULT '[]'::jsonb,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        reports INTEGER DEFAULT 0,
        abuse_reporters JSONB DEFAULT '[]'::jsonb,
        reporter_id TEXT NOT NULL,
        reporter_email TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create user_votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_votes (
        user_id TEXT NOT NULL,
        issue_id TEXT NOT NULL,
        vote_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, issue_id)
      );
    `);

    // Seed authority users
    const authorityUsers = [
      { email: 'pwd@kseb.localeyes.com', password: 'authority123', role: 'authority', department: 'PWD', name: 'PWD Authority' },
      { email: 'water@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Water', name: 'Water Authority' },
      { email: 'kseb@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'KSEB', name: 'KSEB Authority' },
      { email: 'waste@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Waste Management', name: 'Waste Management Authority' },
      { email: 'other@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Other', name: 'Other Department Authority' },
    ];

    for (const user of authorityUsers) {
      const { rows } = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (rows.length === 0) {
        // ✅ Hash password before seeding
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await client.query(
          'INSERT INTO users (email, password, role, department, name) VALUES ($1, $2, $3, $4, $5)',
          [user.email, hashedPassword, user.role, user.department, user.name]
        );
        console.log(`Seeded authority user: ${user.email}`);
      }
    }

    console.log('Database schema and default users initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, initializeDatabase };
