const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function getUserByName(name) {
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE name = $1', [name]);
  return result.rows[0] || null;
}

async function createUser(name, email, role = 'student') {
  const hashed = await bcrypt.hash('1234', 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashed, role]
  );
  return result.rows[0];
}

async function saveMessage(conversationId, sender, messageText) {
  await pool.query(
    'INSERT INTO messages (conversation_id, sender, message_text) VALUES ($1, $2, $3)',
    [conversationId, sender, messageText]
  );
}

async function getLastMessages(limit = 5) {
  const result = await pool.query(
    'SELECT sender, message_text FROM messages ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows.reverse();
}

module.exports = { getUserByName, createUser, saveMessage, getLastMessages };