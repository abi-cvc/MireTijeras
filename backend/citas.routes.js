// Rutas para gestión de franjas y citas
const express = require('express');
const router = express.Router();
const pool = require('./db');
const verifyAdmin = require('./middleware/verifyAdmin');
const validate = require('./middleware/validate');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { notificarCita } = require('./services/emailService');

const citasLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: { error: 'Demasiadas solicitudes de citas. Intenta de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ruta pública: franjas ocupadas (solo fecha+hora, sin datos personales)
router.get('/citas/disponibilidad', async (req, res) => {
  try {
    const result = await pool.query('SELECT fecha, hora FROM citas ORDER BY fecha, hora');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las franjas (sin paginación — el calendario necesita todas)
router.get('/franjas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM franjas ORDER BY fecha, hora_inicio');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva franja
const franjaValidation = [
  body('fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('hora_inicio').notEmpty().withMessage('La hora de inicio es requerida').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)'),
  body('hora_fin').notEmpty().withMessage('La hora de fin es requerida').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)'),
];

router.post('/franjas', verifyAdmin, franjaValidation, validate, async (req, res) => {
  const { fecha, hora_inicio, hora_fin } = req.body;
  try {
    const { rows: solapadas } = await pool.query(
      `SELECT * FROM franjas WHERE fecha = $1 AND NOT ($3 <= hora_inicio OR $2 >= hora_fin)`,
      [fecha, hora_inicio, hora_fin]
    );
    if (solapadas.length > 0) {
      return res.status(400).json({ error: 'La franja se solapa con otra existente para ese día.' });
    }
    const result = await pool.query(
      'INSERT INTO franjas (fecha, hora_inicio, hora_fin) VALUES ($1, $2, $3) RETURNING *',
      [fecha, hora_inicio, hora_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar una franja
router.delete('/franjas/:id', verifyAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM franjas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las citas (admin, con paginación opcional)
router.get('/citas', verifyAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || null;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  try {
    if (page) {
      const offset = (page - 1) * limit;
      const [dataRes, countRes] = await Promise.all([
        pool.query('SELECT * FROM citas ORDER BY fecha, hora LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*) FROM citas'),
      ]);
      return res.json({
        data: dataRes.rows,
        total: parseInt(countRes.rows[0].count),
        page,
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
      });
    }
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha, hora');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agendar una cita
const citaValidation = [
  body('fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('hora').notEmpty().withMessage('La hora es requerida').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)'),
  body('cliente').trim().notEmpty().withMessage('El nombre del cliente es requerido').isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('servicio').trim().notEmpty().withMessage('El servicio es requerido').isLength({ max: 100 }).withMessage('El servicio no puede superar 100 caracteres'),
  body('email').optional({ nullable: true, checkFalsy: true }).isEmail().withMessage('Email inválido').normalizeEmail(),
  body('telefono').optional({ nullable: true, checkFalsy: true }).isLength({ max: 30 }).withMessage('Teléfono demasiado largo'),
];

router.post('/citas', citasLimiter, citaValidation, validate, async (req, res) => {
  const { fecha, hora, cliente, servicio, email, telefono } = req.body;
  try {
    // Resolver franja_id a partir de fecha+hora si no viene en el body
    let franja_id = req.body.franja_id || null;
    if (!franja_id) {
      const franjaRes = await pool.query(
        `SELECT id FROM franjas WHERE fecha = $1 AND hora_inicio <= $2 AND hora_fin > $2 AND disponible = TRUE`,
        [fecha, hora]
      );
      franja_id = franjaRes.rows[0]?.id || null;
    }

    const result = await pool.query(
      'INSERT INTO citas (fecha, hora, cliente, servicio, franja_id, email, telefono) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [fecha, hora, cliente, servicio, franja_id, email || null, telefono || null]
    );

    if (franja_id) {
      await pool.query('UPDATE franjas SET disponible = FALSE WHERE id = $1', [franja_id]);
    }

    // Notificación por email (no bloquea la respuesta)
    notificarCita({ cliente, email, telefono, fecha, hora, servicio });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Limpiar franjas y citas de fechas pasadas (admin)
router.delete('/citas/pasadas', verifyAdmin, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const citasRes = await pool.query('DELETE FROM citas WHERE fecha < $1', [hoy]);
    const franjasRes = await pool.query('DELETE FROM franjas WHERE fecha < $1', [hoy]);
    res.json({
      success: true,
      citasEliminadas: citasRes.rowCount,
      franjasEliminadas: franjasRes.rowCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancelar una cita (libera la franja asociada)
router.delete('/citas/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT franja_id FROM citas WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Cita no encontrada' });

    const franja_id = rows[0].franja_id;
    await pool.query('DELETE FROM citas WHERE id = $1', [id]);

    if (franja_id) {
      await pool.query('UPDATE franjas SET disponible = TRUE WHERE id = $1', [franja_id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
