const express = require('express');
const app = express();
const path = require('path');
var sqlite3 = require('sqlite3').verbose();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// serve files
app.use('/assets', express.static('assets'));

// Array of shifts
const shifts = [
  { value: '10 PM', name: '10 PM' },
  { value: '11 PM', name: '11 PM' },
  { value: '12 PM', name: '12 PM' },
  { value: '1 AM', name: '1 AM' },
];

// Create DB
app.get('/', (req, res) => {
  const db = new sqlite3.Database('database.db');
  const sql = "CREATE TABLE IF NOT EXISTS schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, shift INTEGER, shift_order INTEGER, created_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')))";
  db.run(sql);
  db.close();

  res.render('index', { shifts });
});

// GET people
app.get('/get-people', (req, res) => {
  const db = new sqlite3.Database('database.db');
  db.all('SELECT * FROM schedule', function (err, rows) {
    if (err) {
      console.error(err.message);
      return;
    }
    const people = JSON.stringify(rows);
    res.json({
      people: people,
    });
    db.close();
  });
});

// Update order
app.post('/update-order', (req, res) => {
  //   const order = JSON.parse(req.body.order);
  console.log(req.body);
  const order = req.body;
  const db = new sqlite3.Database('database.db');

  // Used serialize to ensure the statements are executed serially
  db.serialize(() => {
    const sql = 'UPDATE schedule SET shift_order = ? WHERE shift_order = ? AND shift = ?';
    // Used temp to switch shift_orders between two rows
    db.run(sql, [order[1] + 999, order[0], order[2]]);
    db.run(sql, [order[0], order[1], order[2]]);
    db.run(sql, [order[1], order[1] + 999, order[2]]);
  });

  res.json({
    message: 'Updated order',
  });

  db.close();
});

// run server
const server = app.listen(3000, '0.0.0.0', () => {
  console.log(`The application started on port ${server.address().port}`);
});
