const express = require('express');
const { getUsers, createUser } = require('../models/userModel');
const router = express.Router();  // Crea un "enrutador" para estas rutas.

router.get('/', async (req, res) => {  // Ruta para obtener usuarios (GET /api/users).
  try {
    const users = await getUsers();
    res.json(users);  // Envía los datos como JSON (formato fácil para JS).
  } catch (err) {
    res.status(500).json({ error: err.message });  // Si hay error, envía mensaje.
  }
});

router.post('/', async (req, res) => {  // Ruta para crear usuario (POST /api/users).
  const { name, email, role } = req.body;  // Toma datos del "cuerpo" de la petición.
  try {
    const user = await createUser(name, email, role);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;