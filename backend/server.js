const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Ethan8#$',
  database: 'cardDB'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected...');
});


// Example route to get selected columns from all cards
app.get('/cards', (req, res) => {
  const sql = 'SELECT name, rarity, type, nation, amount_in_stock FROM cards';
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
