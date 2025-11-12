const pool = require('../db');

class MateriasModel {
  static async getAll() {
    const res = await pool.query('SELECT id, nombre, descripcion, profesor_id, created_at FROM materias ORDER BY id');
    return res.rows;
  }

  static async create(nombre, descripcion = null, profesor_id = null) {
    const res = await pool.query(
      'INSERT INTO materias (nombre, descripcion, profesor_id) VALUES ($1, $2, $3) RETURNING id, nombre, descripcion, profesor_id, created_at',
      [nombre, descripcion, profesor_id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM materias WHERE id = $1', [id]);
    return true;
  }
}

module.exports = MateriasModel;
