const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Job = require('./Job');

class SavedJob extends Model {}

SavedJob.init({
    saved_id: {
        type: DataTypes.STRING,
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
    job_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Job,
            key: 'job_id',
        },
    },
    saved_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'SavedJob',
    tableName: 'saved_jobs',
    timestamps: false,
});

module.exports = SavedJob;
