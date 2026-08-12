const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Campaign = require('./Campaign');

const Recipient = sequelize.define('Recipient', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM('pending', 'delivered', 'failed'), 
        defaultValue: 'pending' 
    }
}, {
    tableName: 'recipients',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Relationships
Campaign.hasMany(Recipient, { foreignKey: 'campaign_id', onDelete: 'CASCADE' });
Recipient.belongsTo(Campaign, { foreignKey: 'campaign_id' });

module.exports = Recipient;