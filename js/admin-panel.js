// Lógica preliminar para el dashboard de administración

document.getElementById('logout-btn').addEventListener('click', function() {
    // En un futuro: limpiar sesión/token
    window.location.href = 'admin-login.html';
});

document.getElementById('card-citas').addEventListener('click', function() {
    // Aquí luego se mostrará la sección de citas
    alert('Aquí se mostrarán y gestionarán las citas.');
});
document.getElementById('card-reseñas').addEventListener('click', function() {
    alert('Aquí se gestionarán las reseñas.');
});
document.getElementById('card-sugerencias').addEventListener('click', function() {
    alert('Aquí se gestionarán las sugerencias.');
});
document.getElementById('card-convenios').addEventListener('click', function() {
    alert('Aquí se gestionarán los convenios.');
});
