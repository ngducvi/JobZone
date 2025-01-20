const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CvTemplates = require('./CvTemplates');

class TemplateFields extends Model {}

TemplateFields.init({
    field_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    template_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: CvTemplates,
            key: 'template_id',
        },
    },
    field_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    field_type: {
        type: DataTypes.ENUM('text', 'textarea', 'date', 'image', 'rich_text'),
        allowNull: false,
    },
    field_label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    field_placeholder: {
        type: DataTypes.TEXT,
    },
    field_order: {
        type: DataTypes.INTEGER,
    },
    section_name: {
        type: DataTypes.STRING,
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'TemplateFields',
    tableName: 'template_fields',
    timestamps: false,
});

module.exports = TemplateFields;
