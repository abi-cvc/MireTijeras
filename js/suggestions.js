// suggestions.js: Lógica para animación de carta al enviar sugerencia

document.getElementById('suggestion-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Simulación de envío (en el backend se enviará el correo)
    document.getElementById('suggestion-form').reset();
    document.getElementById('suggestion-message').textContent = '';
    const envelope = document.getElementById('envelope-animation');
    envelope.style.display = 'flex';
    setTimeout(() => {
        envelope.style.display = 'none';
        document.getElementById('suggestion-message').textContent = '¡Gracias por tu sugerencia!';
    }, 2000);
});
