const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.get('/validate-reset-token/:token', authController.validateResetToken);
router.patch('/reset-password/:token', authController.resetPassword);

module.exports = router; 