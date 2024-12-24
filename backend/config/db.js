const { Sequelize } = require('sequelize');

// Create a Sequelize instance to connect to the PostgreSQL database
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres', // Change dialect to 'postgres'
  logging: false,      // Disable SQL logging
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false, // For SSL connections if needed
  },
});

module.exports = sequelize;
