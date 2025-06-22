const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');

router.post('/send-single', protect, upload.single('resume'), emailController.sendSingleEmail);
router.post('/send-bulk', protect, upload.single('resume'), emailController.sendBulkEmail);

module.exports = router; 