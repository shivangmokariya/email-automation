const mongoose = require('mongoose');
const crypto = require('crypto');

const credentialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Credential must belong to a user.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide the email for the credential.'],
    trim: true,
  },
  appPassword: {
    type: String,
    required: [true, 'Please provide the app password.'],
  },
  provider: {
    type: String,
    enum: ['gmail', 'outlook', 'yahoo', 'other'],
    default: 'gmail',
  },
}, {
  timestamps: true,
});

// Encrypt appPassword before saving
credentialSchema.pre('save', function (next) {
  if (!this.isModified('appPassword')) return next();

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.CRYPTO_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(this.appPassword, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  this.appPassword = `${iv.toString('hex')}:${encrypted}`;
  next();
});

// Decrypt appPassword
credentialSchema.methods.getAppPassword = function () {
  const [iv, encryptedPassword] = this.appPassword.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.CRYPTO_KEY, 'hex'), Buffer.from(iv, 'hex'));

  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const Credential = mongoose.model('Credential', credentialSchema);

module.exports = Credential; 