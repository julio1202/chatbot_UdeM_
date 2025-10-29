const express = require('express');
const ReminderModel = require('../models/reminderModel.js');
const router = express.Router();

// Crear recordatorio
router.post('/', async (req, res) => {
  const { userId, date, title, time, notes, recurrent } = req.body;
  try {
    const reminder = await ReminderModel.createReminder(userId, date, title, time, notes, recurrent);
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ error: 'Error creando recordatorio' });
  }
});

// Obtener recordatorios por usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const reminders = await ReminderModel.getRemindersByUser(userId);
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo recordatorios' });
  }
});

// Actualizar recordatorio
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const reminder = await ReminderModel.updateReminder(id, updates);
    res.json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando recordatorio' });
  }
});

// Eliminar recordatorio
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await ReminderModel.deleteReminder(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando recordatorio' });
  }
});

module.exports = router;