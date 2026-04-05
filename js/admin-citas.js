// admin-citas.js: Lógica para la gestión de citas en el panel admin

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Simulación de franjas y citas
let franjas = [];
let citas = [];

// Detecta si está en localhost o en producción
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

// Obtener franjas y citas del backend
async function fetchFranjasYCitas() {
    try {
        const [franjasRes, citasRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/franjas`),
            fetch(`${API_BASE_URL}/api/citas`)
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
        events.push({
            title: 'Disponible',
            start: f.dia + 'T' + f.inicio,
            end: f.dia + 'T' + f.fin,
            color: '#1a9c5e',
            display: 'background',
            extendedProps: { tipo: 'franja' }
        });
    });
    citas.forEach(c => {
        events.push({
            title: `Agendado: ${c.cliente} / ${c.servicio}`,
            start: c.dia + 'T' + c.hora,
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
        franjaDiv.innerHTML = `${f.dia}: ${f.inicio} - ${f.fin}`;
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
                try {
                    const res = await fetch(`${API_BASE_URL}/api/franjas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fecha: dia, hora_inicio: inicio, hora_fin: fin })
                    });
                    if (!res.ok) throw new Error('Error al agregar franja');
                    await fetchFranjasYCitas();
                    renderCalendar();
                    renderFranjas();
                    modal.style.display = 'none';
                } catch (err) {
                    alert('Error al agregar franja');
                }
            } else {
                alert('Completa todos los campos');
            }
        });
    }
});
