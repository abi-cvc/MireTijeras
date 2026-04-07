// admin-convenios.js: Lógica para la gestión de convenios en el panel admin
// Dependencias compartidas cargadas por admin-common.js

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

let convenios = [];
const estados = ['por revisar', 'revisando', 'finalizado'];
const aprobaciones = ['pendiente', 'aprobado', 'rechazado'];

async function fetchConvenios() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/convenios`, { headers: authHeaders() });
    convenios = await res.json();
  } catch (err) {
    convenios = [];
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const conveniosList = document.getElementById('convenios-list');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroAprobado = document.getElementById('filtro-aprobado');

    async function renderConvenios() {
        conveniosList.innerHTML = '';
        const estadoFiltro = filtroEstado ? filtroEstado.value : 'todos';
        const aprobadoFiltro = filtroAprobado ? filtroAprobado.value : 'todos';
        convenios.forEach((c, idx) => {
            if (estadoFiltro !== 'todos' && c.estado !== estadoFiltro) return;
            if (aprobadoFiltro !== 'todos' && c.aprobado !== aprobadoFiltro) return;
            const card = document.createElement('div');
            card.className = 'convenio-card';
            card.innerHTML = `
                <strong>${escapeHtml(c.empresa)}</strong> <br>
                Contacto: ${escapeHtml(c.nombre)} <br>
                Email: ${escapeHtml(c.email)} <br>
                Tel: ${escapeHtml(c.telefono)} <br>
                Mensaje: <em>${escapeHtml(c.mensaje)}</em>
                <div class="convenio-status">
                    <label for="estado-${idx}">Estado:</label>
                    <select id="estado-${idx}" data-id="${c.id}" data-idx="${idx}">
                        ${estados.map(e => `<option value="${e}"${e === c.estado ? ' selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
                    </select>
                    ${c.estado === 'finalizado' ? `
                        <label for="aprobado-${idx}" style="margin-left:12px;">Aprobación:</label>
                        <select id="aprobado-${idx}" data-id="${c.id}" data-idx="${idx}">
                            ${aprobaciones.map(a => `<option value="${a}"${a === c.aprobado ? ' selected' : ''}>${a.charAt(0).toUpperCase() + a.slice(1)}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>
            `;
            conveniosList.appendChild(card);
        });
        // Listeners para selects de estado
        document.querySelectorAll('.convenio-status select[id^="estado-"]').forEach(sel => {
            const idx = sel.getAttribute('data-idx');
            sel.setAttribute('data-current', convenios[idx].estado);
            sel.addEventListener('change', async function() {
                const id = this.getAttribute('data-id');
                const nuevoEstado = this.value;
                try {
                    const res = await fetch(`${API_BASE_URL}/api/convenios/${id}`, {
                        method: 'PATCH',
                        headers: authHeaders(),
                        body: JSON.stringify({ estado: nuevoEstado })
                    });
                    if (!res.ok) throw new Error('Error al actualizar estado');
                    await fetchConvenios();
                    renderConvenios();
                } catch (err) {
                    alert('Error al actualizar estado');
                }
            });
        });
        // Listeners para selects de aprobado
        document.querySelectorAll('.convenio-status select[id^="aprobado-"]').forEach(sel => {
            const idx = sel.getAttribute('data-idx');
            sel.setAttribute('data-current', convenios[idx].aprobado);
            sel.addEventListener('change', async function() {
                const id = this.getAttribute('data-id');
                const nuevoAprobado = this.value;
                try {
                    const res = await fetch(`${API_BASE_URL}/api/convenios/${id}`, {
                        method: 'PATCH',
                        headers: authHeaders(),
                        body: JSON.stringify({ aprobado: nuevoAprobado })
                    });
                    if (!res.ok) throw new Error('Error al actualizar aprobación');
                    await fetchConvenios();
                    renderConvenios();
                } catch (err) {
                    alert('Error al actualizar aprobación');
                }
            });
        });
    }

    if (filtroEstado) filtroEstado.addEventListener('change', renderConvenios);
    if (filtroAprobado) filtroAprobado.addEventListener('change', renderConvenios);

    (async function() {
      await fetchConvenios();
      renderConvenios();
    })();
});
