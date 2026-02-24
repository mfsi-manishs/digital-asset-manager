/**
 * @file create-api-keys.cjs
 * @fileoverview This file contains the create api keys migration
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("api_keys", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      keyHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "key_hash",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: "is_active",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "created_at",
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "updated_at",
      },
    });

    await queryInterface.addIndex("api_keys", ["key_hash"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("api_keys");
  },
};
