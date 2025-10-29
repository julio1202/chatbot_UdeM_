const { Pool } = require('pg');
require('dotenv').config();  // Carga .env desde la raíz

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err);
    return;
  }
  console.log('Conectado a PostgreSQL exitosamente');
  release();
});

module.exports = pool;