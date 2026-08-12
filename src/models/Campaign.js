const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Campaign = sequelize.define('Campaign', {
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    subject: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    sender_email: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    content: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    scheduled_at: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM('draft', 'scheduled', 'completed'), 
        defaultValue: 'draft' 
    }
}, {
    tableName: 'campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Campaign;