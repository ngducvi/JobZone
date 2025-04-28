const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User');
const Company = require('./Company');


class RecruiterCompanies extends Model {}
RecruiterCompanies.init({
    recruiter_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    company_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id',
        },
    },
    status: {
        type: DataTypes.ENUM('pending','active','rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    
}, {
    sequelize,
    modelName: 'RecruiterCompanies',
    tableName: 'recruiter_companies',
    timestamps: false,
});

module.exports = RecruiterCompanies;
