const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Conversation = require('./Conversation');

class Messages extends Model {}

Messages.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    conversation_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Conversation,
            key: 'id',
        },
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Messages',
    tableName: 'messages',
    timestamps: false,
});

module.exports = Messages;