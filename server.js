const express = require('express');
const app = express();
const path = require("path");
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

app.get('/', (req, res) => {
    // create db
    const db = new sqlite3.Database('database.db');
    const sql = "CREATE TABLE IF NOT EXISTS schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, shift INTEGER, shift_order INTEGER, created_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')))";
    db.run(sql);
    db.close();

    res.render('index', { shifts });
});

// run server
const server = app.listen(3000, '0.0.0.0', () => {
    console.log(`The application started on port ${server.address().port}`);
});