const pool = require('../db');

class ReminderModel {
  static async createReminder(userId, date, title, time, notes, recurrent = false) {
    try {
      const result = await pool.query(
        'INSERT INTO reminders (user_id, date, title, time, notes, recurrent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userId, date, title, time, notes, recurrent]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getRemindersByUser(userId) {
    try {
      const result = await pool.query('SELECT * FROM reminders WHERE user_id = $1 ORDER BY date, time', [userId]);
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async updateReminder(id, updates) {
    try {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      values.push(id);
      const result = await pool.query(`UPDATE reminders SET ${setClause} WHERE id = $${values.length} RETURNING *`, values);
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async deleteReminder(id) {
    try {
      await pool.query('DELETE FROM reminders WHERE id = $1', [id]);
      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ReminderModel;