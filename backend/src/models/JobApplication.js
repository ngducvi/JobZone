const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Job = require('./Job');
const User = require('./User');


class JobApplication extends Model {}
JobApplication.init({
    application_id: {
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    resume: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Đang xét duyệt', 'Đã phỏng vấn', 'Đã nhận', 'Đã từ chối'),
        allowNull: false,
        defaultValue: 'Đang xét duyệt',
    },
    applied_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: false,
});

module.exports = JobApplication;
