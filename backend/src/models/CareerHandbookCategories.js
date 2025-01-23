const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //   
const CareerHandbook = require('./CareerHandbook');
const CategoriesPost = require('./CategoriesPost');
  
class CareerHandbookCategories extends Model {}
CareerHandbookCategories.init({
    post_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: CareerHandbook,
            key: 'post_id',
        },
    },
    category_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: CategoriesPost,
            key: 'category_id',
        },
    },
}, {
    sequelize,
    modelName: 'CareerHandbookCategories',
    tableName: 'career_handbook_categories',
    timestamps: false,
});

module.exports = CareerHandbookCategories;
