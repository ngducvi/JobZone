const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class GiftCode extends Model { }
GiftCode.init(
    {
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        amount: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        is_used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        used_at: {
            type: DataTypes.DATE,
        },
        expired_at: {
            type: DataTypes.DATE,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        modelName: 'gift_code',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
)
module.exports = GiftCode;