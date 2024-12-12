const { Model, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

class Subscription extends Model {
  static associate(models) {
    this.belongsTo(models.User, { 
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  }
}

Subscription.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow null initially
    references: {
      model: 'users',
      key: 'id'
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  paypalOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  paypalSubscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'cancelled', 'past_due'),
    defaultValue: 'pending'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trialPeriod: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  planType: {
    type: DataTypes.ENUM('basic', 'pro', 'enterprise'),
    defaultValue: 'basic'
  },
  registrationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tokenExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Subscription',
  tableName: 'subscriptions',
  timestamps: true
});

module.exports = Subscription;
