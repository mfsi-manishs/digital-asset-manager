/**
 * @file create-users.cjs
 * @fileoverview This file contains the create users migration
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(128),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(128),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.STRING(128),
        allowNull: false,
        field: "password_hash",
      },
      role: {
        type: Sequelize.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "last_login_at",
      },
      loginAttempts: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
        field: "login_attempts",
      },
      lockUntil: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "lock_until",
      },
      // timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "updated_at",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};
