const { Pool } = require('pg');  // Importa la librería para conectar a PostgreSQL.

const pool = new Pool({           // Crea una "piscina" de conexiones (para eficiencia).
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;            // Exporta la conexión para usarla en otros archivos.


