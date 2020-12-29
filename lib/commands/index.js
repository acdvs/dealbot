'use strict';

module.exports = {
  help: require('./help'),
  deals: require('./deals'),
  ignoredSellers: require('./ignoredSellers'),
  sellers: require('./sellers'),
  top: require('./top')
};

// Seconds before another command can run
module.exports.LIMIT_SECONDS = 2;