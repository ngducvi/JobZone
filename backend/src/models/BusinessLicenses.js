const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Company = require('./Company');

class BusinessLicenses extends Model {}

BusinessLicenses.init({
    license_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id',
        },
    },
    business_license_file: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    business_license_status: {
        type: DataTypes.ENUM('pending','verified','rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    business_license_verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    business_license_verified_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tax_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    registration_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    license_issue_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    license_expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    contact_email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    contact_phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    founded_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'BusinessLicenses',
    tableName: 'business_licenses',
    timestamps: false,
});

module.exports = BusinessLicenses;
