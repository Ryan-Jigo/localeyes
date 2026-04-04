const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database file in the server directory
const dbPath = path.join(__dirname, 'localeyes.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema and seed data
async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          department TEXT,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create issues table
      db.run(`
        CREATE TABLE IF NOT EXISTS issues (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          department TEXT NOT NULL,
          status TEXT NOT NULL,
          location TEXT NOT NULL,
          images TEXT DEFAULT '[]',
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          reports INTEGER DEFAULT 0,
          abuse_reporters TEXT DEFAULT '[]',
          reporter_id TEXT NOT NULL,
          reporter_email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create user_votes table
      db.run(`
        CREATE TABLE IF NOT EXISTS user_votes (
          user_id TEXT NOT NULL,
          issue_id TEXT NOT NULL,
          vote_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, issue_id)
        );
      `);

      // Create credibility_votes table
      db.run(`
        CREATE TABLE IF NOT EXISTS credibility_votes (
          authority_id TEXT NOT NULL,
          issue_id TEXT NOT NULL,
          vote INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (authority_id, issue_id)
        );
      `);

      // Add credibility column to issues if it doesn't exist
      db.run('ALTER TABLE issues ADD COLUMN credibility INTEGER DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Error adding credibility column:', err);
        }
      });

      // Seed both demo authorities and demo citizen
      const seedUsers = [
        // Authorities
        { email: 'pwd@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'PWD', name: 'PWD Authority' },
        { email: 'water@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Water', name: 'Water Authority' },
        { email: 'kseb@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'KSEB', name: 'KSEB Authority' },
        { email: 'waste@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Waste Management', name: 'Waste Management Authority' },
        { email: 'traffic@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Traffic', name: 'Traffic Authority' },
        { email: 'fire@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Fire Department', name: 'Fire Department Authority' },
        { email: 'police@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Police', name: 'Police Authority' },
        { email: 'health@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Ambulance/Healthcare', name: 'Healthcare Authority' },
        { email: 'other@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Other', name: 'Other Department Authority' },
        // Citizen
        { email: 'citizen@example.com', password: 'password123', role: 'user', department: null, name: 'Demo Citizen' }
      ];

      // Check if users already exist and insert if not
      seedUsers.forEach(user => {
        db.get('SELECT id FROM users WHERE email = ?', [user.email], async (err, row) => {
          if (err) {
            console.error('Error checking user:', err);
            return;
          }
          if (!row) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            db.run(
              'INSERT INTO users (email, password, role, department, name) VALUES (?, ?, ?, ?, ?)',
              [user.email, hashedPassword, user.role, user.department, user.name],
              function(err) {
                if (err) {
                  console.error('Error inserting user:', err);
                } else {
                  console.log(`Seeded user: ${user.email}`);
                }
              }
            );
          }
        });
      });

      console.log('SQLite database schema and default users initialized successfully.');
      resolve();
    });
  });
}

// Helper function to run queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run single query
function runSingle(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to execute queries
function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

module.exports = { 
  db, 
  initializeDatabase, 
  runQuery, 
  runSingle, 
  executeQuery 
};
