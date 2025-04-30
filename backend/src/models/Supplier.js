const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Supplier extends Model {}

Supplier.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    base_url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    api_key:{
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: false,
});

module.exports = Supplier;