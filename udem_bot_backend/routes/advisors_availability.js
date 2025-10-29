const express = require('express');
const AdvisorsAvailabilityModel = require('../models/advisors_availabilityModel.js');
const router = express.Router();

// Crear disponibilidad de asesor (advisorId debe existir en users)
router.post('/', async (req, res) => {
  const { advisorId, isAvailable } = req.body;
  try {
    const advisor = await AdvisorsAvailabilityModel.createAdvisor(advisorId, isAvailable);
    res.json({ success: true, advisor });
  } catch (err) {
    res.status(500).json({ error: 'Error creando disponibilidad de asesor' });
  }
});

// Listar asesores con disponibilidad
router.get('/', async (req, res) => {
  try {
    const advisors = await AdvisorsAvailabilityModel.getAllAdvisors();
    res.json(advisors);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo asesores' });
  }
});

// Actualizar disponibilidad
router.put('/:advisorId', async (req, res) => {
  const { advisorId } = req.params;
  const { isAvailable } = req.body;
  try {
    const updated = await AdvisorsAvailabilityModel.updateAvailability(advisorId, isAvailable);
    res.json({ success: true, advisor: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando disponibilidad' });
  }
});

// Eliminar disponibilidad
router.delete('/:advisorId', async (req, res) => {
  const { advisorId } = req.params;
  try {
    await AdvisorsAvailabilityModel.deleteAdvisor(advisorId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando disponibilidad' });
  }
});

module.exports = router;