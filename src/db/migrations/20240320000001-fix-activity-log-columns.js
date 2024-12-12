const { QueryInterface } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_logs'`
      );

      // Helper function to check if column exists
      const hasColumn = (columnName) => 
        columns.some(col => col.column_name === columnName);

      // Rename columns if they exist
      if (hasColumn('action'))
        await queryInterface.renameColumn('activity_logs', 'action', 'activity_type', { transaction });
      if (hasColumn('entityType'))
        await queryInterface.renameColumn('activity_logs', 'entityType', 'entity_type', { transaction });
      if (hasColumn('entityId'))
        await queryInterface.renameColumn('activity_logs', 'entityId', 'entity_id', { transaction });
      if (hasColumn('ipAddress'))
        await queryInterface.renameColumn('activity_logs', 'ipAddress', 'ip_address', { transaction });
      if (hasColumn('userAgent'))
        await queryInterface.renameColumn('activity_logs', 'userAgent', 'user_agent', { transaction });
      if (hasColumn('createdAt'))
        await queryInterface.renameColumn('activity_logs', 'createdAt', 'created_at', { transaction });
      if (hasColumn('updatedAt'))
        await queryInterface.renameColumn('activity_logs', 'updatedAt', 'updated_at', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_logs'`
      );

      // Helper function to check if column exists
      const hasColumn = (columnName) => 
        columns.some(col => col.column_name === columnName);

      // Rename columns back if they exist
      if (hasColumn('activity_type'))
        await queryInterface.renameColumn('activity_logs', 'activity_type', 'action', { transaction });
      if (hasColumn('entity_type'))
        await queryInterface.renameColumn('activity_logs', 'entity_type', 'entityType', { transaction });
      if (hasColumn('entity_id'))
        await queryInterface.renameColumn('activity_logs', 'entity_id', 'entityId', { transaction });
      if (hasColumn('ip_address'))
        await queryInterface.renameColumn('activity_logs', 'ip_address', 'ipAddress', { transaction });
      if (hasColumn('user_agent'))
        await queryInterface.renameColumn('activity_logs', 'user_agent', 'userAgent', { transaction });
      if (hasColumn('created_at'))
        await queryInterface.renameColumn('activity_logs', 'created_at', 'createdAt', { transaction });
      if (hasColumn('updated_at'))
        await queryInterface.renameColumn('activity_logs', 'updated_at', 'updatedAt', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
