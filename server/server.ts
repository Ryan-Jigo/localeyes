// Backend Express server for LOCALEYES
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sendEmailRoutes from './routes/sendEmail';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔍 Server Debug - GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
console.log('🔍 Server Debug - GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'Not set');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:3000'], // Allow frontend origins
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', sendEmailRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LOCALEYES Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LOCALEYES Backend Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.GMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 CORS enabled for: http://localhost:8080, http://localhost:3000`);
});

export default app;
