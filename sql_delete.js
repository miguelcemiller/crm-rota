const sqlite3 = require('sqlite3');

// SQL statement to delete all rows from the table
const deleteAllDataSql = `DELETE FROM schedule`;

// SQL statement to reset the auto-increment value
const resetAutoIncrementSql = `DELETE FROM sqlite_sequence WHERE name = 'schedule'`;

// Create and connect to the database
const db = new sqlite3.Database('database.db');

// Run the SQL to delete all data from the table
db.run(deleteAllDataSql, function (err) {
    if (err) {
        return console.error('Error deleting data:', err.message);
    }

    console.log(`Deleted ${this.changes} rows from the table.`);

    // Run the SQL to reset the auto-increment value
    db.run(resetAutoIncrementSql, function (resetErr) {
        if (resetErr) {
            console.error('Error resetting auto-increment:', resetErr.message);
        } else {
            console.log('Auto-increment reset successfully.');
        }

        // Close the database connection
        db.close((closeErr) => {
            if (closeErr) {
                console.error('Error closing the database:', closeErr.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
});
