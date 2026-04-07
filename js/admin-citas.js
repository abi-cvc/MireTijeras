// admin-citas.js: Lógica para la gestión de citas en el panel admin
// Dependencias compartidas cargadas por admin-common.js

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

let franjas = [];
let citas = [];

// ── Datos ──────────────────────────────────────────────────────────────────

async function fetchFranjasYCitas() {
    try {
        const [franjasRes, citasRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/franjas`),
            fetch(`${API_BASE_URL}/api/citas`, { headers: authHeaders() })
        ]);
        franjas = await franjasRes.json();
        citas = await citasRes.json();
    } catch (err) {
        franjas = [];
        citas = [];
    }
}

// ── Calendario FullCalendar ────────────────────────────────────────────────

function renderCalendar() {
    const cal = document.getElementById('calendar-admin');
    cal.innerHTML = '';
    const events = [];
    franjas.forEach(f => {
        let fecha = f.fecha;
        if (fecha && fecha.includes('T')) fecha = fecha.split('T')[0];
        events.push({
            title: 'Disponible',
            start: fecha + 'T' + f.hora_inicio,
            end: fecha + 'T' + f.hora_fin,
            color: '#1a9c5e',
            display: 'background',
            extendedProps: { tipo: 'franja' }
        });
    });
    citas.forEach(c => {
        const fecha = (c.fecha || c.dia || '').split('T')[0];
        events.push({
            title: `${c.cliente} — ${c.servicio}`,
            start: fecha + 'T' + c.hora,
            color: '#e10a64',
            extendedProps: { tipo: 'cita', cita: c }
        });
    });
    const calendar = new FullCalendar.Calendar(cal, {
        initialView: 'dayGridMonth',
        locale: 'es',
        height: 500,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events,
        eventDidMount(info) {
            if (info.event.extendedProps.tipo === 'franja') {
                info.el.style.opacity = '0.25';
            }
        },
        eventClick(info) {
            if (info.event.extendedProps.tipo === 'cita') {
                const c = info.event.extendedProps.cita;
                alert(`Cliente: ${c.cliente}\nServicio: ${c.servicio}\nFecha: ${(c.fecha||'').split('T')[0]}  ${c.hora}\nEmail: ${c.email||'—'}\nTeléfono: ${c.telefono||'—'}`);
            }
        },
        dayHeaderFormat: { weekday: 'long' },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        titleFormat: { year: 'numeric', month: 'long' },
        views: {
            dayGridMonth: { dayMaxEventRows: 4 },
            timeGridWeek: { titleFormat: { day: '2-digit', month: 'long', year: 'numeric' } },
            timeGridDay:  { titleFormat: { day: '2-digit', month: 'long', year: 'numeric' } }
        }
    });
    calendar.render();
}

// ── Lista de franjas agrupadas por fecha ───────────────────────────────────

function renderFranjas() {
    const list = document.getElementById('franjas-list');
    list.innerHTML = '';

    if (!franjas.length) {
        list.innerHTML = '<p class="franjas-empty">No hay franjas configuradas.</p>';
        return;
    }

    // Agrupar por fecha
    const grupos = {};
    franjas.forEach(f => {
        const fecha = (f.fecha || '').split('T')[0];
        if (!grupos[fecha]) grupos[fecha] = [];
        grupos[fecha].push(f);
    });

    const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

    Object.keys(grupos).sort().forEach(fecha => {
        const [y, m, d] = fecha.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const label = `${DIAS[dateObj.getDay()]} ${d} de ${MESES[m - 1]} de ${y}`;

        const grupo = document.createElement('div');
        grupo.className = 'franjas-grupo';

        const titulo = document.createElement('div');
        titulo.className = 'franjas-grupo-titulo';
        titulo.textContent = label;
        grupo.appendChild(titulo);

        const chips = document.createElement('div');
        chips.className = 'franjas-chips';

        grupos[fecha].forEach(f => {
            const ocupada = citas.some(c => (c.fecha||'').split('T')[0] === fecha && c.franja_id === f.id);
            const chip = document.createElement('div');
            chip.className = 'franja-chip' + (ocupada ? ' franja-chip--ocupada' : '');

            const hora = document.createElement('span');
            hora.className = 'franja-chip-hora';
            hora.textContent = `${f.hora_inicio.slice(0,5)} – ${f.hora_fin.slice(0,5)}`;

            const estado = document.createElement('span');
            estado.className = 'franja-chip-estado';
            estado.textContent = ocupada ? 'Ocupada' : 'Disponible';

            const acciones = document.createElement('div');
            acciones.className = 'franja-chip-acciones';

            const btnEditar = document.createElement('button');
            btnEditar.className = 'franja-btn-edit';
            btnEditar.title = 'Editar franja';
            btnEditar.innerHTML = '&#9998;';
            btnEditar.addEventListener('click', () => abrirModalEditar(f));

            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'franja-btn-delete';
            btnEliminar.title = 'Eliminar franja';
            btnEliminar.innerHTML = '&#10005;';
            btnEliminar.addEventListener('click', () => eliminarFranja(f.id, ocupada));

            acciones.appendChild(btnEditar);
            acciones.appendChild(btnEliminar);
            chip.appendChild(hora);
            chip.appendChild(estado);
            chip.appendChild(acciones);
            chips.appendChild(chip);
        });

        grupo.appendChild(chips);
        list.appendChild(grupo);
    });
}

// ── Modal ──────────────────────────────────────────────────────────────────

function abrirModal({ id = '', fecha = '', hora_inicio = '', hora_fin = '', titulo = 'Nueva Franja Horaria' } = {}) {
    document.getElementById('franja-modal-title').textContent = titulo;
    document.getElementById('franja-edit-id').value = id;
    document.getElementById('franja-dia').value = fecha;
    document.getElementById('franja-inicio').value = hora_inicio ? hora_inicio.slice(0, 5) : '';
    document.getElementById('franja-fin').value = hora_fin ? hora_fin.slice(0, 5) : '';
    document.getElementById('franja-error').textContent = '';
    document.getElementById('franja-modal').style.display = 'flex';
}

function abrirModalEditar(f) {
    const fecha = (f.fecha || '').split('T')[0];
    abrirModal({ id: f.id, fecha, hora_inicio: f.hora_inicio, hora_fin: f.hora_fin, titulo: 'Editar Franja Horaria' });
}

function cerrarModal() {
    document.getElementById('franja-modal').style.display = 'none';
}

// ── Eliminar franja ────────────────────────────────────────────────────────

async function eliminarFranja(id, ocupada) {
    const msg = ocupada
        ? '⚠️ Esta franja tiene una cita agendada. Si la eliminas, la cita quedará sin franja asociada. ¿Confirmas?'
        : '¿Eliminar esta franja horaria?';
    if (!confirm(msg)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/franjas/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (!res.ok) throw new Error('Error al eliminar');
        await fetchFranjasYCitas();
        renderCalendar();
        renderFranjas();
    } catch (err) {
        alert('Error al eliminar la franja');
    }
}

// ── Guardar (crear o editar) ───────────────────────────────────────────────

async function guardarFranja() {
    const id = document.getElementById('franja-edit-id').value;
    const dia = document.getElementById('franja-dia').value;
    const inicio = document.getElementById('franja-inicio').value;
    const fin = document.getElementById('franja-fin').value;
    const errorDiv = document.getElementById('franja-error');
    errorDiv.textContent = '';

    if (!dia || !inicio || !fin) {
        errorDiv.textContent = 'Completa todos los campos.';
        return;
    }
    if (inicio >= fin) {
        errorDiv.textContent = 'La hora de fin debe ser mayor que la de inicio.';
        return;
    }

    const esEdicion = !!id;
    const url = esEdicion ? `${API_BASE_URL}/api/franjas/${id}` : `${API_BASE_URL}/api/franjas`;
    const method = esEdicion ? 'PATCH' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: authHeaders(),
            body: JSON.stringify({ fecha: dia, hora_inicio: inicio, hora_fin: fin })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            errorDiv.textContent = data.error || 'Error al guardar la franja.';
            return;
        }
        await fetchFranjasYCitas();
        renderCalendar();
        renderFranjas();
        cerrarModal();
    } catch (err) {
        errorDiv.textContent = 'Error de conexión con el servidor.';
    }
}

// ── Listeners ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-franja-btn').addEventListener('click', () => abrirModal());
    document.getElementById('franja-cancel-btn').addEventListener('click', cerrarModal);
    document.getElementById('franja-save-btn').addEventListener('click', guardarFranja);

    // Cerrar modal al hacer click fuera del contenido
    document.getElementById('franja-modal').addEventListener('click', function(e) {
        if (e.target === this) cerrarModal();
    });
});

// ── Init ───────────────────────────────────────────────────────────────────

(async function() {
    await fetchFranjasYCitas();
    renderCalendar();
    renderFranjas();
})();
