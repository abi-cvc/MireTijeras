// admin-citas.js: Lógica para la gestión de citas en el panel admin

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Simulación de franjas y citas
let franjas = [
    { dia: '2026-04-03', inicio: '09:00', fin: '13:00' },
    { dia: '2026-04-03', inicio: '15:00', fin: '18:00' },
    { dia: '2026-04-04', inicio: '10:00', fin: '14:00' }
];
let citas = [
    { dia: '2026-04-03', hora: '09:30', cliente: 'María López', servicio: 'Corte de cabello' },
    { dia: '2026-04-04', hora: '11:00', cliente: 'Juan García', servicio: 'Tinte' }
];

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

document.getElementById('add-franja-btn').addEventListener('click', function() {
    // Simple prompt para demo
    const dia = prompt('Día (YYYY-MM-DD):');
    const inicio = prompt('Hora inicio (HH:MM):');
    const fin = prompt('Hora fin (HH:MM):');
    if (dia && inicio && fin) {
        franjas.push({ dia, inicio, fin });
        renderCalendar();
        renderFranjas();
    }
});

renderCalendar();
renderFranjas();
