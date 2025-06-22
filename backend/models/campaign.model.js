const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Campaign must belong to a user.'],
  },
  name: {
    type: String,
    required: [true, 'Campaign must have a name.'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Campaign must have a subject.'],
  },
  template: {
    type: String,
    required: [true, 'Campaign must have a template.'],
  },
  recipients: [{
    email: String,
    name: String,
    company: String,
    position: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    error: String,
    sentAt: Date,
    messageId: String,
  }],
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed', 'failed'],
    default: 'draft',
  },
  totalRecipients: {
    type: Number,
    default: 0,
  },
  sentCount: {
    type: Number,
    default: 0,
  },
  failedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

campaignSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('recipients')) {
    this.totalRecipients = this.recipients.length;
  }
  next();
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign; 