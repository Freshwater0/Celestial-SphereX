const { Model, DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

class Session extends Model {
  static async create(data) {
    return this.create({
      user_id: data.user_id,
      token: data.token,
      device_info: data.device_info,
      ip_address: data.ip_address,
      user_agent: data.user_agent,
      is_active: data.is_active ?? true,
      expires_at: data.expires_at,
      last_active: data.last_active ?? new Date()
    });
  }

  static async findByToken(token) {
    return this.findOne({
      where: { token }
    });
  }

  static async invalidateAllUserSessions(userId) {
    return this.update(
      { is_active: false },
      { 
        where: { 
          user_id: userId,
          is_active: true
        }
      }
    );
  }

  static async cleanup() {
    const now = new Date();
    return this.destroy({
      where: {
        [Op.or]: [
          { expires_at: { [Op.lt]: now } },
          { is_active: false }
        ]
      }
    });
  }

  static async touch(id) {
    return this.update({
      where: { id },
      data: { last_active: new Date() }
    });
  }

  static isExpired(session) {
    return new Date() > new Date(session.expires_at);
  }
}

Session.init({
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
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'sessions',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = Session;
