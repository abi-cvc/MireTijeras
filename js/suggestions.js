// suggestions.js: Lógica para animación de carta al enviar sugerencia


// Detecta si está en localhost o en producción
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://miretijeras.onrender.com";

document.getElementById('suggestion-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('suggestion-message').textContent = '';
    const nombre = document.getElementById('suggestion-name').value;
    const email = document.getElementById('suggestion-email').value;
    const texto = document.getElementById('suggestion-text').value;
    try {
        const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, texto })
        });
        if (!res.ok) throw new Error('Error al enviar sugerencia');
        document.getElementById('suggestion-form').reset();
        const envelope = document.getElementById('envelope-animation');
        envelope.style.display = 'flex';
        setTimeout(() => {
            envelope.style.display = 'none';
            document.getElementById('suggestion-message').textContent = '¡Gracias por tu sugerencia!';
        }, 2000);
    } catch (err) {
        document.getElementById('suggestion-message').textContent = 'Error al enviar sugerencia';
    }
});
