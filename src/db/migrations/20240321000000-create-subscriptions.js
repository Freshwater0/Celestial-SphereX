module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('trial', 'active', 'cancelled', 'expired'),
        defaultValue: 'trial'
      },
      trialStartDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      trialEndDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      subscriptionStartDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subscriptionEndDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripeSubscriptionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('subscriptions', ['userId']);
    await queryInterface.addIndex('subscriptions', ['status']);
    await queryInterface.addIndex('subscriptions', ['trialEndDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscriptions');
  }
};
