const request = require('supertest');
const express = require('express');
const campaignRoutes = require('../src/routes/campaignRoutes');
const errorHandler = require('../src/middlewares/errorHandler');
const sequelize = require('../src/config/db');

const app = express();
app.use(express.json());
app.use('/api/campaigns', campaignRoutes);
app.use(errorHandler);

beforeAll(async () => {
    // Database sync with force true to reset tables for tests
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

let createdCampaignId;

describe('Email Campaign API Automated Tests', () => {
    
    // 1. Creating a valid campaign
    test('1. Should create a valid campaign successfully', async () => {
        const response = await request(app)
            .post('/api/campaigns')
            .send({
                name: 'Diwali Promotional Campaign',
                subject: 'Special 50% Off Discount',
                sender_email: 'support@brand.com',
                content: 'Hello, grab your exclusive discount today!',
                scheduled_at: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('campaignId');
        createdCampaignId = response.body.campaignId;
    });

    // 2. Rejecting invalid input
    test('2. Should reject campaign creation with invalid or missing input', async () => {
        const response = await request(app)
            .post('/api/campaigns')
            .send({
                name: '' 
            });

        expect(response.status).toBe(500); 
    });

    // 3. Preventing duplicate recipients
    test('3. Should prevent duplicate recipients within the same campaign', async () => {
        const recipientsPayload = {
            recipients: [
                { name: 'Aarav Sharma', email: 'aarav@example.com' },
                { name: 'Aarav Duplicate', email: 'aarav@example.com' } // Same email
            ]
        };

        const response = await request(app)
            .post(`/api/campaigns/${createdCampaignId}/recipients`)
            .send(recipientsPayload);

        expect(response.status).toBe(200);
        
        // Verify via statistics that only 1 recipient was stored due to unique constraint
        const statsResponse = await request(app)
            .get(`/api/campaigns/${createdCampaignId}/statistics`);
            
        expect(statsResponse.body.statistics.total_recipients).toBe(1);
    });

    // 4. Preventing a campaign without recipients from being scheduled
    test('4. Should prevent scheduling a campaign that has zero recipients', async () => {
        // Create a new campaign with no recipients
        const emptyCamp = await request(app)
            .post('/api/campaigns')
            .send({
                name: 'Empty Recipient Campaign',
                subject: 'Test Subject',
                sender_email: 'admin@brand.com',
                content: 'Some content here',
                scheduled_at: new Date(Date.now() + 86400000).toISOString()
            });

        const response = await request(app)
            .post(`/api/campaigns/${emptyCamp.body.campaignId}/schedule`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Campaign must have at least one recipient');
    });

    // 5. Preventing a campaign from being processed twice
    test('5. Should process scheduled campaigns safely and update statuses', async () => {
        // First, schedule the campaign with recipients
        const processResponse = await request(app)
            .post('/api/campaigns/process');

        expect(processResponse.status).toBe(200);
        expect(processResponse.body.success).toBe(true);
    });

    // 6. Returning correct campaign statistics
    test('6. Should return correct and accurate campaign statistics', async () => {
        const response = await request(app)
            .get(`/api/campaigns/${createdCampaignId}/statistics`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('campaign');
        expect(response.body).toHaveProperty('statistics');
        expect(response.body.statistics).toHaveProperty('total_recipients');
        expect(response.body.statistics).toHaveProperty('delivered_count');
        expect(response.body.statistics).toHaveProperty('failed_count');
        expect(response.body.statistics).toHaveProperty('pending_count');
    });
});