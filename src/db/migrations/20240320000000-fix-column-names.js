const { QueryInterface } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns for each table
      const [cryptoColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'crypto_watchlists'`
      );
      const [settingsColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`
      );
      const [widgetColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'widgets'`
      );

      // Helper function to check if column exists
      const hasColumn = (columns, columnName) => 
        columns.some(col => col.column_name === columnName);

      // CryptoWatchlist table
      if (hasColumn(cryptoColumns, 'isFavorite'))
        await queryInterface.renameColumn('crypto_watchlists', 'isFavorite', 'is_favorite', { transaction });
      if (hasColumn(cryptoColumns, 'alertPriceHigh'))
        await queryInterface.renameColumn('crypto_watchlists', 'alertPriceHigh', 'alert_price_high', { transaction });
      if (hasColumn(cryptoColumns, 'alertPriceLow'))
        await queryInterface.renameColumn('crypto_watchlists', 'alertPriceLow', 'alert_price_low', { transaction });
      if (hasColumn(cryptoColumns, 'alertPercentChange'))
        await queryInterface.renameColumn('crypto_watchlists', 'alertPercentChange', 'alert_percent_change', { transaction });
      if (hasColumn(cryptoColumns, 'lastPrice'))
        await queryInterface.renameColumn('crypto_watchlists', 'lastPrice', 'last_price', { transaction });
      if (hasColumn(cryptoColumns, 'lastUpdated'))
        await queryInterface.renameColumn('crypto_watchlists', 'lastUpdated', 'last_updated', { transaction });

      // Settings table
      if (hasColumn(settingsColumns, 'defaultView'))
        await queryInterface.renameColumn('settings', 'defaultView', 'default_view', { transaction });
      if (hasColumn(settingsColumns, 'refreshInterval'))
        await queryInterface.renameColumn('settings', 'refreshInterval', 'refresh_interval', { transaction });
      if (hasColumn(settingsColumns, 'notificationEnabled'))
        await queryInterface.renameColumn('settings', 'notificationEnabled', 'notification_enabled', { transaction });
      if (hasColumn(settingsColumns, 'darkMode'))
        await queryInterface.renameColumn('settings', 'darkMode', 'dark_mode', { transaction });

      // Widget table
      if (hasColumn(widgetColumns, 'widgetType'))
        await queryInterface.renameColumn('widgets', 'widgetType', 'widget_type', { transaction });
      if (hasColumn(widgetColumns, 'positionX'))
        await queryInterface.renameColumn('widgets', 'positionX', 'position_x', { transaction });
      if (hasColumn(widgetColumns, 'positionY'))
        await queryInterface.renameColumn('widgets', 'positionY', 'position_y', { transaction });
      if (hasColumn(widgetColumns, 'configData'))
        await queryInterface.renameColumn('widgets', 'configData', 'config_data', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get existing columns for each table
      const [cryptoColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'crypto_watchlists'`
      );
      const [settingsColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'settings'`
      );
      const [widgetColumns] = await queryInterface.sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'widgets'`
      );

      // Helper function to check if column exists
      const hasColumn = (columns, columnName) => 
        columns.some(col => col.column_name === columnName);

      // CryptoWatchlist table
      if (hasColumn(cryptoColumns, 'is_favorite'))
        await queryInterface.renameColumn('crypto_watchlists', 'is_favorite', 'isFavorite', { transaction });
      if (hasColumn(cryptoColumns, 'alert_price_high'))
        await queryInterface.renameColumn('crypto_watchlists', 'alert_price_high', 'alertPriceHigh', { transaction });
      if (hasColumn(cryptoColumns, 'alert_price_low'))
        await queryInterface.renameColumn('crypto_watchlists', 'alert_price_low', 'alertPriceLow', { transaction });
      if (hasColumn(cryptoColumns, 'alert_percent_change'))
        await queryInterface.renameColumn('crypto_watchlists', 'alert_percent_change', 'alertPercentChange', { transaction });
      if (hasColumn(cryptoColumns, 'last_price'))
        await queryInterface.renameColumn('crypto_watchlists', 'last_price', 'lastPrice', { transaction });
      if (hasColumn(cryptoColumns, 'last_updated'))
        await queryInterface.renameColumn('crypto_watchlists', 'last_updated', 'lastUpdated', { transaction });

      // Settings table
      if (hasColumn(settingsColumns, 'default_view'))
        await queryInterface.renameColumn('settings', 'default_view', 'defaultView', { transaction });
      if (hasColumn(settingsColumns, 'refresh_interval'))
        await queryInterface.renameColumn('settings', 'refresh_interval', 'refreshInterval', { transaction });
      if (hasColumn(settingsColumns, 'notification_enabled'))
        await queryInterface.renameColumn('settings', 'notification_enabled', 'notificationEnabled', { transaction });
      if (hasColumn(settingsColumns, 'dark_mode'))
        await queryInterface.renameColumn('settings', 'dark_mode', 'darkMode', { transaction });

      // Widget table
      if (hasColumn(widgetColumns, 'widget_type'))
        await queryInterface.renameColumn('widgets', 'widget_type', 'widgetType', { transaction });
      if (hasColumn(widgetColumns, 'position_x'))
        await queryInterface.renameColumn('widgets', 'position_x', 'positionX', { transaction });
      if (hasColumn(widgetColumns, 'position_y'))
        await queryInterface.renameColumn('widgets', 'position_y', 'positionY', { transaction });
      if (hasColumn(widgetColumns, 'config_data'))
        await queryInterface.renameColumn('widgets', 'config_data', 'configData', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
