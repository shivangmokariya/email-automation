const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    config.jwtSecret, 
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide name, email, and password.' });
    }

    const newUser = await User.create({ name, email, password });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password.' });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login.',
    });
  }
};

exports.forgotPassword = async (req, res) => {
    try {
        // 1) Get user based on POSTed email
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'There is no user with that email address.' });
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // 3) Send it to user's email with frontend URL
        const resetURL = `${config.frontendURL}/reset-password/${resetToken}`;

        const message = `Forgot your password? Click the link below to reset your password:\n\n${resetURL}\n\nThis link is valid for 10 minutes.\nIf you didn't forget your password, please ignore this email!`;

        await sendEmail({
            email: user.email,
            subject: 'Your password reset link (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Password reset link sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ status: 'error', message: 'There was an error sending the email. Try again later.' });
    }
};

exports.validateResetToken = async (req, res) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                status: 'fail', 
                message: 'Token is invalid or has expired',
                valid: false
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Token is valid',
            valid: true
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Something went wrong!',
            valid: false
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        // 2) If token has not expired, and there is a user, set the new password
        if (!user) {
            return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 3) Log the user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Something went wrong!' });
    }
}; 