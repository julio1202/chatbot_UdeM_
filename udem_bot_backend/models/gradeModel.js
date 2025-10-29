const pool = require('../db');  // Importa la conexión a PostgreSQL desde db.js

class GradeModel {
  // Crear una nueva calificación
  static async createGrade(userId, subject, item, grade, percentage) {
    try {
      const result = await pool.query(
        'INSERT INTO grades (user_id, subject, item, grade, percentage) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, subject, item, grade, percentage]
      );
      return result.rows[0];  // Retorna la calificación creada
    } catch (err) {
      throw err;  // Lanza el error para manejarlo en la ruta
    }
  }

  // Obtener todas las calificaciones de un usuario
  static async getGradesByUser(userId) {
    try {
      const result = await pool.query('SELECT * FROM grades WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;  // Retorna la lista de calificaciones
    } catch (err) {
      throw err;
    }
  }

  // Actualizar una calificación existente
  static async updateGrade(id, updates) {
    try {
      const fields = Object.keys(updates);  // Campos a actualizar (e.g., grade, percentage)
      const values = Object.values(updates);  // Valores correspondientes
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');  // Construye la cláusula SET
      values.push(id);  // Agrega el ID al final para WHERE
      const result = await pool.query(`UPDATE grades SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
      return result.rows[0];  // Retorna la calificación actualizada
    } catch (err) {
      throw err;
    }
  }

  // Eliminar una calificación
  static async deleteGrade(id) {
    try {
      await pool.query('DELETE FROM grades WHERE id = $1', [id]);
      return true;  // Retorna true si se eliminó
    } catch (err) {
      throw err;
    }
  }
}

module.exports = GradeModel;  // Exporta la clase para usarla en rutas