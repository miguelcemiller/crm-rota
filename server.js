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

// Add person
app.post('/add-person', (req, res) => {
  const person = req.body;
  const db = new sqlite3.Database('database.db');

  const sql = 'INSERT INTO schedule(name, shift, shift_order) VALUES (?, ?, ?)';
  db.run(sql, [person[0], person[1], person[2] + 1]);

  res.json({
    message: 'added person',
  });

  db.close();
});

// Remove person
app.post('/remove-person', (req, res) => {
  const nameAndShfit = req.body;
  const db = new sqlite3.Database('database.db');

  console.log(nameAndShfit);

  // Used serialize to ensure the statements are executed serially
  db.serialize(() => {
    // get shift_order
    // delete row from shift
    // update shift_order values for all records in the shift where shift_order > retrieved_shift_order
    const sql1 = 'SELECT shift_order FROM schedule WHERE name = ? AND shift = ?';
    const sql2 = 'DELETE FROM schedule WHERE name = ? AND shift = ?';
    const sql3 = 'UPDATE schedule SET shift_order = shift_order - 1 WHERE shift = ? AND shift_order > ?';

    db.get(sql1, [nameAndShfit[0], nameAndShfit[1]], (err, row) => {
      if (row) {
        const retrieved_shift_order = row.shift_order;
        console.log('Retrieved shift_order:', retrieved_shift_order);

        // Use Promises to handle asynchronous nature
        const deletePromise = new Promise((resolve, reject) => {
          db.run(sql2, [nameAndShfit[0], nameAndShfit[1]], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        deletePromise
          .then(() => {
            return new Promise((resolve, reject) => {
              db.run(sql3, [nameAndShfit[1], retrieved_shift_order], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          })
          .then(() => {
            // This is where you can send the response since all operations are complete
            res.json({
              message: 'removed person',
            });

            // Close the database connection
            db.close();
          })
          .catch((err) => {
            // Handle errors
            console.error(err);

            // Close the database connection even if an error occurs
            db.close();
          });
      }
    });
  });
});

// check name
app.post('/check-name', (req, res) => {
  const name = req.body;
  const db = new sqlite3.Database('database.db');

  console.log(name);

  const sql = 'SELECT COUNT(*) AS count FROM schedule WHERE LOWER(name) = ?';

  db.get(sql, [name[0]], (err, result) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }

    const nameExists = result.count > 0;

    res.json({
      message: nameExists,
    });

    db.close();
  });
});

// run server
const server = app.listen(3000, '0.0.0.0', () => {
  console.log(`The application started on port ${server.address().port}`);
});
