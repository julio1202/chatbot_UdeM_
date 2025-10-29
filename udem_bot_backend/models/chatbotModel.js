// models/chatbotModels.js
// models/chatbotModels.js
const pool = require('../db');  // Importa pool de db.js
const bcrypt = require('bcrypt');

// Resto del código igual...

// Configura el pool (igual que en server.js)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

/** Obtener usuario por nombre */
async function getUserByName(name) {
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE name = $1', [name]);
  return result.rows[0] || null;
}

/** Crear un nuevo usuario */
async function createUser(name, email, role = 'student') {
  const hashed = await bcrypt.hash('1234', 10);  // Password por defecto (cambia si es necesario)
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashed, role]
  );
  return result.rows[0];
}

/** Guardar un mensaje */
async function saveMessage(conversationId, sender, messageText) {
  await pool.query(
    'INSERT INTO messages (conversation_id, sender, message_text) VALUES ($1, $2, $3)',
    [conversationId, sender, messageText]
  );
}

/** Obtener últimos N mensajes para contexto */
async function getLastMessages(limit = 5) {
  const result = await pool.query(
    'SELECT sender, message_text FROM messages ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows.reverse();
}

module.exports = { getUserByName, createUser, saveMessage, getLastMessages };