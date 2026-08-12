const Campaign = require('../models/Campaign');
const Recipient = require('../models/Recipient');
const { Op } = require('sequelize');

exports.createCampaign = async (req, res, next) => {
    try {
        const { name, subject, sender_email, content, scheduled_at } = req.body;
        
        const campaign = await Campaign.create({
            name,
            subject,
            sender_email,
            content,
            scheduled_at,
            status: 'draft'
        });

        return res.status(201).json({ 
            success: true, 
            campaignId: campaign.id 
        });
    } catch (error) {
        next(error);
    }
};

exports.addRecipients = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { recipients } = req.body;

        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        for (const r of recipients) {
            if (!r.email || !emailRegex.test(r.email)) {
                return res.status(400).json({ success: false, error: `Invalid email address: ${r.email}` });
            }
            
            // Check if recipient already exists for this campaign to prevent duplicates
            const existing = await Recipient.findOne({ 
                where: { campaign_id: campaignId, email: r.email } 
            });

            if (!existing) {
                await Recipient.create({
                    campaign_id: campaignId,
                    name: r.name,
                    email: r.email
                });
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Recipients processed successfully' 
        });
    } catch (error) {
        next(error);
    }
};

exports.scheduleCampaign = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findByPk(campaignId);

        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }
        if (campaign.status !== 'draft') {
            return res.status(400).json({ success: false, error: 'Only draft campaigns can be scheduled' });
        }
        if (new Date(campaign.scheduled_at) <= new Date()) {
            return res.status(400).json({ success: false, error: 'Scheduled time must be in the future' });
        }

        const recipientCount = await Recipient.count({ where: { campaign_id: campaignId } });
        if (recipientCount === 0) {
            return res.status(400).json({ success: false, error: 'Campaign must have at least one recipient' });
        }

        campaign.status = 'scheduled';
        await campaign.save();

        return res.status(200).json({ 
            success: true, 
            message: 'Campaign scheduled successfully' 
        });
    } catch (error) {
        next(error);
    }
};

exports.processCampaigns = async (req, res, next) => {
    try {
        const scheduledCampaigns = await Campaign.findAll({ 
            where: { status: 'scheduled' } 
        });

        for (const camp of scheduledCampaigns) {
            const recipients = await Recipient.findAll({ 
                where: { campaign_id: camp.id, status: 'pending' } 
            });

            for (const rec of recipients) {
                rec.status = Math.random() > 0.5 ? 'delivered' : 'failed';
                await rec.save();
            }

            camp.status = 'completed';
            await camp.save();
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Scheduled campaigns processed successfully' 
        });
    } catch (error) {
        next(error);
    }
};

exports.listCampaigns = async (req, res, next) => {
    try {
        let { page = 1, limit = 10, status, search } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        let whereClause = {};
        if (status) whereClause.status = status;
        if (search) whereClause.name = { [Op.like]: `%${search}%` };

        const campaigns = await Campaign.findAll({
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({ 
            success: true, 
            data: campaigns 
        });
    } catch (error) {
        next(error);
    }
};

exports.getCampaignById = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const campaign = await Campaign.findByPk(campaignId);
        
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        return res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        next(error);
    }
};

exports.getStatistics = async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        
        const campaign = await Campaign.findByPk(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, error: 'Campaign not found' });
        }

        const total_recipients = await Recipient.count({ where: { campaign_id: campaignId } });
        const delivered_count = await Recipient.count({ where: { campaign_id: campaignId, status: 'delivered' } });
        const failed_count = await Recipient.count({ where: { campaign_id: campaignId, status: 'failed' } });
        const pending_count = await Recipient.count({ where: { campaign_id: campaignId, status: 'pending' } });

        return res.status(200).json({
            success: true,
            campaign,
            statistics: {
                total_recipients,
                delivered_count,
                failed_count,
                pending_count
            }
        });
    } catch (error) {
        next(error);
    }
};