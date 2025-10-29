const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');  // Para hashing de passwords
const jwt = require('jsonwebtoken');  // Para generar tokens JWT
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;  // Usa variable de entorno

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para CSP ajustado (permite conexiones a localhost)
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:3000");
  next();
});

// Ruta para Chrome DevTools (evita 404)
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({});  // Devuelve un objeto vacío
});

// Sirve archivos estáticos
app.use('/html', express.static(path.join(__dirname, '..', 'html')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use('/imagenes', express.static(path.join(__dirname, '..', 'imagenes')));

// Ruta GET para la raíz
app.get('/', (req, res) => {
  res.redirect('/html/registro.html');
});

// Importa y usa routers (descomentado y con manejo de errores)
try {
  const usersRouter = require('./routes/users');
  const remindersRouter = require('./routes/reminders');
  const gradesRouter = require('./routes/grades');
  app.use('/api/users', usersRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/grades', gradesRouter);
} catch (err) {
  console.error('Error importando routers:', err);
}

// Conexión a PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect((err) => {
  if (err) {
    console.error('Error conectando a PostgreSQL:', err);
  } else {
    console.log('Conectado a PostgreSQL exitosamente');
  }
});

// Ruta POST para login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password son requeridos' });
  }

  try {
    // Busca usuario en DB
    const query = 'SELECT id, name, email, password, role FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Verifica password (asume que está hasheada con bcrypt)
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Genera JWT token (expira en 1 hora)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tu_secreto_jwt',  // Agrega JWT_SECRET a .env
      { expiresIn: '1h' }
    );

    // Respuesta exitosa
    res.json({ token, role: user.role, message: 'Login exitoso' });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ejemplo: Función para hashear password al registrar (llámala en /api/users POST)
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}
// Uso: const hashed = await hashPassword(req.body.password); luego guarda en DB

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Error al iniciar servidor:', err);
});