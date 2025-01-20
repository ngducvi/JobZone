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
}, {
    sequelize,
    modelName: 'Candidate',
    tableName: 'candidates',
    timestamps: false,
});

module.exports = Candidate;