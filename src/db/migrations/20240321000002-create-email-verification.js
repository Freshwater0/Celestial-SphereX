module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the verification token columns from users table if they exist
    try {
      await queryInterface.removeColumn('users', 'verification_token');
      await queryInterface.removeColumn('users', 'verification_token_expires');
    } catch (error) {
      console.log('Columns may not exist, continuing...');
    }

    // Create email_verifications table
    await queryInterface.createTable('email_verifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('email_verifications', ['user_id']);
    await queryInterface.addIndex('email_verifications', ['token']);
    await queryInterface.addIndex('email_verifications', ['expires_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_verifications');
  }
};
