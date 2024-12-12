const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Widget extends Model {}

Widget.init({
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
  widget_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  position_x: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  position_y: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  width: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  height: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  config_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Widget',
  tableName: 'widgets',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] }
  ]
});

module.exports = Widget;
