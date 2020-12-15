'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

const readFile = util.promisify(fs.readFile);

const DEFAULT_SETTINGS = {
  prefix: '$',
  ignoredSellers: []
};

/**
 * Save settings to local file
 * @param {Object} settings
 */
const save = (settings) => {
  fs.writeFile('settings.json', JSON.stringify(settings, null, 2), (err) => {
    if (err) console.error('SETTINGS SAVE ERROR: ', err);
  });
};

/**
 * Load settings from local file
 * @returns {Object}
 */
const load = async () => {
  let settings = DEFAULT_SETTINGS;

  try {
    const data = await readFile(path.join(__dirname, '../../settings.json'), 'utf8');
    settings = JSON.parse(data);
  } catch (e) {
    console.error('No existing settings file found. Creating...');
    save(settings);
  }

  return settings;
};

module.exports = {
  DEFAULT_SETTINGS,
  save,
  load
};