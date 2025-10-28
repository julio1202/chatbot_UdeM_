const pool = require('../db');  // Importa la conexión a la DB.

const getUsers = async () => {   // Función para obtener todos los usuarios.
  const res = await pool.query('SELECT * FROM users');  // Consulta SQL simple.
  return res.rows;               // Devuelve los resultados.
};

const createUser = async (name, email, role) => {  // Función para crear un usuario.
  const res = await pool.query(
    'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',  // Inserta y devuelve el nuevo usuario.
    [name, email, role]  // Parámetros seguros (evita errores).
  );
  return res.rows[0];
};

module.exports = { getUsers, createUser };  // Exporta las funciones.