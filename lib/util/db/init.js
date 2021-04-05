'use strict';

const { sequelize } = require('./instance');
const { Seller } = require('./models');
const apiUtil = require('../api');

try {
  (async function() {
    await sequelize.sync();

    const sellers = await apiUtil.getSellers();

    Seller.bulkCreate(sellers);

    console.log('Database initialized');
  })();
} catch (e) {
  throw new Error('Databas initialization error:', e);
}
