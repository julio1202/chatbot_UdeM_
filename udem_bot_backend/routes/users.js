const express = require('express');
const UserModel = require('../models/userModel.js');
const router = express.Router();

// Ruta POST para crear usuario
router.post('/', async (req, res) => {
  const { id, name, email, password, role } = req.body;
  try {
    const newUser = await UserModel.createUser(id, name, email, password, role);
    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error creando usuario:', err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// Ruta POST para login
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const user = await UserModel.findUserByEmail(usuario);
    if (user && user.password === password) {
      res.json({ success: true, message: 'Login exitoso', user });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;