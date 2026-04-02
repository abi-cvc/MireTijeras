// Lógica inicial para la gestión de sugerencias

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Simulación de sugerencias (luego se reemplazará por datos del backend)
const suggestions = [
    {
        id: 1,
        nombre: 'María López',
        fecha: '2026-04-01',
        texto: 'Sería genial tener más horarios disponibles.',
        estado: 'por revisar'
    },
    {
        id: 2,
        nombre: 'Juan García',
        fecha: '2026-03-30',
        texto: 'Me gustaría que agreguen más servicios para caballeros.',
        estado: 'revisando'
    }
];

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
                <span>${s.nombre}</span>
                <span class="suggestion-date">${s.fecha}</span>
            </div>
            <div class="suggestion-text">${s.texto}</div>
            <div class="suggestion-status">
                <label for="estado-${s.id}">Estado:</label>
                <select id="estado-${s.id}" data-idx="${idx}">
                    ${estados.map(e => `<option value="${e}"${e === s.estado ? ' selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
                </select>
            </div>
        `;
        list.appendChild(card);
    });
    // Agregar listeners para los selects
    document.querySelectorAll('.suggestion-status select').forEach(sel => {
        // Badge visual según estado actual
        const idx = sel.getAttribute('data-idx');
        sel.setAttribute('data-current', suggestions[idx].estado);
        sel.addEventListener('change', function() {
            const idx = this.getAttribute('data-idx');
            suggestions[idx].estado = this.value;
            renderSuggestions(); // Refrescar para aplicar filtro si cambia estado
            // Aquí podrías guardar el cambio en backend si lo deseas
        });
    });
}

if (document.getElementById('filter-estado')) {
    document.getElementById('filter-estado').addEventListener('change', renderSuggestions);
}

renderSuggestions();
