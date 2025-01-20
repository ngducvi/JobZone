const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User'); // Import User model for relation
const Bot = require('./Bot');
const Conversation = require('./Conversation');

class TokenUsage extends Model {}

TokenUsage.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    conversation_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Conversation,
            key: 'id',
        },
    },
    token_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bot_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Bot,
            key: 'id',
        },
    },
    output_count: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    input_count: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    usage_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'TokenUsage',
    tableName: 'token_usages',
    timestamps: false,
});

module.exports = TokenUsage;
