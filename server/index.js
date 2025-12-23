const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(path.resolve(__dirname, 'hospital.db'), (err) => {
  if (err) console.error('Veritabanı bağlantı hatası:', err.message);
  else console.log('SQLite veritabanına bağlandı.');
});

const patientRoutes = require('./routes/patients')(db);
const invoiceRoutes = require('./routes/invoices')(db);
app.use('/api/patients', patientRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/api/materials', (req, res) => {
  db.all('SELECT * FROM materials', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/materials', (req, res) => {
  const { name, code, quantity } = req.body;
  db.run('INSERT INTO materials (name, code, quantity) VALUES (?, ?, ?)', [name, code, quantity], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, code, quantity });
  });
});

// React build dosyalarını serve et
app.use(express.static(path.join(__dirname, '../dist')));

// React Router için - tüm diğer istekleri index.html'e yönlendir
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`API sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
