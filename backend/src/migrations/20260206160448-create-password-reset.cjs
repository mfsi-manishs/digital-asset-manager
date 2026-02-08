"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("password_resets", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        field: "user_id",
      },
      tokenHash: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: "token_hash",
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: "expires_at",
      },
      // timestamps
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        field: "created_at",
      },
    });

    await queryInterface.addIndex("password_resets", ["expires_at"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("password_resets");
  },
};
