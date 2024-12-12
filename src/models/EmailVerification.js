const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const crypto = require('crypto');

class EmailVerification extends Model {
  static async createVerification(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    return EmailVerification.create({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  }

  static async findByToken(token) {
    return EmailVerification.findOne({
      where: { 
        token,
        verified_at: null,
        expires_at: {
          gt: new Date()
        }
      }
    });
  }

  static async markAsVerified(id) {
    return EmailVerification.update({
      verified_at: new Date()
    }, {
      where: { id }
    });
  }

  static async deleteExpired() {
    return EmailVerification.destroy({
      where: {
        [Model.sequelize.Op.or]: [
          { expires_at: { lt: new Date() } },
          { verified_at: { [Model.sequelize.Op.ne]: null } }
        ]
      }
    });
  }

  static async getVerificationsByUserId(userId) {
    return EmailVerification.findAll({
      where: { user_id: userId }
    });
  }
}

EmailVerification.init({
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
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'EmailVerification',
  tableName: 'email_verifications',
  underscored: true,
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['token'] }
  ]
});

module.exports = EmailVerification;
