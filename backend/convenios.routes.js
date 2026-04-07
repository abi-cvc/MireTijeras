// convenios.routes.js: Rutas para la gestión de convenios
const express = require('express');
const router = express.Router();
const pool = require('./db');
const verifyAdmin = require('./middleware/verifyAdmin');
const validate = require('./middleware/validate');
const { body } = require('express-validator');

// Obtener todos los convenios (admin, con paginación opcional)
router.get('/', verifyAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || null;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    try {
        if (page) {
            const offset = (page - 1) * limit;
            const [dataRes, countRes] = await Promise.all([
                pool.query('SELECT * FROM convenios ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
                pool.query('SELECT COUNT(*) FROM convenios'),
            ]);
            return res.json({
                data: dataRes.rows,
                total: parseInt(countRes.rows[0].count),
                page,
                totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
            });
        }
        const result = await pool.query('SELECT * FROM convenios ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener convenios' });
    }
});

// Crear un nuevo convenio
const convenioValidation = [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
    body('email').trim().notEmpty().withMessage('El email es requerido').isEmail().withMessage('El email no es válido').isLength({ max: 100 }).withMessage('El email no puede superar 100 caracteres'),
    body('empresa').trim().notEmpty().withMessage('La empresa es requerida').isLength({ max: 100 }).withMessage('La empresa no puede superar 100 caracteres'),
    body('telefono').optional({ nullable: true }).isLength({ max: 30 }).withMessage('El teléfono no puede superar 30 caracteres'),
    body('mensaje').optional({ nullable: true }),
];

router.post('/', convenioValidation, validate, async (req, res) => {
    const { nombre, email, telefono, empresa, mensaje } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO convenios (nombre, email, telefono, empresa, mensaje) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, email, telefono || null, empresa, mensaje || '']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear convenio', details: err.message });
    }
});

// Actualizar estado de un convenio
router.patch('/:id', verifyAdmin, async (req, res) => {
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
        res.status(500).json({ error: 'Error al actualizar convenio' });
    }
});

module.exports = router;
