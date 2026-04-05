// convenios.routes.js: Rutas para la gestión de convenios
const express = require('express');
const router = express.Router();
const pool = require('./db');

// Obtener todos los convenios
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM convenios ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener convenios:', err);
        res.status(500).json({ error: 'Error al obtener convenios' });
    }
});

// Crear un nuevo convenio
router.post('/', async (req, res) => {
    const { nombre, email, telefono, empresa, mensaje } = req.body;
    if (!nombre || !email || !empresa) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO convenios (nombre, email, telefono, empresa, mensaje) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, email, telefono, empresa, mensaje || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear convenio:', err);
        res.status(500).json({ error: 'Error al crear convenio' });
    }
});

// Actualizar estado de un convenio
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const result = await pool.query(
            'UPDATE convenios SET estado = $1 WHERE id = $2 RETURNING *',
            [estado, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Convenio no encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar convenio:', err);
        res.status(500).json({ error: 'Error al actualizar convenio' });
    }
});

module.exports = router;
