'use strict';

const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const logger = msg => console.log('\x1b[36m%s\x1b[0m', msg);

module.exports.sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: isProduction ? false : logger,
  dialect: 'postgres',
  dialectOptions: {
    ssl: !!process.env.CA_CERT && {
      rejectUnauthorized: true,
      ca: process.env.CA_CERT
    }
  }
});
