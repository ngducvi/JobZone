const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {}

Category.init({
    category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    last_modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    parent_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1

    }  
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'last_modified_at',
});

module.exports = Category;
