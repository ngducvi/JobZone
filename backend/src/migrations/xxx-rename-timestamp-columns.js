'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('categories', 'created_at', 'createdAt');
    await queryInterface.renameColumn('categories', 'last_modified_at', 'updatedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('categories', 'createdAt', 'created_at');
    await queryInterface.renameColumn('categories', 'updatedAt', 'last_modified_at');
  }
}; 