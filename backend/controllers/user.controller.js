const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      bio,
      title,
      company,
      location,
      website,
      linkedin,
      github
    } = req.body;
    
    const userId = req.user.id;
    const updateData = {
      name,
      email,
      phone,
      bio,
      title,
      company,
      location,
      website,
      linkedin,
      github
    };

    // Handle avatar upload if file exists
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
      
      // Delete old avatar if exists
      const currentUser = await User.findById(userId);
      if (currentUser.avatar && currentUser.avatar !== '/uploads/default-avatar.png') {
        const oldAvatarPath = path.join(__dirname, '..', currentUser.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const userId = req.user.id;
    const avatarPath = `/uploads/${req.file.filename}`;

    // Delete old avatar if exists
    const currentUser = await User.findById(userId);
    if (currentUser.avatar && currentUser.avatar !== '/uploads/default-avatar.png') {
      const oldAvatarPath = path.join(__dirname, '..', currentUser.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 