const pool = require('../db');

class MessagesModel {
  static async createMessage(conversationId, sender, message, confidence = null) {
    try {
      const result = await pool.query(
        'INSERT INTO chat_messages (session_id, sender, message, confidence) VALUES ($1, $2, $3, $4) RETURNING *',
        [conversationId, sender, message, confidence]
      );
      return result.rows[0];
    } catch (err) {
      throw err;
    }
  }

  static async getMessagesByConversation(conversationId) {
    try {
      const result = await pool.query(
        'SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC',
        [conversationId]
      );
      return result.rows;
    } catch (err) {
      throw err;
    }
  }

  static async deleteMessage(id) {
    try {
      await pool.query('DELETE FROM chat_messages WHERE id = $1', [id]);
      return true;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = MessagesModel;
