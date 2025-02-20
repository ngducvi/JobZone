const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Candidate = require('./Candidate');


class CandidateCertifications extends Model {}
CandidateCertifications.init({
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
    certification_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    issuing_organization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    issue_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    credential_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    credential_url: {
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
    tableName: 'candidate_certifications',
    timestamps: false,
    modelName: 'CandidateCertifications',
});

module.exports = CandidateCertifications;


