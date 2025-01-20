const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //  
const Job = require('./Job');
const Category = require('./Category');

class CategoriesJob extends Model {}
CategoriesJob.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    job_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Job,
            key: 'job_id',
        },
    },
    category_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Category,
            key: 'category_id',
        },
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'CategoriesJob',
    tableName: 'categories_job',
    timestamps: true,
});

module.exports = CategoriesJob;
