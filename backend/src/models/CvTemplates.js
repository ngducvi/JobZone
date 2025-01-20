const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
class CvTemplates extends Model {}

CvTemplates.init(
  {
    template_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    template_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    template_html: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    template_css: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    template_thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CvTemplates",
    tableName: "cv_templates",
    timestamps: false,
  }
);

module.exports = CvTemplates;
