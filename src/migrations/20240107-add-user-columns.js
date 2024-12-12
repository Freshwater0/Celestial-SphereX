const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add first_name column if not exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='users' AND column_name='first_name'
        ) THEN
          ALTER TABLE users ADD COLUMN "first_name" VARCHAR(255);
        END IF;
      END $$;
    `);

    // Add last_name column if not exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='users' AND column_name='last_name'
        ) THEN
          ALTER TABLE users ADD COLUMN "last_name" VARCHAR(255);
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove first_name column if it exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='users' AND column_name='first_name'
        ) THEN
          ALTER TABLE users DROP COLUMN "first_name";
        END IF;
      END $$;
    `);

    // Remove last_name column if it exists
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='users' AND column_name='last_name'
        ) THEN
          ALTER TABLE users DROP COLUMN "last_name";
        END IF;
      END $$;
    `);
  }
};
