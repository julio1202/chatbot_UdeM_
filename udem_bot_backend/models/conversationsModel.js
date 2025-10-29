const pool = require('../db');

class ConversationsModel {
  static async createConversation(userId) {
    try {
      const result = await pool.query(
        'INSERT INTO conversations (user_id, status) VALUES ($1, $2) RETURNING *',
        [userId, 'active']
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async transferConversation(conversationId, assignedAdvisorId, transferReason) {
    try {
      const result = await pool.query(
        'UPDATE conversations SET status = $1, assigned_advisor_id = $2, transfer_reason = $3, ended_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        ['transferred', assignedAdvisorId, transferReason, conversationId]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async closeConversation(conversationId) {
    try {
      const result = await pool.query(
        'UPDATE conversations SET status = $1, ended_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
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
        'SELECT * FROM conversations WHERE user_id = $1 ORDER BY started_at DESC',
        [userId]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ConversationsModel;