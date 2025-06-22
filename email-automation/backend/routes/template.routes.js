const express = require('express');
const router = express.Router();
const templateController = require('../controllers/template.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router
  .route('/')
  .get(templateController.getAllTemplates)
  .post(templateController.createTemplate);

router
  .route('/:id')
  .patch(templateController.updateTemplate)
  .delete(templateController.deleteTemplate);

module.exports = router; 