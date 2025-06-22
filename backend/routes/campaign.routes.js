const express = require('express');
const campaignController = require('../controllers/campaign.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/stats', campaignController.getCampaignStats);
router.get('/', campaignController.getAllCampaigns);
router.post('/', campaignController.createCampaign);
router.get('/:id', campaignController.getCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router; 