const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CvCategories extends Model {}

CvCategories.init({
    category_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    category_icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    display_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    sequelize,
    modelName: 'CvCategories',
    tableName: 'cv_categories',
    timestamps: false,
});

module.exports = CvCategories;