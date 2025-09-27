const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

      // Seed authority users
      const authorityUsers = [
        { email: 'pwd@kseb.localeyes.com', password: 'authority123', role: 'authority', department: 'PWD', name: 'PWD Authority' },
        { email: 'water@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Water', name: 'Water Authority' },
        { email: 'kseb@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'KSEB', name: 'KSEB Authority' },
        { email: 'waste@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Waste Management', name: 'Waste Management Authority' },
        { email: 'other@kerala.localeyes.com', password: 'authority123', role: 'authority', department: 'Other', name: 'Other Department Authority' },
      ];

      // Check if users already exist and insert if not
      authorityUsers.forEach(user => {
        db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
          if (err) {
            console.error('Error checking user:', err);
            return;
          }
          if (!row) {
            db.run(
              'INSERT INTO users (email, password, role, department, name) VALUES (?, ?, ?, ?, ?)',
              [user.email, user.password, user.role, user.department, user.name],
              function(err) {
                if (err) {
                  console.error('Error inserting user:', err);
                } else {
                  console.log(`Seeded authority user: ${user.email}`);
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
