const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Template must belong to a user.'],
  },
  name: {
    type: String,
    required: [true, 'Template must have a name.'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Template must have a subject.'],
  },
  content: {
    type: String,
    required: [true, 'Template must have content.'],
  },
  position: {
    type: String,
    required: [true, 'Template must be associated with a position.'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure a user cannot have multiple templates with the same name for the same position
templateSchema.index({ user: 1, position: 1, name: 1 }, { unique: true });

const Template = mongoose.model('Template', templateSchema);

module.exports = Template; 