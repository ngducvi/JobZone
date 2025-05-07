const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Company extends Model {}

Company.init({
    company_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_modified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_modified_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_emp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    banner: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    plan: {
        type: DataTypes.ENUM('Basic', 'Pro', 'ProMax'),
        allowNull: false,
        defaultValue: 'Basic'
    },
    plan_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    timestamps: false,

});

module.exports = Company;