const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');
const Skill = require('./Skill');

class CategorySkill extends Model {}

  
CategorySkill.init({
    category_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Category,
            key: 'category_id',
        },
    },
    skill_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Skill,
            key: 'skill_id',
        },
    },
}, {
    sequelize,
    modelName: 'CategorySkill',
    tableName: 'category_skills',
    timestamps: false,
});

module.exports = CategorySkill;
