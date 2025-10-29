const pool = require('../db');

class AdvisorsAvailabilityModel {
  static async createAdvisor(name, email, available = true) {
    try {
      const result = await pool.query(
        'INSERT INTO advisors (name, email, available) VALUES ($1, $2, $3) RETURNING *',
        [name, email, available]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getAllAdvisors() {
    try {
      const result = await pool.query('SELECT * FROM advisors ORDER BY id');
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async updateAvailability(advisorId, available) {
    try {
      const result = await pool.query(
        'UPDATE advisors SET available = $1 WHERE id = $2 RETURNING *',
        [available, advisorId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async deleteAdvisor(id) {
    try {
      await pool.query('DELETE FROM advisors WHERE id = $1', [id]);
      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = AdvisorsAvailabilityModel;
