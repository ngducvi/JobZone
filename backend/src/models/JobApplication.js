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
        // ENUM('Đang xét duyệt', 'Chờ phỏng vấn', 'Đã phỏng vấn', 'Đạt phỏng vấn', 'Đã nhận', 'Đã từ chối', 'Hết hạn','Đã rút đơn')
        type: DataTypes.ENUM('Đang xét duyệt', 'Chờ phỏng vấn', 'Đã phỏng vấn', 'Đạt phỏng vấn', 'Đã nhận', 'Đã từ chối', 'Hết hạn','Đã rút đơn'),
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
    resume_type: {
        type: DataTypes.ENUM('uploaded', 'created'),
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: false,
});

module.exports = JobApplication;
