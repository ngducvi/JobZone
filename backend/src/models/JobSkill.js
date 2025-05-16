const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Job = require('./Job');
const Skill = require('./Skill');

class JobSkill extends Model {}

JobSkill.init({
    job_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Job,
            key: 'job_id',
        },
    },
    skill_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: Skill,
            key: 'skill_id',
        },
    },
}, {
    sequelize,
    modelName: 'JobSkill',
    tableName: 'job_skills',
    timestamps: false,
});

module.exports = JobSkill;
