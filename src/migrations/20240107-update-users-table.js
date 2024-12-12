const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename columns
    await queryInterface.renameColumn('users', 'firstName', 'first_name');
    await queryInterface.renameColumn('users', 'lastName', 'last_name');
    await queryInterface.renameColumn('users', 'isVerified', 'is_verified');
    await queryInterface.renameColumn('users', 'failedLoginAttempts', 'failed_login_attempts');
    await queryInterface.renameColumn('users', 'accountLocked', 'account_locked');
    await queryInterface.renameColumn('users', 'lockExpiresAt', 'lock_expires_at');
    await queryInterface.renameColumn('users', 'lastLoginAt', 'last_login_at');
    await queryInterface.renameColumn('users', 'verificationToken', 'verification_token');
    await queryInterface.renameColumn('users', 'verificationTokenExpiry', 'verification_token_expiry');
    await queryInterface.renameColumn('users', 'passwordResetToken', 'password_reset_token');
    await queryInterface.renameColumn('users', 'passwordResetExpiry', 'password_reset_expiry');

    // Ensure columns exist with correct types
    await queryInterface.addColumn('users', 'first_name', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'last_name', {
      type: DataTypes.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert column renames
    await queryInterface.renameColumn('users', 'first_name', 'firstName');
    await queryInterface.renameColumn('users', 'last_name', 'lastName');
    await queryInterface.renameColumn('users', 'is_verified', 'isVerified');
    await queryInterface.renameColumn('users', 'failed_login_attempts', 'failedLoginAttempts');
    await queryInterface.renameColumn('users', 'account_locked', 'accountLocked');
    await queryInterface.renameColumn('users', 'lock_expires_at', 'lockExpiresAt');
    await queryInterface.renameColumn('users', 'last_login_at', 'lastLoginAt');
    await queryInterface.renameColumn('users', 'verification_token', 'verificationToken');
    await queryInterface.renameColumn('users', 'verification_token_expiry', 'verificationTokenExpiry');
    await queryInterface.renameColumn('users', 'password_reset_token', 'passwordResetToken');
    await queryInterface.renameColumn('users', 'password_reset_expiry', 'passwordResetExpiry');

    // Remove added columns
    await queryInterface.removeColumn('users', 'first_name');
    await queryInterface.removeColumn('users', 'last_name');
  }
};
