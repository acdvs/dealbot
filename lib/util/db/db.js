'use strict';

const path = require('path');
const Database = require('sqlite-async');
const apiUtil = require('../api');

let db;

const openDatabase = async () => {
  db = await Database.open(path.join(__dirname, 'settings.db'));
  db.run('PRAGMA foreign_keys = ON');

  console.log('Connected to database');
};

/**
 * Insert server ID
 * @param {integer} id Discord guild ID
 * @return {boolean}
 */
const insertServer = async (id) => {
  const res = await db.run('INSERT INTO servers (id) VALUES (?)', id);

  return res && res.changes === 1;
};

/**
 * Remove server ID
 * @param {integer} id Discord guild ID
 * @return {boolean}
 */
const removeServer = async (id) => {
  const res = await db.run('DELETE FROM servers WHERE id = ?', id);

  return res && res.changes === 1;
};

/**
 * Get all sellers
 * @return {Array}
 */
const getSellers = async () => {
  const rows = await db.all('SELECT title FROM sellers');

  return rows;
};

/**
 * Get ignored sellers for a server
 * @param {integer} id Discord guild ID
 * @return {Array}
 */
const getIgnoredSellers = async (id) => {
  const rows = await db.all(`
    SELECT * FROM sellers s
    LEFT JOIN ignoredsellers i ON s.id = i.sellerid
    WHERE i.serverid = ?
    `, id);

  return rows;
};

/**
 * Check if server has an ignored seller
 * @param {integer} serverId Discord guild ID
 * @param {integer} sellerTitle ITAD seller title
 * @returns {boolean}
 */
const hasIgnoredSeller = async (serverId, sellerTitle) => {
  const sellers = await apiUtil.getSellers();
  const seller = sellers.find(x => x.title === sellerTitle);

  const row = await db.get(`
    SELECT * FROM ignoredsellers
    WHERE serverid = ? AND sellerid IN (
      SELECT s.id FROM sellers s WHERE s.title = ?
    )`, serverId, sellerTitle);

  return seller && !!row;
};

/**
 * Add ignored seller to server
 * @param {integer} serverId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean}
 */
const addIgnoredSeller = async (serverId, sellerTitle) => {
  const res = await db.run(`
    INSERT INTO ignoredsellers (serverid, sellerid)
    VALUES (?, (SELECT id FROM sellers WHERE title = ?))
    `, serverId, sellerTitle);

  return res && res.changes === 1;
};

/**
 * Remove ignored seller from server
 * @param {integer} serverId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean}
 */
const removeIgnoredSeller = async (serverId, sellerTitle) => {
  const res = await db.run(`
    DELETE FROM ignoredsellers
    WHERE serverid = ? AND sellerid IN (
      SELECT s.id FROM sellers s WHERE s.title = ?
    )`, serverId, sellerTitle);

  return res && res.changes === 1;
};

/**
 * Clear all ignored sellers from server
 * @param {integer} serverId Discord guild ID
 * @returns {boolean}
 */
const clearIgnoredSellers = async (serverId) => {
  const res = await db.run('DELETE FROM ignoredsellers WHERE serverid = ?', serverId);

  return res && res.changes > 0;
};

module.exports = {
  openDatabase,
  insertServer,
  removeServer,
  getSellers,
  getIgnoredSellers,
  hasIgnoredSeller,
  addIgnoredSeller,
  removeIgnoredSeller,
  clearIgnoredSellers
};