const pool = require('../db');

class AdvisorsAvailabilityModel {
  static async createAdvisor(advisorId, isAvailable = true) {  // Usa advisorId de users
    try {
      const result = await pool.query(
        'INSERT INTO advisors_availability (advisor_id, is_available) VALUES ($1, $2) RETURNING *',
        [advisorId, isAvailable]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getAllAdvisors() {
    try {
      const result = await pool.query(
        'SELECT aa.*, u.name, u.email FROM advisors_availability aa JOIN users u ON aa.advisor_id = u.id ORDER BY aa.advisor_id'
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async updateAvailability(advisorId, isAvailable) {
    try {
      const result = await pool.query(
        'UPDATE advisors_availability SET is_available = $1, last_update = CURRENT_TIMESTAMP WHERE advisor_id = $2 RETURNING *',
        [isAvailable, advisorId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async deleteAdvisor(advisorId) {
    try {
      await pool.query('DELETE FROM advisors_availability WHERE advisor_id = $1', [advisorId]);
      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = AdvisorsAvailabilityModel;