const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const User = require('./User');
const Candidate = require('./Candidate');

class CandidateCv extends Model {}
CandidateCv.init({
    cv_id: {
        type: DataTypes.STRING,
        allowNull: false,
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
    cv_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cv_link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    modelName: 'CandidateCv',
    tableName: 'candidate_cvs',
    timestamps: false,
});
module.exports = CandidateCv;
