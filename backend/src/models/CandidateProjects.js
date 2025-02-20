const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Candidate = require('./Candidate');

class CandidateProjects extends Model {}
CandidateProjects.init({
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
    project_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    technologies_used: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    project_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize,
    tableName: 'candidate_projects',
    timestamps: false,
    modelName: 'CandidateProjects',
});

module.exports = CandidateProjects;

