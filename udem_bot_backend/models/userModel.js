const pool = require('../db.js'); // Importa la conexión a la DB.
const bcrypt = require('bcryptjs'); // ✅ Importa bcryptjs para poder usarlo.

// Función para obtener todos los usuarios.
const getUsers = async () => {
  const res = await pool.query('SELECT * FROM users');
  return res.rows;
};

// Función para crear un nuevo usuario.
const createUser = async (id, name, email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10); // ✅ Hashea la contraseña.
  const res = await pool.query(
    'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, name, email, hashedPassword, role]
  );
  return res.rows[0];
};

module.exports = { getUsers, createUser };
