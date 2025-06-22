const Template = require('../models/template.model');

// Get all templates for the logged-in user
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ user: req.user.id }).sort({ position: 1, name: 1 });
    res.status(200).json({ status: 'success', data: templates });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to get templates.' });
  }
};

// Create a new template
exports.createTemplate = async (req, res) => {
  try {
    const { name, subject, content, position } = req.body;
    const newTemplate = await Template.create({
      user: req.user.id,
      name,
      subject,
      content,
      position,
    });
    res.status(201).json({ status: 'success', data: newTemplate });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Update an existing template
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTemplate = await Template.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTemplate) {
      return res.status(404).json({ status: 'fail', message: 'Template not found.' });
    }
    res.status(200).json({ status: 'success', data: updatedTemplate });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await Template.findOneAndDelete({ _id: id, user: req.user.id });
    if (!template) {
      return res.status(404).json({ status: 'fail', message: 'Template not found.' });
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete template.' });
  }
}; 