const express = require('express');
const ConversationsModel = require('../models/conversationsModel.js');
const router = express.Router();

// Crear conversación
router.post('/', async (req, res) => {
  const { userId } = req.body;
  try {
    const conversation = await ConversationsModel.createConversation(userId);
    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ error: 'Error creando conversación' });
  }
});

// Transferir a asesor humano
router.put('/transfer/:id', async (req, res) => {
  const { id } = req.params;
  const { assignedAdvisorId, transferReason } = req.body;
  try {
    const transferred = await ConversationsModel.transferConversation(id, assignedAdvisorId, transferReason);
    res.json({ success: true, conversation: transferred });
  } catch (err) {
    res.status(500).json({ error: 'Error transfiriendo conversación' });
  }
});

// Cerrar conversación
router.put('/close/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const closed = await ConversationsModel.closeConversation(id);
    res.json({ success: true, conversation: closed });
  } catch (err) {
    res.status(500).json({ error: 'Error cerrando conversación' });
  }
});

// Obtener conversaciones por usuario
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await ConversationsModel.getConversationsByUser(userId);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo conversaciones' });
  }
});

module.exports = router;