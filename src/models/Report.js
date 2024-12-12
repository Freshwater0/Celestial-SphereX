const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Report extends Model {}

Report.init({
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Report',
  tableName: 'reports',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] }
  ]
});

module.exports = Report;
