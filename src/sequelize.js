const { Sequelize } = require('sequelize');

const  { config } = require('../src/config/config');
const oracledb = require('oracledb');
  
const sequelize = new Sequelize(
    config.dbName, // name database
    config.dbUser, // user database
    config.dbPassword, // password database
    {
      host: config.dbHost,
      dialect: 'oracle' ,
      dialectModule: oracledb
    }
  );

sequelize.sync();

module.exports = sequelize;