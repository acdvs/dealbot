'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const logger = msg => console.log('\x1b[36m%s\x1b[0m', msg);

module.exports.sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: isProduction ? false : logger,
  dialect: 'postgres',
  dialectOptions: {
    ssl: isProduction && {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(__dirname, '/ca-certificate.crt'))
    }
  }
});
