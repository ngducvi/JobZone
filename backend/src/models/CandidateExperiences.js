const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Candidate = require('./Candidate');

class CandidateExperiences extends Model {}
CandidateExperiences.init({
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
    company_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    job_title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    job_description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    achievements: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    tableName: 'candidate_experiences',
    timestamps: false,
    modelName: 'CandidateExperiences',
});

module.exports = CandidateExperiences;

