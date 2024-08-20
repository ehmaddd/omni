const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'login_system',
  password: 'abcdef',
  port: 5432,
});

module.exports = pool;
