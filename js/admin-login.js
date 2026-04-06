// Detecta si está en localhost o en producción
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://miretijeras.onrender.com";

// Lógica para el login de administrador

document.getElementById('admin-login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = '';

    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success && data.token) {
            sessionStorage.setItem('adminToken', data.token);
            window.location.href = 'admin-panel.html';
        } else {
            errorDiv.textContent = data.message || 'Credenciales incorrectas';
        }
    } catch (err) {
        errorDiv.textContent = 'Error de conexión con el servidor';
    }
});
