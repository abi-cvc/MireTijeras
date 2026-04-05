// reviews.js: Lógica real para reseñas con Google Sign-In

const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

// Al cargar, revisa si hay usuario autenticado
const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    habilitarFormulario(user);
}

// Google Sign-In callback
function onGoogleSignIn(response) {
    fetch(`${API_BASE_URL}/api/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
    })
    .then(res => res.json())
    .then(data => {
        if (data.nombre && data.foto) {
            localStorage.setItem('user', JSON.stringify(data));
            habilitarFormulario(data);
        } else {
            alert('No se pudo autenticar con Google');
        }
    });
}

function habilitarFormulario(user) {
    document.getElementById('submit-review').disabled = false;
    // Opcional: muestra el nombre/foto en la UI
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.innerHTML = `<img src="${user.foto}" alt="Foto" class="profile-pic"> <span>${user.nombre}</span>`;
    }
}

// Enviar reseña real
document.getElementById('review-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('Debes iniciar sesión con Google');
    const procedure = document.getElementById('procedure').value;
    const age = document.getElementById('age').value;
    const comments = document.getElementById('comments').value;
    fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: user.nombre,
            foto: user.foto,
            fecha: new Date().toISOString().slice(0,10),
            texto: comments,
            procedimiento: procedure,
            edad: age
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('review-message').textContent = '¡Reseña publicada!';
        document.getElementById('review-form').reset();
        fetchReviews().then(renderReviews);
    });
});

// Obtener y renderizar reseñas
async function fetchReviews() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews`);
        return await res.json();
    } catch {
        return [];
    }
}

async function renderReviews() {
    const reviews = await fetchReviews();
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <img class="profile-pic" src="${r.foto || 'https://www.gravatar.com/avatar/?d=mp'}" alt="Foto de perfil">
            <div class="review-info">
                <div class="review-header">
                    <span class="review-name">${r.nombre}</span>
                    ${r.edad ? `<span class="review-age">${r.edad} años</span>` : ''}
                </div>
                ${r.procedimiento ? `<div class="review-procedure">${r.procedimiento.charAt(0).toUpperCase() + r.procedimiento.slice(1)}</div>` : ''}
                <div class="review-comments">${r.texto}</div>
            </div>
        `;
        list.appendChild(card);
    });
}

// Inicializar reseñas al cargar
renderReviews();

const user = JSON.parse(localStorage.getItem('user'));
fetch('https://TU_BACKEND_URL/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nombre: user.nombre,
        foto: user.foto,
        fecha: new Date().toISOString().slice(0,10),
        texto: document.getElementById('texto-reseña').value
    })
});