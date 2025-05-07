const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User');

class Notifications extends Model { }

Notifications.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM(
            
            'account_verification',    // Duyệt tài khoản thành công
            'job_application',         // Ứng viên nộp đơn ứng tuyển
            'application_response',    // Nhà tuyển dụng phản hồi đơn ứng tuyển
            'application_cancelled',   // Ứng viên hủy đơn ứng tuyển
            'job_closed',             // Công việc đã đóng/hết hạn
            'cv_reviewed',            // CV được duyệt/từ chối
            'payment_success',        // Thanh toán thành công
            'payment_failed',         // Thanh toán thất bại
            'subscription_expiring',  // Gói dịch vụ sắp hết hạn
            'subscription_expired',   // Gói dịch vụ đã hết hạn
            'company_review',         // Có đánh giá mới về công ty
            'system',                 // Thông báo hệ thống khác
            'new_message'             // Tin nhắn mới
        ),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'Notifications',
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

module.exports = Notifications;

