const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database"); //

class CategoriesPost extends Model {}
CategoriesPost.init(
  {
    category_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    category_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "CategoriesPost",
    tableName: "categories_post",
    timestamps: false,
  }
);

module.exports = CategoriesPost;
