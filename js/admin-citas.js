// admin-citas.js: Lógica para la gestión de citas en el panel admin

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Detecta si está en localhost o en producción
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

function getAdminToken() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { window.location.href = 'admin-login.html'; return null; }
    return token;
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAdminToken()}` };
}

let franjas = [];
let citas = [];

// Obtener franjas y citas del backend
async function fetchFranjasYCitas() {
    try {
        const [franjasRes, citasRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/franjas`),
            fetch(`${API_BASE_URL}/api/citas`, { headers: authHeaders() })
        ]);
        franjas = await franjasRes.json();
        citas = await citasRes.json();
    } catch (err) {
        alert('Error al obtener datos del servidor');
        franjas = [];
        citas = [];
    }
}

function renderCalendar() {
    const cal = document.getElementById('calendar-admin');
    cal.innerHTML = '';
    // Construir eventos para FullCalendar
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
            rendering: 'background',
            extendedProps: { tipo: 'franja' }
        });
    });
    citas.forEach(c => {
        // Usar campos correctos: fecha y hora
        const fecha = c.fecha || c.dia;
        const hora = c.hora;
        // Ajustar a zona horaria -5 si es necesario (solo visual, no cambia datos en BD)
        let start = fecha + 'T' + hora;
        events.push({
            title: `Agendado: ${c.cliente} / ${c.servicio}`,
            start: start,
            color: '#e10a64',
            extendedProps: { tipo: 'cita' }
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
        events: events,
        eventDidMount: function(info) {
            if (info.event.extendedProps.tipo === 'franja') {
                info.el.style.opacity = '0.25';
            }
        },
        eventClick: function(info) {
            if (info.event.extendedProps.tipo === 'cita') {
                alert(info.event.title);
            }
        },
        dayHeaderFormat: { weekday: 'long' },
        dayPopoverFormat: { day: '2-digit', month: 'long', year: 'numeric' },
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
        titleFormat: { year: 'numeric', month: 'long' },
        slotLabelFormat: [
            { hour: '2-digit', minute: '2-digit', hour12: false }
        ],
        views: {
            dayGridMonth: { dayMaxEventRows: 4, titleFormat: { year: 'numeric', month: 'long' } },
            timeGridWeek: { titleFormat: { day: '2-digit', month: 'long', year: 'numeric' } },
            timeGridDay: { titleFormat: { day: '2-digit', month: 'long', year: 'numeric' } }
        }
    });
    calendar.render();
}

function renderFranjas() {
    const list = document.getElementById('franjas-list');
    list.innerHTML = '';
    franjas.forEach((f, idx) => {
        const franjaDiv = document.createElement('div');
        franjaDiv.className = 'franja-item';
        // Mostrar solo YYYY-MM-DD
        let fecha = f.fecha;
        if (fecha && fecha.includes('T')) fecha = fecha.split('T')[0];
        franjaDiv.innerHTML = `${fecha}: ${f.hora_inicio} - ${f.hora_fin}`;
        list.appendChild(franjaDiv);
    });
}

// ...el listener del botón ahora solo muestra el modal (ver más abajo)...

// Agregar cita desde el panel admin (prompt demo)
document.getElementById('add-cita-btn')?.addEventListener('click', async function() {
    const dia = prompt('Día (YYYY-MM-DD):');
    const hora = prompt('Hora (HH:MM):');
    const cliente = prompt('Nombre del cliente:');
    const servicio = prompt('Servicio:');
    if (dia && hora && cliente && servicio) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/citas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dia, hora, cliente, servicio })
            });
            if (!res.ok) throw new Error('Error al agregar cita');
            await fetchFranjasYCitas();
            renderCalendar();
            renderFranjas();
        } catch (err) {
            alert('Error al agregar cita');
        }
    }
});

renderCalendar();
renderFranjas();

(async function() {
    await fetchFranjasYCitas();
    renderCalendar();
    renderFranjas();
})();


// Esperar a que el DOM esté listo antes de agregar listeners del modal
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('franja-modal');
    const btnOpen = document.getElementById('add-franja-btn');
    const btnCancel = document.getElementById('franja-cancel-btn');
    const btnSave = document.getElementById('franja-save-btn');
    const inputDia = document.getElementById('franja-dia');
    const inputInicio = document.getElementById('franja-inicio');
    const inputFin = document.getElementById('franja-fin');

    if (btnOpen && modal) {
        btnOpen.addEventListener('click', function() {
            // Limpiar campos
            inputDia.value = '';
            inputInicio.value = '';
            inputFin.value = '';
            modal.style.display = 'flex';
        });
    }
    if (btnCancel && modal) {
        btnCancel.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    if (btnSave && modal) {
        btnSave.addEventListener('click', async function() {
            const dia = inputDia.value;
            const inicio = inputInicio.value;
            const fin = inputFin.value;
            if (dia && inicio && fin) {
                // Validación frontend: no solapar
                const solapa = franjas.some(f =>
                    f.fecha === dia && !(fin <= f.hora_inicio || inicio >= f.hora_fin)
                );
                if (solapa) {
                    alert('La franja se solapa con otra existente para ese día.');
                    return;
                }
                try {
                    const res = await fetch(`${API_BASE_URL}/api/franjas`, {
                        method: 'POST',
                        headers: authHeaders(),
                        body: JSON.stringify({ fecha: dia, hora_inicio: inicio, hora_fin: fin })
                    });
                    if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.error || 'Error al agregar franja');
                    }
                    await fetchFranjasYCitas();
                    renderCalendar();
                    renderFranjas();
                    modal.style.display = 'none';
                } catch (err) {
                    alert(err.message || 'Error al agregar franja');
                }
            }
        });
    }
});
