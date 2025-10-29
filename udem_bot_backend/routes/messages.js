const express = require('express');
const MessagesModel = require('../models/messagesModel');
const router = express.Router();

// Crear mensaje
router.post('/', async (req, res) => {
  const { conversationId, sender, message, confidence } = req.body;
  try {
    const newMessage = await MessagesModel.createMessage(conversationId, sender, message, confidence);
    res.json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ error: 'Error creando mensaje' });
  }
});

// Obtener mensajes por conversación
router.get('/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await MessagesModel.getMessagesByConversation(conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

// Eliminar mensaje
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await MessagesModel.deleteMessage(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando mensaje' });
  }
});

module.exports = router;
