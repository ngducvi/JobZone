const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Conversation extends Model {}

Conversation.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    bot_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'bots',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    completed_at: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    last_error: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { code: 0, msg: "" },
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    method_used:{
        type: DataTypes.ENUM('website', 'api_key'),
        allowNull: false,
        defaultValue: 'website',
    }
}, {
    sequelize,
    modelName: 'Conversation',
    tableName: 'conversations',
    timestamps: false,
});

module.exports = Conversation;