const Campaign = require('../models/campaign.model');

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: campaigns
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    const { name, subject, template, recipients } = req.body;
    
    const campaign = await Campaign.create({
      user: req.user.id,
      name,
      subject,
      template,
      recipients
    });

    res.status(201).json({
      status: 'success',
      data: campaign
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: campaign
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!campaign) {
      return res.status(404).json({
        status: 'fail',
        message: 'Campaign not found'
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

exports.getCampaignStats = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id });
    
    const totalCampaigns = campaigns.length;
    let totalEmails = 0;
    let successfulSends = 0;
    let failedSends = 0;
    let activeCampaigns = 0;

    campaigns.forEach(campaign => {
      totalEmails += campaign.totalRecipients || 0;
      successfulSends += campaign.sentCount || 0;
      failedSends += campaign.failedCount || 0;
      if (campaign.status === 'in-progress' || campaign.status === 'draft') {
        activeCampaigns++;
      }
    });

    res.status(200).json({
      totalCampaigns,
      totalEmails,
      successfulSends,
      failedSends,
      activeCampaigns
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Could not fetch campaign stats.',
      error: error.message
    });
  }
}; 