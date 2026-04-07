// reviews.routes.js - Rutas para gestión de reseñas
const express = require('express');
const router = express.Router();
const pool = require('./db');
const verifyAdmin = require('./middleware/verifyAdmin');
const validate = require('./middleware/validate');
const { body } = require('express-validator');

// Helpers de paginación
function parsePage(query) {
  const page = parseInt(query.page) || null;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  return { page, limit };
}
function paginate(rows, total, page, limit) {
  return { data: rows, total, page, totalPages: Math.ceil(total / limit) };
}

// Obtener todas las reseñas (públicas: solo visibles)
router.get('/', async (req, res) => {
  const { page, limit } = parsePage(req.query);
  try {
    if (page) {
      const offset = (page - 1) * limit;
      const [dataRes, countRes] = await Promise.all([
        pool.query('SELECT * FROM reviews WHERE visible = true ORDER BY fecha DESC LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*) FROM reviews WHERE visible = true'),
      ]);
      return res.json(paginate(dataRes.rows, parseInt(countRes.rows[0].count), page, limit));
    }
    const result = await pool.query('SELECT * FROM reviews WHERE visible = true ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las reseñas (admin: todas)
router.get('/all', verifyAdmin, async (req, res) => {
  const { page, limit } = parsePage(req.query);
  try {
    if (page) {
      const offset = (page - 1) * limit;
      const [dataRes, countRes] = await Promise.all([
        pool.query('SELECT * FROM reviews ORDER BY fecha DESC LIMIT $1 OFFSET $2', [limit, offset]),
        pool.query('SELECT COUNT(*) FROM reviews'),
      ]);
      return res.json(paginate(dataRes.rows, parseInt(countRes.rows[0].count), page, limit));
    }
    const result = await pool.query('SELECT * FROM reviews ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva reseña
const reviewValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
  body('fecha').notEmpty().withMessage('La fecha es requerida').isDate().withMessage('Formato de fecha inválido (YYYY-MM-DD)'),
  body('texto').trim().notEmpty().withMessage('El texto es requerido'),
  body('procedimiento').optional().isLength({ max: 100 }).withMessage('El procedimiento no puede superar 100 caracteres'),
  body('edad').optional({ nullable: true }).isInt({ min: 1, max: 120 }).withMessage('Edad inválida'),
];

router.post('/', reviewValidation, validate, async (req, res) => {
  const { nombre, fecha, texto, foto, procedimiento, edad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (nombre, fecha, texto, foto, procedimiento, edad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, fecha, texto, foto || null, procedimiento || null, edad || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Pinear/despinear una reseña (solo si visible y máximo 10 pineadas)
router.put('/:id/pin', verifyAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT pineada, visible FROM reviews WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Reseña no encontrada' });
    const review = rows[0];
    if (!review.visible) return res.status(400).json({ error: 'Solo se pueden pinear reseñas visibles' });
    if (!review.pineada) {
      const { rows: pinRows } = await pool.query('SELECT COUNT(*) FROM reviews WHERE pineada = true AND visible = true');
      if (parseInt(pinRows[0].count) >= 10) {
        return res.status(400).json({ error: 'Solo puedes pinear hasta 10 reseñas visibles' });
      }
    }
    await pool.query('UPDATE reviews SET pineada = NOT pineada WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cambiar visibilidad de una reseña (ocultar o volver visible)
router.put('/:id/visible', verifyAdmin, async (req, res) => {
  const { visible } = req.body;
  if (typeof visible !== 'boolean') return res.status(400).json({ error: 'Valor de visibilidad inválido' });
  try {
    if (!visible) {
      await pool.query('UPDATE reviews SET visible = false, pineada = false WHERE id = $1', [req.params.id]);
    } else {
      await pool.query('UPDATE reviews SET visible = true WHERE id = $1', [req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
