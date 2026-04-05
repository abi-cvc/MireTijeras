// reviews.routes.js - Rutas para gestión de reseñas
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Obtener todas las reseñas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva reseña
router.post('/', async (req, res) => {
  const { nombre, fecha, texto, foto, procedimiento, edad } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reviews (nombre, fecha, texto, foto, procedimiento, edad) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, fecha, texto, foto, procedimiento, edad]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pinear una reseña
router.put('/:id/pin', async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET pineada = NOT pineada WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ocultar (eliminar) una reseña
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
