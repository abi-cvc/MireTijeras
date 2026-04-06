// reviews.routes.js - Rutas para gestión de reseñas
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Obtener todas las reseñas (públicas: solo visibles)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews WHERE visible = true ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva reseña
router.post('/', async (req, res) => {
  const { nombre, fecha, texto, foto, procedimiento, edad } = req.body;
  try {
    // Log de los datos recibidos
    console.log('POST /api/reviews body:', req.body);
    const result = await pool.query(
      'INSERT INTO reviews (nombre, fecha, texto, foto, procedimiento, edad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, fecha, texto, foto, procedimiento, edad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Log de error detallado
    console.error('Error al insertar reseña:', err);
    res.status(500).json({ error: err.message });
  }
});


// Pinear/despinear una reseña (solo si visible y máximo 10 pineadas)
router.put('/:id/pin', async (req, res) => {
  try {
    // Obtener la reseña
    const { rows } = await pool.query('SELECT pineada, visible FROM reviews WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Reseña no encontrada' });
    const review = rows[0];
    if (!review.visible) return res.status(400).json({ error: 'Solo se pueden pinear reseñas visibles' });
    if (!review.pineada) {
      // Si se va a pinear, contar cuántas hay pineadas
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
router.put('/:id/visible', async (req, res) => {
  const { visible } = req.body;
  if (typeof visible !== 'boolean') return res.status(400).json({ error: 'Valor de visibilidad inválido' });
  try {
    // Si se oculta, también se despinea
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
