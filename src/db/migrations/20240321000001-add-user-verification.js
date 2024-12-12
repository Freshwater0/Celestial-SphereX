module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'is_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('users', 'verification_token', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'verification_token_expires', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add index for faster verification token lookups
    await queryInterface.addIndex('users', ['verification_token']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', ['verification_token']);
    await queryInterface.removeColumn('users', 'verification_token_expires');
    await queryInterface.removeColumn('users', 'verification_token');
    await queryInterface.removeColumn('users', 'is_verified');
  }
};
