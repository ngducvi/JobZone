const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
class Conversation extends Model {}

Conversation.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    last_message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    last_message_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    unread_count_user1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    unread_count_user2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: false,
});

module.exports = Conversation;