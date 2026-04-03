// benefits.js: Simulación de envío de formulario de convenios


// Detecta si está en localhost o en producción
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://miretijeras.onrender.com";

document.getElementById('benefits-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('benefits-message').textContent = '';
    const org = document.getElementById('benefits-org').value;
    const contacto = document.getElementById('benefits-contact').value;
    const email = document.getElementById('benefits-email').value;
    const telefono = document.getElementById('benefits-phone').value;
    const mensaje = document.getElementById('benefits-message-text').value;
    try {
        const res = await fetch(`${API_BASE_URL}/api/convenios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ org, contacto, email, telefono, mensaje })
        });
        if (!res.ok) throw new Error('Error al enviar solicitud');
        document.getElementById('benefits-form').reset();
        const plane = document.getElementById('paper-plane-svg');
        plane.style.display = 'block';
        plane.classList.remove('reset-animation');
        plane.offsetWidth;
        plane.classList.add('paper-plane-svg');
        setTimeout(() => {
            plane.style.display = 'none';
            plane.classList.add('reset-animation');
            document.getElementById('benefits-message').textContent = '¡Solicitud enviada!';
        }, 2200);
    } catch (err) {
        document.getElementById('benefits-message').textContent = 'Error al enviar solicitud';
    }
});
