const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Candidate = require('./Candidate');

class CandidateLanguages extends Model {}
CandidateLanguages.init({
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    candidate_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Candidate,
            key: 'candidate_id',
        },
    },
    language: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    proficiency: {
        type: DataTypes.ENUM('Basic', 'Intermediate', 'Advanced', 'Native'),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'candidate_languages',
    modelName: 'CandidateLanguages',
    timestamps: false,
});

module.exports = CandidateLanguages;
