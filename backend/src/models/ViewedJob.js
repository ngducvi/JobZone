const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const User = require('./User');
const Job = require('./Job');

class ViewedJob extends Model {}
ViewedJob.init(
    {
        viewed_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
        viewed_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: 'viewed_jobs',
        modelName: 'ViewedJob',
        timestamps: false,
    }
);
module.exports = ViewedJob;


