'use strict';

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'settings.db');

if (!fs.existsSync(dbPath)) {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database(dbPath);

  const apiUtil = require('../api');

  db.serialize(async function() {
    db.run('CREATE TABLE servers (id INTEGER PRIMARY KEY)');
    db.run('CREATE TABLE sellers (id TEXT PRIMARY KEY, title TEXT NOT NULL)');
    db.run(`CREATE TABLE ignoredsellers (
              serverid INTEGER NOT NULL,
              sellerid TEXT NOT NULL,
              FOREIGN KEY (serverid) REFERENCES servers(id) ON DELETE CASCADE,
              FOREIGN KEY (sellerid) REFERENCES sellers(id) ON DELETE CASCADE
            )`);

    db.run('CREATE UNIQUE INDEX ignoredindex ON ignoredsellers (serverid, sellerid)');

    const insertSeller = db.prepare('INSERT INTO sellers (id, title) VALUES (?, ?)');
    const sellers = await apiUtil.getSellers();

    for (const seller of sellers) {
      insertSeller.run(seller.id, seller.title);
    }

    insertSeller.finalize();

    db.close();

    console.log('Database created');
  });
} else {
  console.log('Database already created');
}
