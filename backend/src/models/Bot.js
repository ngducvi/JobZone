const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Supplier = require('./Supplier');

class Bot extends Model {}

Bot.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    default_input_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    default_output_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    input_rate:{
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    output_rate:{
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    supplier_id:{
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: Supplier,
            key: 'id',
        },
    },
    feature:{
        type: DataTypes.ENUM('text', 'image', 'audio', 'video','embedding'),
        allowNull: true,
        defaultValue: 'text',
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Bot',
    tableName: 'bots',
    timestamps: false,
});

module.exports = Bot;