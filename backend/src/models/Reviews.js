const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User');
const Company = require('./Company');


class Reviews extends Model {}
Reviews.init({
    review_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    company_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id',
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },  
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    review_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_modified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_modified_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Reviews',
    tableName: 'reviews',
    timestamps: false,
});

module.exports = Reviews;
