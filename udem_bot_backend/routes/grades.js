const express = require('express');
const GradeModel = require('../models/gradeModel');
const router = express.Router();

// Crear calificación
router.post('/', async (req, res) => {
  const { userId, subject, item, grade, percentage } = req.body;
  try {
    const newGrade = await GradeModel.createGrade(userId, subject, item, grade, percentage);
    res.json({ success: true, grade: newGrade });
  } catch (err) {
    res.status(500).json({ error: 'Error creando calificación' });
  }
});

// Obtener calificaciones por usuario
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const grades = await GradeModel.getGradesByUser(userId);
    res.json(grades);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo calificaciones' });
  }
});

// Actualizar calificación
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const grade = await GradeModel.updateGrade(id, updates);
    res.json({ success: true, grade });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando calificación' });
  }
});

// Eliminar calificación
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await GradeModel.deleteGrade(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando calificación' });
  }
});

module.exports = router;