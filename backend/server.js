const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const credentialRoutes = require('./routes/credential.routes');
const campaignRoutes = require('./routes/campaign.routes');
const emailRoutes = require('./routes/email.routes');
const templateRoutes = require('./routes/template.routes');
const http = require('http');
const { Server } = require('socket.io');

// Connect to the database
connectDB();

const app = express();

// Trust proxy for production environments (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  // origin: 'https://email-automation-sigma.vercel.app', // replace with your actual frontend URL
  origin: 'http://localhost:3000', // replace with your actual frontend URL
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use a custom key generator that works with proxy headers
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  }
});
app.use('/api', limiter);

// Error handling middleware for file uploads
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'fail',
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'fail',
        message: 'Unexpected file field.'
      });
    }
  }
  next(error);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/templates', templateRoutes);

// Simple route for testing
app.get('/api/test', (req, res) => res.json({ msg: 'API is running...' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // You can restrict this to your frontend URL
    methods: ['GET', 'POST', 'DELETE']
  }
});
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});