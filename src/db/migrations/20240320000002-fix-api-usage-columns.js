const { QueryInterface } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns
      const [columns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'api_usage'`
      );

      // Helper function to check if column exists
      const hasColumn = (columnName) => 
        columns.some(col => col.column_name === columnName);

      // Rename columns if they exist
      if (hasColumn('statusCode'))
        await queryInterface.renameColumn('api_usage', 'statusCode', 'status_code', { transaction });
      if (hasColumn('responseTime'))
        await queryInterface.renameColumn('api_usage', 'responseTime', 'response_time', { transaction });
      if (hasColumn('ipAddress'))
        await queryInterface.renameColumn('api_usage', 'ipAddress', 'ip_address', { transaction });
      if (hasColumn('userAgent'))
        await queryInterface.renameColumn('api_usage', 'userAgent', 'user_agent', { transaction });
      if (hasColumn('requestBody'))
        await queryInterface.renameColumn('api_usage', 'requestBody', 'request_body', { transaction });
      if (hasColumn('responseBody'))
        await queryInterface.renameColumn('api_usage', 'responseBody', 'response_body', { transaction });
      if (hasColumn('rateLimit'))
        await queryInterface.renameColumn('api_usage', 'rateLimit', 'rate_limit', { transaction });
      if (hasColumn('createdAt'))
        await queryInterface.renameColumn('api_usage', 'createdAt', 'created_at', { transaction });
      if (hasColumn('updatedAt'))
        await queryInterface.renameColumn('api_usage', 'updatedAt', 'updated_at', { transaction });

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
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'api_usage'`
      );

      // Helper function to check if column exists
      const hasColumn = (columnName) => 
        columns.some(col => col.column_name === columnName);

      // Rename columns back if they exist
      if (hasColumn('status_code'))
        await queryInterface.renameColumn('api_usage', 'status_code', 'statusCode', { transaction });
      if (hasColumn('response_time'))
        await queryInterface.renameColumn('api_usage', 'response_time', 'responseTime', { transaction });
      if (hasColumn('ip_address'))
        await queryInterface.renameColumn('api_usage', 'ip_address', 'ipAddress', { transaction });
      if (hasColumn('user_agent'))
        await queryInterface.renameColumn('api_usage', 'user_agent', 'userAgent', { transaction });
      if (hasColumn('request_body'))
        await queryInterface.renameColumn('api_usage', 'request_body', 'requestBody', { transaction });
      if (hasColumn('response_body'))
        await queryInterface.renameColumn('api_usage', 'response_body', 'responseBody', { transaction });
      if (hasColumn('rate_limit'))
        await queryInterface.renameColumn('api_usage', 'rate_limit', 'rateLimit', { transaction });
      if (hasColumn('created_at'))
        await queryInterface.renameColumn('api_usage', 'created_at', 'createdAt', { transaction });
      if (hasColumn('updated_at'))
        await queryInterface.renameColumn('api_usage', 'updated_at', 'updatedAt', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
