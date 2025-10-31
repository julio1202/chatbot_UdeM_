const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const { getUserByName, createUser, saveMessage, getLastMessages } = require('../models/chatbotModel.js');

router.post('/', async (req, res) => {
  try {
    const { user, message } = req.body;
    if (!user || !message) return res.status(400).json({ error: 'Usuario o mensaje faltante.' });

    let userRecord = await getUserByName(user);
    if (!userRecord) {
      userRecord = await createUser(user, `${user.toLowerCase()}@udem.edu.co`, 'student');
    }

    await saveMessage(null, 'user', message);

    const historial = await getLastMessages(5);
    const contexto = historial.map(msg => `${msg.sender}: ${msg.message_text}`).join('\n');

    const prompt = `Eres el asistente académico de la Universidad de Medellín (UdeM). Responde de forma amable y clara.\n\nHistorial:\n${contexto}\n\nUsuario: ${message}`;
    const result = await model.generateContent(prompt);
    const respuesta = result.response.text();

    await saveMessage(null, 'bot', respuesta);

    res.json({ response: respuesta });
  } catch (err) {
    console.error('Error en Gemini:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;