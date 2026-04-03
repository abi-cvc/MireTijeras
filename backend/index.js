// index.js - Servidor Express principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // si usas cookies o autenticación
}));
app.use(express.json());


// Rutas de citas
app.use('/api', require('./citas.routes'));

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

