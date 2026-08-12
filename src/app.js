const express = require('express');
require('dotenv').config();
const sequelize = require('./config/db');
const campaignRoutes = require('./routes/campaignRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

// Base API route mounting
app.use('/api/campaigns', campaignRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Email Campaign API is running smoothly...' });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log('Database connected successfully.');
        return sequelize.sync({alter : true}); 
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

    process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});