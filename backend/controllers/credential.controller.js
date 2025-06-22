const Credential = require('../models/credential.model');

exports.getAllCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find({ user: req.user.id });
    
    res.status(200).json({
      status: 'success',
      data: credentials
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.createCredential = async (req, res) => {
  try {
    const { email, appPassword, provider } = req.body;

    if (!req.user?.id || !email || !appPassword || !provider) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }

    console.log({
      user: req.user.id,
      email,
      appPassword,
      provider
    });

    const credential = await Credential.create({
      user: req.user.id,
      email,
      appPassword,
      provider
    });

    res.status(201).json({
      status: 'success',
      data: credential
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteCredential = async (req, res) => {
  try {
    const credential = await Credential.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!credential) {
      return res.status(404).json({
        status: 'fail',
        message: 'Credential not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getCredential = async (req, res) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!credential) {
      return res.status(404).json({
        status: 'fail',
        message: 'Credential not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: credential
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 