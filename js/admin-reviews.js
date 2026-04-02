// Lógica inicial para la gestión de reseñas

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Simulación de reseñas (luego se reemplazará por datos del backend)
const reviews = [
    {
        id: 1,
        nombre: 'Ana Torres',
        fecha: '2026-04-01',
        texto: '¡Excelente servicio y atención!'
    },
    {
        id: 2,
        nombre: 'Carlos Pérez',
        fecha: '2026-03-28',
        texto: 'Muy profesionales, recomendado.'
    }
];

function renderReviews() {
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-header">
                <span>${r.nombre}</span>
                <span class="review-date">${r.fecha}</span>
            </div>
            <div class="review-text">${r.texto}</div>
            <div class="review-actions">
                <button onclick="alert('Pinear reseña #${r.id}')">Pinear</button>
                <button onclick="alert('Ocultar reseña #${r.id}')">Ocultar</button>
            </div>
        `;
        list.appendChild(card);
    });
}

renderReviews();
