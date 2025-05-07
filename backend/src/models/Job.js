const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); //
const Company = require('./Company');
const Category = require('./Category');


class Job extends Model {}

Job.init({
    job_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    salary: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    experience: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    benefits: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    job_requirements: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    working_time: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    working_location: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Closed','Pending'),
        defaultValue: 'Pending',
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Company,
            key: 'company_id',
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Category,
            key: 'category_id',
        },
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    job_embedding: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_modified_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_modified_by: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    rank: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    education: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: false,
});

module.exports = Job;