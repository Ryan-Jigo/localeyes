const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database-sqlite');
const authRoutes = require('./routes/auth-sqlite');
const issuesRoutes = require('./routes/issues-sqlite');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issuesRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LocalEyes API is running with SQLite' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 LocalEyes API server running on port ${PORT} with SQLite`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database: SQLite (localeyes.db)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
