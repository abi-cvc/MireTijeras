// Lógica preliminar para el dashboard de administración

document.getElementById('logout-btn').addEventListener('click', function() {
    // En un futuro: limpiar sesión/token
    window.location.href = 'admin-login.html';
});

document.getElementById('card-citas').addEventListener('click', function() {
    window.location.href = 'admin-citas.html';
});

document.getElementById('card-reseñas').addEventListener('click', function() {
    window.location.href = 'admin-reviews.html';
});

document.getElementById('card-sugerencias').addEventListener('click', function() {
    window.location.href = 'admin-suggestions.html';
});

document.getElementById('card-convenios').addEventListener('click', function() {
    window.location.href = 'admin-convenios.html';
});
