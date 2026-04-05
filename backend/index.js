// Crear tabla suggestions si no existe
const pool = require('./db');
pool.query(`CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  texto TEXT NOT NULL
)`);

// index.js - Servidor Express principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // si usas cookies o autenticación
}));
app.use(express.json());


// Rutas de citas
app.use('/api', require('./citas.routes'));
// Rutas de convenios
app.use('/api/convenios', require('./convenios.routes'));
// Rutas de reseñas
app.use('/api/reviews', require('./reviews.routes'));

// Ruta para sugerencias
app.post('/api/suggestions', async (req, res) => {
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: 'Texto requerido' });
  try {
    const result = await pool.query(
      'INSERT INTO suggestions (texto) VALUES ($1) RETURNING *',
      [texto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar sugerencia:', err);
    res.status(500).json({ error: 'Error al guardar sugerencia' });
  }
});

// Ruta para login de administrador
const AuthService = require('./services/AuthService');
const authService = new AuthService();
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const isValid = await authService.login(email, password);
  if (isValid) {
    res.status(200).json({ success: true, message: 'Login exitoso' });
  } else {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // payload.name, payload.picture, payload.email
    res.json({
      nombre: payload.name,
      foto: payload.picture,
      email: payload.email
    });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
});