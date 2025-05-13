const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    token_device: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    number_devices: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    plan: {
        type: DataTypes.ENUM('Basic', 'Pro', 'ProMax'),
        allowNull: false,
        defaultValue: 'Basic'
    },
    plan_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
});

module.exports = User;
