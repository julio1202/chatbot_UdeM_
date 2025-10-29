const pool = require('../db');

class ConversationsModel {
  static async createConversation(userId) {
    try {
      const result = await pool.query(
        'INSERT INTO chat_sessions (user_id, status) VALUES ($1, $2) RETURNING *',
        [userId, 'active']
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async transferConversation(conversationId, advisorId) {
    try {
      const result = await pool.query(
        'UPDATE chat_sessions SET status = $1, assigned_to = $2, ended_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        ['transferred', advisorId, conversationId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async closeConversation(conversationId) {
    try {
      const result = await pool.query(
        'UPDATE chat_sessions SET status = $1, ended_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['closed', conversationId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getConversationsByUser(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY started_at DESC',
        [userId]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ConversationsModel;
