const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Profile extends Model {}

Profile.init({
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
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'UTC'
  },
  notifications: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  dashboard_layout: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Profile',
  tableName: 'profiles',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] }
  ]
});

// Define associations
Profile.associate = (models) => {
  Profile.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = Profile;
