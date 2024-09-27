const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',  // Use the new MySQL host
  user: 'sql12733834',                // Your MySQL username
  database: 'sql12733834',            // Your MySQL database name
  password: 'nsKyw1v4pz',             // Your MySQL password
  port: 3306,                         // MySQL port (default is 3306)
  waitForConnections: true,
  connectionLimit: 10,                // Limit the number of connections
  queueLimit: 0
});

module.exports = pool;