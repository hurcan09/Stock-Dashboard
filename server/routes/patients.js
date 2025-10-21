const express = require('express');
const router = express.Router();

module.exports = (db) => {
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tc TEXT UNIQUE,
    diagnosis TEXT
  )`);

  router.get('/', (req, res) => {
    db.all('SELECT * FROM patients', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/', (req, res) => {
    const { name, tc, diagnosis } = req.body;
    db.run('INSERT INTO patients (name, tc, diagnosis) VALUES (?, ?, ?)', [name, tc, diagnosis], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, tc, diagnosis });
    });
  });

  return router;
};
