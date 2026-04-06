// Lógica inicial para la gestión de sugerencias

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});


// Detecta si está en localhost o en producción
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getAdminToken() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { window.location.href = 'admin-login.html'; return null; }
    return token;
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAdminToken()}` };
}

let suggestions = [];

async function fetchSuggestions() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/suggestions`, { headers: authHeaders() });
        suggestions = await res.json();
    } catch (err) {
        suggestions = [];
    }
}

const estados = ['por revisar', 'revisando', 'finalizado'];

function renderSuggestions() {
    const list = document.getElementById('suggestions-list');
    const filter = document.getElementById('filter-estado') ? document.getElementById('filter-estado').value : 'todos';
    list.innerHTML = '';
    suggestions.forEach((s, idx) => {
        if (filter !== 'todos' && s.estado !== filter) return;
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <div class="suggestion-header">
                <span class="suggestion-date">${escapeHtml(String(s.fecha))}</span>
            </div>
            <div class="suggestion-text">${escapeHtml(s.texto)}</div>
            <div class="suggestion-status">
                <label for="estado-${s.id}">Estado:</label>
                <select id="estado-${s.id}" data-id="${s.id}" data-idx="${idx}">
                    ${estados.map(e => `<option value="${e}"${e === s.estado ? ' selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
                </select>
            </div>
        `;
        list.appendChild(card);
    });
    // Agregar listeners para los selects
    document.querySelectorAll('.suggestion-status select').forEach(sel => {
        const idx = sel.getAttribute('data-idx');
        sel.setAttribute('data-current', suggestions[idx].estado);
        sel.addEventListener('change', async function() {
            const id = this.getAttribute('data-id');
            const nuevoEstado = this.value;
            try {
                const res = await fetch(`${API_BASE_URL}/api/suggestions/${id}`, {
                    method: 'PUT',
                    headers: authHeaders(),
                    body: JSON.stringify({ estado: nuevoEstado })
                });
                if (!res.ok) throw new Error('Error al actualizar estado');
                await fetchSuggestions();
                renderSuggestions();
            } catch (err) {
                alert('Error al actualizar estado');
            }
        });
    });
}

if (document.getElementById('filter-estado')) {
    document.getElementById('filter-estado').addEventListener('change', renderSuggestions);
}


(async function() {
    await fetchSuggestions();
    renderSuggestions();
})();
