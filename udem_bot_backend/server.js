// ======================================================
// 🎓 SERVER COMPLETO: UdeM Chatbot + PostgreSQL + Gemini
// ======================================================

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// 🌐 MIDDLEWARES
// ======================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self' http://localhost:3000; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; img-src 'self' data: blob:; connect-src 'self' http://localhost:3000"
  );
  next();
});


// Archivos estáticos
app.use('/html', express.static(path.join(__dirname, '..', 'html')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

// Redirección inicial
app.get('/', (req, res) => {
  res.redirect('/html/registro.html');
});

// ======================================================
// 🔑 LOGIN CON JWT
// ======================================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y password son requeridos' });

  try {
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role, message: 'Login exitoso' });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ======================================================
// 🧂 UTILIDAD PARA HASHEAR CONTRASEÑAS
// ======================================================
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// ======================================================
// 🤖 INTEGRACIÓN CON GOOGLE GEMINI
// ======================================================
let gemini;
if (process.env.GEMINI_API_KEY) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('🟢 Gemini inicializado correctamente');
} else {
  console.warn('⚠️ GEMINI_API_KEY no encontrada. Gemini no estará disponible.');
  gemini = null;
}

// ======================================================
// 📦 IMPORTAR MODELOS Y RUTAS DEL CHATBOT
// ======================================================
try {
  const chatbotRouter = require('./routes/chatbot');
  app.use('/api/chatbot', chatbotRouter);
  console.log('✅ Router de chatbot cargado');
} catch (err) {
  console.error('❌ Error importando chatbot router:', err);
}

// ======================================================
// 📜 IMPORTAR ROUTERS EXISTENTES
// ======================================================
try {
  const usersRouter = require('./routes/users');
  const remindersRouter = require('./routes/reminders');
  const gradesRouter = require('./routes/grades');
  const advisorsAvailabilityRouter = require('./routes/advisors_availability');
  const messagesRouter = require('./routes/messages');
  const conversationsRouter = require('./routes/conversations');
  const coursesRouter = require('./routes/courses');
  const materiasRouter = require('./routes/materias');

  app.use('/api/users', usersRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/grades', gradesRouter);
  app.use('/api/advisors_availability', advisorsAvailabilityRouter);
  app.use('/api/conversations', conversationsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/courses', coursesRouter);
  app.use('/api/materias', materiasRouter);

  console.log('✅ Rutas cargadas correctamente');
} catch (err) {
  console.error('❌ Error importando routers:', err);
}

// ======================================================
// 🏢 RUTAS PARA LOS HTML DEL ASESOR
// ======================================================
app.get('/asesor_seguimiento', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'MultipleFiles', 'asesor_seguimiento.html'));
});
app.get('/casos_pendientes', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'MultipleFiles', 'casos_pendientes.html'));
});
app.get('/casos_resueltos', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'MultipleFiles', 'casos_resueltos.html'));
});

// ======================================================
// 🚀 INICIAR SERVIDOR
// ======================================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Error al iniciar servidor:', err);
});

module.exports = { gemini };  // Exporta gemini, NO openai