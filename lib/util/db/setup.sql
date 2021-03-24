CREATE TABLE servers (id INTEGER PRIMARY KEY);
CREATE TABLE sellers (id TEXT PRIMARY KEY, title TEXT NOT NULL);
CREATE TABLE ignoredsellers (
  serverid INTEGER NOT NULL,
  sellerid TEXT NOT NULL,
  FOREIGN KEY (serverid) REFERENCES servers(id) ON DELETE CASCADE,
  FOREIGN KEY (sellerid) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ignoredindex ON ignoredsellers (serverid, sellerid);
