'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const apiUtil = require('../api');

const DB_PATH = path.join(__dirname, 'settings.db');

if (!fs.existsSync(DB_PATH)) {
  const db = new Database(DB_PATH);
  const setup = fs.readFileSync(path.join(__dirname, 'setup.sql'), 'utf-8');

  db.exec(setup);

  (async function() {
    const insertSeller = db.prepare('INSERT INTO sellers (id, title) VALUES (?, ?)');
    const sellers = await apiUtil.getSellers();

    for (const seller of sellers) {
      insertSeller.run(seller.id, seller.title);
    }
  })();

  console.log('Database created');
} else {
  console.log('Database already created');
}
