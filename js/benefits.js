// benefits.js: Simulación de envío de formulario de convenios


// Detecta si está en localhost o en producción
const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://miretijeras.onrender.com";

document.getElementById('benefits-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    document.getElementById('benefits-message').textContent = '';
    const org = document.getElementById('org-name').value;
    const contacto = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const telefono = document.getElementById('contact-phone').value;
    const mensaje = document.getElementById('message').value;
    try {
        const res = await fetch(`${API_BASE_URL}/api/convenios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: contacto,
                email,
                telefono,
                empresa: org,
                mensaje
            })
        });
        let data = {};
        try {
            data = await res.json();
        } catch (e) {}
        if (!res.ok) {
            console.error('Respuesta del backend:', data);
            document.getElementById('benefits-message').textContent = data.error || 'Error al enviar solicitud';
            return;
        }
        document.getElementById('benefits-form').reset();
        const planeAnim = document.getElementById('plane-animation');
        if (planeAnim) {
            planeAnim.style.display = 'block';
            planeAnim.classList.remove('reset-animation');
            planeAnim.offsetWidth;
            planeAnim.classList.add('paper-plane-svg');
            setTimeout(() => {
                planeAnim.style.display = 'none';
                planeAnim.classList.add('reset-animation');
                document.getElementById('benefits-message').textContent = '¡Solicitud enviada!';
            }, 2200);
        } else {
            document.getElementById('benefits-message').textContent = '¡Solicitud enviada!';
        }
    } catch (err) {
        document.getElementById('benefits-message').textContent = 'Error al enviar solicitud';
        console.error('Error en fetch:', err);
    }
});
