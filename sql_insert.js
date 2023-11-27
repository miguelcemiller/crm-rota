const sqlite3 = require('sqlite3');

const insertTempData = `INSERT INTO schedule(name, shift, shift_order) VALUES
    ('Migs', '10PM', 2),
    ('Kumar', '10PM', 1),
    ('Ronnie', '10PM', 3),
    ('Wij', '11PM', 2),
    ('Eunice', '11PM', 3),
    ('Yana', '1AM', 1),
    ('Kriza', '1AM', 2),
    ('Curry', '12AM', 1),
    ('Luka', '12AM', 2),
    ('Angge', '11PM', 1)`;

// Create and connect to the database
const db = new sqlite3.Database('database.db');

// Run the SQL to insert temporary data
db.run(insertTempData, function (err) {
  if (err) {
    return console.error('Error inserting temporary data:', err.message);
  }

  console.log(`Inserted ${this.changes} rows of temporary data into the table.`);

  // Close the database connection
  db.close((closeErr) => {
    if (closeErr) {
      console.error('Error closing the database:', closeErr.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
