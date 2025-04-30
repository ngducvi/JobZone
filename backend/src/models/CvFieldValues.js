const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserCv = require('./UserCv');
const TemplateFields = require('./TemplateFields');

class CvFieldValues extends Model {}

CvFieldValues.init({
    value_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    cv_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: UserCv,
            key: 'cv_id',
        },
    },
    field_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: TemplateFields,
            key: 'field_id',
        },
    },
    field_value: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'CvFieldValues',
    tableName: 'cv_field_values',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CvFieldValues;
