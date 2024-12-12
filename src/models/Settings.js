const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Settings extends Model {}

Settings.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  theme: {
    type: DataTypes.STRING,
    field: 'theme',
    defaultValue: 'light'
  },
  language: {
    type: DataTypes.STRING,
    field: 'language',
    defaultValue: 'en'
  },
  timezone: {
    type: DataTypes.STRING,
    field: 'timezone',
    defaultValue: 'UTC'
  },
  dashboardLayout: {
    type: DataTypes.JSONB,
    field: 'dashboard_layout',
    allowNull: true
  },
  notifications: {
    type: DataTypes.JSONB,
    field: 'notifications',
    defaultValue: {
      enabled: true,
      refreshInterval: 300
    }
  },
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    field: 'email_notifications',
    defaultValue: true
  },
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    field: 'push_notifications',
    defaultValue: true
  },
  subscriptionAlerts: {
    type: DataTypes.BOOLEAN,
    field: 'subscription_alerts',
    defaultValue: true
  },
  securityAlerts: {
    type: DataTypes.BOOLEAN,
    field: 'security_alerts',
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Settings',
  tableName: 'settings',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] }
  ]
});

// Define associations
Settings.associate = (models) => {
  Settings.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = Settings;
