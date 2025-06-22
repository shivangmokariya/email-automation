const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/email-app',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  cryptoKey: process.env.CRYPTO_KEY || 'your-crypto-key',
  frontendURL: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendURL: process.env.BACKEND_URL || 'https://email-automation-purq.onrender.com',
}; 