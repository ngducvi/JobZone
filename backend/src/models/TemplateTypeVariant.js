const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const CvTemplates = require("./CvTemplates");
const TemplateTypes = require("./TemplateTypes");

class TemplateTypeVariant extends Model {}

TemplateTypeVariant.init(
  {
    variant_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    template_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: CvTemplates,
        key: "template_id",
      },
    },
    type_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: TemplateTypes,
        key: "type_id",
      },
    },
   
    variant_thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "TemplateTypeVariant",
    tableName: "template_type_variants",
    timestamps: false,
  }
);

module.exports = TemplateTypeVariant;
