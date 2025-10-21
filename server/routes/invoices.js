const express = require('express');
const router = express.Router();

module.exports = (db) => {
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  )`);

  router.get('/', (req, res) => {
    db.all('SELECT * FROM invoices', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  router.post('/', (req, res) => {
    const { patientName, amount, date } = req.body;
    db.run('INSERT INTO invoices (patientName, amount, date) VALUES (?, ?, ?)', [patientName, amount, date], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, patientName, amount, date });
    });
  });

  return router;
};
