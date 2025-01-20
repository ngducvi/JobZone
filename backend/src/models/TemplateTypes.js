const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TemplateTypes extends Model {}

TemplateTypes.init({
    type_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    type_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type_description: {
        type: DataTypes.TEXT,
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
    modelName: 'TemplateTypes',
    tableName: 'template_types',
    timestamps: false,
});

module.exports = TemplateTypes;