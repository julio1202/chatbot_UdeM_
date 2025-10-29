// routes/chatbot.js
const express = require('express');
const router = express.Router();
const { openai } = require('../server');  // Importa openai desde server.js

const { getUserByName, createUser, saveMessage, getLastMessages } = require('../models/chatbotModels');

// POST /api/chatbot
router.post('/', async (req, res) => {
  try {
    const { user, message } = req.body;
    if (!user || !message) return res.status(400).json({ error: 'Usuario o mensaje faltante.' });

    if (!openai) return res.status(500).json({ error: 'OpenAI no disponible. Verifica la API key.' });

    let userRecord = await getUserByName(user);
    if (!userRecord) {
      userRecord = await createUser(user, `${user.toLowerCase()}@udem.edu.co`, 'student');
    }

    await saveMessage(null, 'user', message);

    const historial = await getLastMessages(5);
    const contexto = historial.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_text
    }));

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Eres el asistente académico de la Universidad de Medellín (UdeM). Respondes de forma amable y clara.' },
        ...contexto,
        { role: 'user', content: message }
      ]
    });

    const respuesta = completion.choices[0].message.content;
    await saveMessage(null, 'bot', respuesta);

    res.json({ response: respuesta });

  } catch (err) {
    console.error('❌ Error en /api/chatbot:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;