const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Candidate = require('./Candidate');


class CandidateEducation extends Model {}
CandidateEducation.init({
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
    institution: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    degree: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    field_of_study: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    activities: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'candidate_education',
    timestamps: false,
    modelName: 'CandidateEducation',
});

module.exports = CandidateEducation;

