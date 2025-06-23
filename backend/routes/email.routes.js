const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../utils/upload');

router.post('/send-single', protect, upload.single('resume'), emailController.sendSingleEmail);
router.post('/send-bulk', protect, upload.single('resume'), emailController.sendBulkEmail);

// AI endpoints
router.post('/ai/personalize-email', aiController.personalizeEmail);
router.post('/ai/chat', aiController.chatWithAI);
router.get('/ai/recent-chats', protect, aiController.getRecentChats);
router.post('/ai/create-chat', protect, aiController.createChat);
router.delete('/ai/empty-chat/:chatId', protect, aiController.deleteEmptyChat);
router.get('/ai/chat-messages/:chatId', protect, aiController.getChatMessages);
router.patch('/ai/rename-chat/:chatId', protect, aiController.renameChat);
router.delete('/ai/delete-chat/:chatId', protect, aiController.deleteChat);

module.exports = router; 