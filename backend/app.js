// Punto de entrada del backend
const express = require('express');
const AuthService = require('./services/AuthService');

const app = express();
const authService = new AuthService();
const cors = require('cors');

app.use(express.json());
app.use(cors()); // Permitir CORS para desarrollo local

// Ruta para login de administrador
app.post('/api/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const isValid = await authService.login(email, password);
    if (isValid) {
        res.status(200).json({ success: true, message: 'Login exitoso' });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

// Puerto configurable
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend escuchando en puerto ${PORT}`);
});
