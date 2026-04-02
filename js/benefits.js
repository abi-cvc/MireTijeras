// benefits.js: Simulación de envío de formulario de convenios

document.getElementById('benefits-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('benefits-form').reset();
    document.getElementById('benefits-message').textContent = '';
    const form = document.getElementById('benefits-form');
    const plane = document.getElementById('paper-plane-svg');
    // Mostrar y animar el avión de papel
    plane.style.display = 'block';
    plane.classList.remove('reset-animation');
    // Forzar reflow para reiniciar animación si se envía varias veces
    plane.offsetWidth;
    plane.classList.add('paper-plane-svg');
    // Ocultar el avión después de la animación
    setTimeout(() => {
        plane.style.display = 'none';
        plane.classList.add('reset-animation');
        form.reset();
    }, 2200);
    // Aquí irá la lógica para enviar datos al backend
});
