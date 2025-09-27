import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'localeyes',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export function initDatabase(): Pool {
  if (!pool) {
    pool = new Pool(DB_CONFIG);
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

export async function getClient(): Promise<PoolClient> {
  if (!pool) {
    initDatabase();
  }
  return pool!.connect();
}

export function isDatabaseEnabled(): boolean {
  return !!(import.meta.env.VITE_DB_HOST || import.meta.env.VITE_DB_NAME || import.meta.env.VITE_DB_USER);
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export async function createTables(): Promise<void> {
  const client = await getClient();
  
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        department VARCHAR(100),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id VARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Open',
        location JSONB NOT NULL,
        images JSONB DEFAULT '[]',
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        reports INTEGER DEFAULT 0,
        abuse_reporters JSONB DEFAULT '[]',
        reporter_id VARCHAR(255) NOT NULL,
        reporter_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_votes (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        issue_id VARCHAR(255) NOT NULL,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, issue_id)
      )
    `);

    // Insert default authority users
    await client.query(`
      INSERT INTO users (email, password, role, department, name) VALUES
      ('pwd@kseb.localeyes.com', 'authority123', 'authority', 'PWD', 'PWD Authority'),
      ('water@kerala.localeyes.com', 'authority123', 'authority', 'Water', 'Water Authority'),
      ('kseb@kerala.localeyes.com', 'authority123', 'authority', 'KSEB', 'KSEB Authority'),
      ('waste@kerala.localeyes.com', 'authority123', 'authority', 'Waste Management', 'Waste Management Authority'),
      ('other@kerala.localeyes.com', 'authority123', 'authority', 'Other', 'Other Department Authority')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
