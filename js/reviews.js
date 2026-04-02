// reviews.js: Lógica para la página de reseñas (solo frontend, sin integración real)

let isLoggedIn = false;

document.getElementById('google-login').addEventListener('click', function() {
    // Aquí se integrará Google OAuth en el futuro
    isLoggedIn = true;
    document.getElementById('submit-review').disabled = false;
    document.getElementById('google-login').disabled = true;
    document.getElementById('google-login').textContent = 'Sesión iniciada';
});

document.getElementById('review-form').addEventListener('input', function() {
    // El botón de publicar solo se habilita si hay sesión iniciada
    document.getElementById('submit-review').disabled = !isLoggedIn;
});

document.getElementById('review-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!isLoggedIn) return;
    // Simulación de reseña publicada
    const procedure = document.getElementById('procedure').value;
    const age = document.getElementById('age').value;
    const comments = document.getElementById('comments').value;
    // Simulación de datos de usuario autenticado
    const user = {
        name: 'Usuario Demo',
        photo: 'https://www.gravatar.com/avatar/?d=mp',
        age: age,
        procedure: procedure,
        comments: comments
    };
    addReviewCard(user);
    document.getElementById('review-message').textContent = '¡Reseña publicada! (Simulación)';
    document.getElementById('review-form').reset();
    document.getElementById('submit-review').disabled = true;
    isLoggedIn = false;
    document.getElementById('google-login').disabled = false;
    document.getElementById('google-login').textContent = 'Iniciar sesión con Google';
});

function addReviewCard({ name, photo, age, procedure, comments }) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <img class="profile-pic" src="${photo}" alt="Foto de perfil">
        <div class="review-info">
            <div class="review-header">
                <span class="review-name">${name}</span>
                <span class="review-age">${age} años</span>
            </div>
            <div class="review-procedure">${procedure.charAt(0).toUpperCase() + procedure.slice(1)}</div>
            <div class="review-comments">${comments}</div>
        </div>
    `;
    document.getElementById('reviews-list').prepend(card);
}
