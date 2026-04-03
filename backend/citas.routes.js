// Rutas para gestión de franjas y citas
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Obtener todas las franjas
router.get('/franjas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM franjas ORDER BY fecha, hora_inicio');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear una nueva franja
router.post('/franjas', async (req, res) => {
  const { fecha, hora_inicio, hora_fin } = req.body;
  try {
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
router.delete('/franjas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM franjas WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener todas las citas
router.get('/citas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha, hora');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Agendar una cita
router.post('/citas', async (req, res) => {
  const { fecha, hora, cliente, servicio, franja_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO citas (fecha, hora, cliente, servicio, franja_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [fecha, hora, cliente, servicio, franja_id]
    );
    // Marcar la franja como no disponible si se agenda una cita
    await pool.query('UPDATE franjas SET disponible = FALSE WHERE id = $1', [franja_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
