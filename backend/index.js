// index.js - Servidor Express principal
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = [
  'http://localhost:3000', // para desarrollo local
  'https://mire-tijeras-mh3afnm7l-abigails-projects-f25ee858.vercel.app', // tu dominio de Vercel
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, // si usas cookies o autenticación
}));
app.use(express.json());

app.use('/api', require('./citas.routes'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});

