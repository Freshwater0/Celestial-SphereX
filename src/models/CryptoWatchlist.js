const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class CryptoWatchlist extends Model {}

CryptoWatchlist.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  symbol: {
    type: DataTypes.STRING,
    allowNull: false
  },
  alert_price_high: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  alert_price_low: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  alert_percent_change: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  is_favorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  last_price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  last_updated: {
    type: DataTypes.DATE,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CryptoWatchlist',
  tableName: 'crypto_watchlists',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['symbol'] }
  ]
});

class CryptoWatchlistHelper {
  static async findByUserId(userId, options = {}) {
    const { sortBy = 'symbol', sortOrder = 'asc', favorites = false } = options;

    const where = { user_id: userId };
    if (favorites) {
      where.is_favorite = true;
    }

    return CryptoWatchlist.findAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
  }

  static async findBySymbol(userId, symbol) {
    return CryptoWatchlist.findOne({
      where: {
        user_id: userId,
        symbol
      }
    });
  }

  static async create(data) {
    return CryptoWatchlist.create({
      user_id: data.user_id,
      symbol: data.symbol,
      alert_price_high: data.alert_price_high,
      alert_price_low: data.alert_price_low,
      alert_percent_change: data.alert_percent_change,
      is_favorite: data.is_favorite ?? false,
      notes: data.notes,
      last_price: data.last_price,
      last_updated: data.last_updated,
      settings: data.settings || {}
    });
  }

  static async update(id, data) {
    const updateData = {};
    
    if (data.symbol !== undefined) updateData.symbol = data.symbol;
    if (data.alert_price_high !== undefined) updateData.alert_price_high = data.alert_price_high;
    if (data.alert_price_low !== undefined) updateData.alert_price_low = data.alert_price_low;
    if (data.alert_percent_change !== undefined) updateData.alert_percent_change = data.alert_percent_change;
    if (data.is_favorite !== undefined) updateData.is_favorite = data.is_favorite;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.last_price !== undefined) updateData.last_price = data.last_price;
    if (data.last_updated !== undefined) updateData.last_updated = data.last_updated;
    if (data.settings !== undefined) updateData.settings = data.settings;

    return CryptoWatchlist.update(updateData, {
      where: { id }
    });
  }

  static async updatePrice(id, price) {
    return CryptoWatchlist.update({
      last_price: price,
      last_updated: new Date()
    }, {
      where: { id }
    });
  }

  static async delete(id) {
    return CryptoWatchlist.destroy({
      where: { id }
    });
  }

  static async deleteAllUserWatchlist(userId) {
    return CryptoWatchlist.destroy({
      where: { user_id: userId }
    });
  }

  static checkAlerts(watchlist, currentPrice) {
    const alerts = [];
    const price = parseFloat(currentPrice);
    
    if (watchlist.alert_price_high && price >= parseFloat(watchlist.alert_price_high)) {
      alerts.push({
        type: 'PRICE_HIGH',
        message: `${watchlist.symbol} has reached or exceeded your high price alert of ${watchlist.alert_price_high}`
      });
    }
    
    if (watchlist.alert_price_low && price <= parseFloat(watchlist.alert_price_low)) {
      alerts.push({
        type: 'PRICE_LOW',
        message: `${watchlist.symbol} has reached or fallen below your low price alert of ${watchlist.alert_price_low}`
      });
    }
    
    if (watchlist.alert_percent_change && watchlist.last_price) {
      const percentChange = ((price - parseFloat(watchlist.last_price)) / parseFloat(watchlist.last_price)) * 100;
      if (Math.abs(percentChange) >= parseFloat(watchlist.alert_percent_change)) {
        alerts.push({
          type: 'PERCENT_CHANGE',
          message: `${watchlist.symbol} has changed by ${percentChange.toFixed(2)}%, which exceeds your alert threshold of ${watchlist.alert_percent_change}%`
        });
      }
    }
    
    return alerts;
  }
}

// Export the Sequelize model
module.exports = CryptoWatchlist;
