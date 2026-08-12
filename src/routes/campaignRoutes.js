const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/', verifyToken, campaignController.createCampaign);
router.post('/:campaignId/recipients', verifyToken, campaignController.addRecipients);
router.post('/:campaignId/schedule', verifyToken, campaignController.scheduleCampaign);
router.post('/process', verifyToken, campaignController.processCampaigns);
router.get('/', verifyToken, campaignController.listCampaigns);
router.get('/:campaignId', verifyToken, campaignController.getCampaignById);
router.get('/:campaignId/statistics', verifyToken, campaignController.getStatistics);

module.exports = router;