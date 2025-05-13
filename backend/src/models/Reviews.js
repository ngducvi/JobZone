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
        defaultValue: DataTypes.NOW,
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
    helpful_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },
}, {
    sequelize,
    modelName: 'Reviews',
    tableName: 'reviews',
    timestamps: false,
});

// Define associations
Reviews.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

Reviews.belongsTo(Company, {
    foreignKey: 'company_id',
    as: 'company'
});

// Add reverse associations
User.hasMany(Reviews, {
    foreignKey: 'user_id',
    as: 'reviews'
});

Company.hasMany(Reviews, {
    foreignKey: 'company_id',
    as: 'reviews'
});

module.exports = Reviews;
