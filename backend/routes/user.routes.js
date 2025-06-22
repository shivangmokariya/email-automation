const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', upload.single('avatar'), userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router; 