const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const User = require('./User');

class Candidate extends Model {}
Candidate.init({
    candidate_id: {
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
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    CV_link: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    skills: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    experience: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    qualifications: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    date_of_birth: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    marital_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    about_me: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    career_objective: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    current_job_title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    current_company: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expected_salary: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    current_salary: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    willing_to_relocate: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    preferred_work_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    employment_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notice_period: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    availability_status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_searchable: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    is_actively_searching: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    is_notification: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    is_message: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    industry:{
        type: DataTypes.STRING,
        allowNull: true,
    }

}, {
    sequelize,
    modelName: 'Candidate',
    tableName: 'candidates',
    timestamps: false,
});

module.exports = Candidate;