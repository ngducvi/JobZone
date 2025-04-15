const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming you have a sequelize instance setup
const User = require('./User');
const CvTemplate = require('./CvTemplates');

class UserCv extends Model {}

UserCv.init({
    cv_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    template_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: CvTemplate,
            key: 'template_id',
        },
    },
    cv_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cv_content: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    cv_html: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        allowNull: false,
        defaultValue: 'draft',
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'UserCv',
    tableName: 'user_cvs',
    timestamps: false,
});

module.exports = UserCv;
