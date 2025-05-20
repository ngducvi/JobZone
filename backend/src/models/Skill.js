const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Skill extends Model { }

Skill.init({
    skill_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    skill_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
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
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize,
    modelName: 'Skill',
    tableName: 'skills',
    timestamps: false,
});

module.exports = Skill;

