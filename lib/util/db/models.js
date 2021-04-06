'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('./instance');

const Guild = sequelize.define('guild', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true
  }
}, { timestamps: false });

const Seller = sequelize.define('seller', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false });

const IgnoredSeller = sequelize.define('ignored_seller', {}, { timestamps: false });

Guild.belongsToMany(Seller, { through: IgnoredSeller });
Seller.belongsToMany(Guild, { through: IgnoredSeller });

module.exports = {
  Guild,
  Seller,
  IgnoredSeller
};
