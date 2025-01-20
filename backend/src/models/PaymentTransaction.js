const { Model, DataTypes, BIGINT } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User');

class PaymentTransaction extends Model {}

PaymentTransaction.init({
    id: {
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
    amount: {
        type: BIGINT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING'
    },
    bank_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    transaction_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PAYMENT'
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'PaymentTransaction',
    tableName: 'payment_transactions',
    timestamps: false,
});

module.exports = PaymentTransaction;
