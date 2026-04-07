// Inicializar tablas, migraciones e índices al arrancar
const pool = require('./db');
const logger = require('./logger');
pool.query(`CREATE TABLE IF NOT EXISTS suggestions (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  texto TEXT NOT NULL,
  estado VARCHAR(30) DEFAULT 'por revisar'
)`).then(() =>
  pool.query(`ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS estado VARCHAR(30) DEFAULT 'por revisar'`)
).then(() => Promise.all([
  pool.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS email VARCHAR(100)`),
  pool.query(`ALTER TABLE citas ADD COLUMN IF NOT EXISTS telefono VARCHAR(30)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_reviews_fecha ON reviews(fecha DESC)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(visible)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_franjas_fecha ON franjas(fecha)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_franjas_disponible ON franjas(disponible)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha)`),
  pool.query(`CREATE INDEX IF NOT EXISTS idx_citas_franja_id ON citas(franja_id)`),
])).catch(err => logger.error('Error en migración inicial', { message: err.message }));

// index.js - Servidor Express principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require('jsonwebtoken');
const verifyAdmin = require('./middleware/verifyAdmin');
const validate = require('./middleware/validate');
const { body } = require('express-validator');

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // si usas cookies o autenticación
}));
app.use(express.json({ limit: '50kb' }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});



// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Rutas de citas
app.use('/api', require('./citas.routes'));
// Rutas de convenios
app.use('/api/convenios', require('./convenios.routes'));
// Rutas de reseñas
app.use('/api/reviews', require('./reviews.routes'));

// Ruta para sugerencias
app.get('/api/suggestions', verifyAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || null;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    if (page) {
      const offset = (page - 1) * limit;
      const [dataRes, countRes] = await Promise.all([
        pool.query('SELECT * FROM suggestions ORDER BY fecha DESC LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*) FROM suggestions'),
      ]);
      return res.json({
        data: dataRes.rows,
        total: parseInt(countRes.rows[0].count),
        page,
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
      });
    }
    const result = await pool.query('SELECT * FROM suggestions ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
});

app.post('/api/suggestions',
  body('texto').trim().notEmpty().withMessage('El texto es requerido'),
  validate,
  async (req, res) => {
    const { texto } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO suggestions (texto) VALUES ($1) RETURNING *',
        [texto]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: 'Error al guardar sugerencia' });
    }
  }
);

// Actualizar estado de una sugerencia
app.put('/api/suggestions/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: 'Estado requerido' });
  try {
    const result = await pool.query(
      'UPDATE suggestions SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sugerencia no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

// Ruta para login de administrador
const AuthService = require('./services/AuthService');
const authService = new AuthService();
app.post('/api/admin/login',
  loginLimiter,
  body('email').trim().notEmpty().withMessage('Email requerido').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida'),
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const isValid = await authService.login(email, password);
    if (isValid) {
      const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
      res.status(200).json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Servidor backend escuchando en puerto ${PORT}`);
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