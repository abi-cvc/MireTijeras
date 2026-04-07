// Lógica inicial para la gestión de reseñas
// Dependencias compartidas cargadas por admin-common.js

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

let reviews = [];

async function fetchReviews() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/reviews/all`, { headers: authHeaders() });
        reviews = await res.json();
    } catch (err) {
        alert('Error al obtener reseñas del servidor');
        reviews = [];
    }
}


function renderReviews() {
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';
    // Contar cuántas hay pineadas y visibles
    const pinCount = reviews.filter(r => r.pineada && r.visible).length;
    reviews.forEach(r => {
        const card = document.createElement('div');
        card.className = 'review-card';
        if (!r.visible) card.classList.add('review-hidden');
        card.innerHTML = `
            <div class="review-header">
                <span>${escapeHtml(r.nombre)}</span>
                <span class="review-date">${escapeHtml(String(r.fecha))}</span>
            </div>
            <div class="review-text">${escapeHtml(r.texto)}</div>
            <div class="review-actions">
                <button class="pin-btn" data-id="${r.id}" ${!r.visible ? 'disabled' : ''} ${r.pineada ? 'data-pinned="true"' : ''}>
                    ${r.pineada ? 'Despinear' : 'Pinear'}
                </button>
                <button class="vis-btn" data-id="${r.id}">
                    ${r.visible ? 'Ocultar' : 'Visible'}
                </button>
            </div>
            <div class="review-status">
                ${r.visible ? (r.pineada ? '<span class="pin-status">Pineada</span>' : '<span class="pin-status">Visible</span>') : '<span class="pin-status">Oculta</span>'}
            </div>
        `;
        list.appendChild(card);
    });
    // Listeners para pinear/despinear
    list.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            try {
                const res = await fetch(`${API_BASE_URL}/api/reviews/${id}/pin`, { method: 'PUT', headers: authHeaders() });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al pinear reseña');
                await fetchReviews();
                renderReviews();
            } catch (err) {
                alert(err.message || 'Error al pinear reseña');
            }
        });
    });
    // Listeners para visibilidad
    list.querySelectorAll('.vis-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            const review = reviews.find(r => r.id == id);
            const newVisible = !review.visible;
            let msg = newVisible ? '¿Hacer visible esta reseña?' : '¿Ocultar esta reseña?';
            if (confirm(msg)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/reviews/${id}/visible`, {
                        method: 'PUT',
                        headers: authHeaders(),
                        body: JSON.stringify({ visible: newVisible })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Error al cambiar visibilidad');
                    await fetchReviews();
                    renderReviews();
                } catch (err) {
                    alert(err.message || 'Error al cambiar visibilidad');
                }
            }
        });
    });
}


(async function() {
    await fetchReviews();
    renderReviews();
})();
