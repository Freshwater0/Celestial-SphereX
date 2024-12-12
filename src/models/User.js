const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class User extends Model {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async validatePassword(plainPassword) {
    try {
      console.log('Validating password:');
      console.log('Plain Password:', plainPassword);
      console.log('Stored Hashed Password:', this.password);
      
      const isMatch = await bcrypt.compare(plainPassword, this.password);
      
      console.log('Bcrypt Comparison Result:', isMatch);
      return isMatch;
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    field: 'first_name',
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    field: 'last_name',
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'USER'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    field: 'is_verified',
    allowNull: false,
    defaultValue: false
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    field: 'failed_login_attempts',
    allowNull: false,
    defaultValue: 0
  },
  accountLocked: {
    type: DataTypes.BOOLEAN,
    field: 'account_locked',
    allowNull: false,
    defaultValue: false
  },
  lockExpiresAt: {
    type: DataTypes.DATE,
    field: 'lock_expires_at',
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    field: 'last_login_at',
    allowNull: true
  },
  verificationToken: {
    type: DataTypes.STRING,
    field: 'verification_token',
    allowNull: true
  },
  verificationTokenExpiry: {
    type: DataTypes.DATE,
    field: 'verification_token_expiry',
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    field: 'password_reset_token',
    allowNull: true
  },
  passwordResetExpiry: {
    type: DataTypes.DATE,
    field: 'password_reset_expiry',
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await User.hashPassword(user.password);
      }
      if (!user.username) {
        // Generate username from email if not provided
        user.username = user.email.split('@')[0];
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await User.hashPassword(user.password);
      }
    }
  }
});

// Define associations
User.associate = (models) => {
  User.hasOne(models.Profile, {
    foreignKey: 'user_id',
    as: 'profile'
  });
  
  User.hasOne(models.Settings, {
    foreignKey: 'user_id',
    as: 'settings'
  });
};

module.exports = User;
