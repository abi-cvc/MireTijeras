// Lógica inicial para la gestión de reseñas

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});


// Detecta si está en localhost o en producción
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

let reviews = [];

async function fetchReviews() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews`);
        reviews = await res.json();
    } catch (err) {
        alert('Error al obtener reseñas del servidor');
        reviews = [];
    }
}


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
                <button class="pin-btn" data-id="${r.id}">Pinear</button>
                <button class="hide-btn" data-id="${r.id}">Ocultar</button>
            </div>
        `;
        list.appendChild(card);
    });
    // Listeners para pinear y ocultar
    list.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const res = await fetch(`${API_BASE_URL}/api/reviews/${id}/pin`, { method: 'PUT' });
                if (!res.ok) throw new Error('Error al pinear reseña');
                await fetchReviews();
                renderReviews();
            } catch (err) {
                alert('Error al pinear reseña');
            }
        });
    });
    list.querySelectorAll('.hide-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            if (confirm('¿Ocultar esta reseña?')) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Error al ocultar reseña');
                    await fetchReviews();
                    renderReviews();
                } catch (err) {
                    alert('Error al ocultar reseña');
                }
            }
        });
    });
}


(async function() {
    await fetchReviews();
    renderReviews();
})();
