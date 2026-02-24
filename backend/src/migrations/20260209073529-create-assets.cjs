/**
 * @file create-assets.cjs
 * @fileoverview This file contains the create assets migration
 */

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("assets", {
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
      originalName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "original_name",
      },
      type: {
        type: Sequelize.ENUM("image", "video", "audio", "document", "other"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("pending", "uploading", "uploaded", "processing", "ready", "failed"),
        defaultValue: "uploaded",
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "mime_type",
      },
      size: {
        type: Sequelize.BIGINT,
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
      processingJobId: {
        type: Sequelize.STRING,
        field: "processing_job_id",
      },
      processingQueue: {
        type: Sequelize.STRING,
        field: "processing_queue",
      },
      processingAttempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "processing_attempts",
      },
      lastError: {
        type: Sequelize.TEXT,
        field: "last_error",
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        field: "metadata",
      },
      storage: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        field: "storage",
      },
      signedUrls: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        field: "signed_urls",
      },
    });

    await queryInterface.addIndex("assets", ["user_id", "type", "status"]);
    await queryInterface.addIndex("assets", ["user_id", "status"]);
    await queryInterface.addIndex("assets", ["metadata"], { using: "GIN" });
    await queryInterface.addIndex("assets", ["storage"], { using: "GIN" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("assets");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assets_status";');
  },
};
