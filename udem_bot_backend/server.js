const express = require('express');  // Importa "express", una librería para crear servidores web.
const cors = require('cors');        // Permite que tu frontend (HTML/JS) hable con el servidor.
const path = require('path');        // Ayuda a encontrar archivos en tu computadora.
require('dotenv').config();          // Carga las cosas secretas del archivo .env.

const app = express();               // Crea una "app" de Express (tu servidor).
const PORT = process.env.PORT || 3000;  // El puerto donde corre el servidor (como una puerta).

app.use(cors());                     // Activa CORS para que funcione con tu frontend.
app.use(express.json());             // Permite recibir datos en formato JSON (como objetos JS).
app.use(express.static(path.join(__dirname, '../MultipleFiles')));  // Sirve tus archivos HTML/CSS/JS.

// Ruta para la página principal: Cuando alguien va a "/", muestra menu_principal.html.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../MultipleFiles/menu_principal.html'));
});

// Aquí agregarás más rutas para la API (veremos después).

app.listen(PORT, () => {             // Enciende el servidor en el puerto 3000.
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.use('/api/users', require('./routes/users'));