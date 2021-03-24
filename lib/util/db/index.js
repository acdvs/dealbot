'use strict';

const path = require('path');
const Database = require('better-sqlite3');
const apiUtil = require('../api');

const DB_PATH = path.join(__dirname, 'settings.db');

let db;

/**
 * Open the database
 */
const openDatabase = () => {
  db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  console.log('Connected to database');
};

/**
 * Insert server ID
 * @param {integer} id Discord guild ID
 * @return {boolean}
 */
const insertServer = (id) => {
  const statement = db.prepare('INSERT INTO servers (id) VALUES (?)');
  const res = statement.run(id);

  return res?.changes === 1;
};

/**
 * Remove server ID
 * @param {integer} id Discord guild ID
 * @return {boolean}
 */
const removeServer = (id) => {
  const statement = db.prepare('DELETE FROM servers WHERE id = ?');
  const res = statement.run(id);

  return res?.changes === 1;
};

/**
 * Get all sellers
 * @return {Array}
 */
const getSellers = () => {
  const statement = db.prepare('SELECT title FROM sellers');
  const rows = statement.get();

  return rows;
};

/**
 * Get ignored sellers for a server
 * @param {integer} id Discord guild ID
 * @return {Array}
 */
const getIgnoredSellers = (id) => {
  const statement = db.prepare(`
    SELECT * FROM sellers s
    LEFT JOIN ignoredsellers i ON s.id = i.sellerid
    WHERE i.serverid = ?
  `);
  const rows = statement.get(id);

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

  const statement = db.prepare(`
    SELECT * FROM ignoredsellers
    WHERE serverid = ? AND sellerid IN (
      SELECT s.id FROM sellers s WHERE s.title = ?
    )
  `);
  const row = statement.get(serverId, sellerTitle);

  return seller && !!row;
};

/**
 * Add ignored seller to server
 * @param {integer} serverId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean}
 */
const addIgnoredSeller = (serverId, sellerTitle) => {
  const statement = db.prepare(`
    INSERT INTO ignoredsellers (serverid, sellerid)
    VALUES (?, (SELECT id FROM sellers WHERE title = ?))
  `);
  const res = statement.run(serverId, sellerTitle);

  return res?.changes === 1;
};

/**
 * Remove ignored seller from server
 * @param {integer} serverId Discord guild ID
 * @param {string} sellerTitle ITAD seller title
 * @returns {boolean}
 */
const removeIgnoredSeller = (serverId, sellerTitle) => {
  const statement = db.prepare(`
    DELETE FROM ignoredsellers
    WHERE serverid = ? AND sellerid IN (
      SELECT s.id FROM sellers s WHERE s.title = ?
    )`
  );
  const res = statement.run(serverId, sellerTitle);

  return res?.changes === 1;
};

/**
 * Clear all ignored sellers from server
 * @param {integer} serverId Discord guild ID
 * @returns {boolean}
 */
const clearIgnoredSellers = (serverId) => {
  const statement = db.prepare('DELETE FROM ignoredsellers WHERE serverid = ?');
  const res = statement.run(serverId);

  return res?.changes > 0;
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
