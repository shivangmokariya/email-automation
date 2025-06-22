const express = require('express');
const credentialController = require('../controllers/credential.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/', credentialController.getAllCredentials);
router.post('/', credentialController.createCredential);
router.get('/:id', credentialController.getCredential);
router.delete('/:id', credentialController.deleteCredential);

module.exports = router; 