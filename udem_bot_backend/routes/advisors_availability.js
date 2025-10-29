const express = require('express');
const AdvisorsAvailabilityModel = require('../models/advisors_availabilityModel');
const router = express.Router();

// Crear asesor
router.post('/', async (req, res) => {
  const { name, email, available } = req.body;
  try {
    const advisor = await AdvisorsAvailabilityModel.createAdvisor(name, email, available);
    res.json({ success: true, advisor });
  } catch (err) {
    res.status(500).json({ error: 'Error creando asesor' });
  }
});

// Listar asesores
router.get('/', async (req, res) => {
  try {
    const advisors = await AdvisorsAvailabilityModel.getAllAdvisors();
    res.json(advisors);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo asesores' });
  }
});

// Actualizar disponibilidad
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;
  try {
    const updated = await AdvisorsAvailabilityModel.updateAvailability(id, available);
    res.json({ success: true, advisor: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando disponibilidad' });
  }
});

// Eliminar asesor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await AdvisorsAvailabilityModel.deleteAdvisor(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando asesor' });
  }
});

module.exports = router;
