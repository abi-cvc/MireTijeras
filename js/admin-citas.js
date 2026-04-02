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
    // Mostrar calendario completo (mes actual)
    // Aquí puedes integrar un calendario real, por ahora solo lista de días/franjas/citas
    let dias = {};
    franjas.forEach(f => {
        if (!dias[f.dia]) dias[f.dia] = { franjas: [], citas: [] };
        dias[f.dia].franjas.push(f);
    });
    citas.forEach(c => {
        if (!dias[c.dia]) dias[c.dia] = { franjas: [], citas: [] };
        dias[c.dia].citas.push(c);
    });
    Object.keys(dias).sort().forEach(dia => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerHTML = `<strong>${dia}</strong>`;
        dias[dia].franjas.forEach(f => {
            const franjaDiv = document.createElement('div');
            franjaDiv.className = 'calendar-franja';
            franjaDiv.innerHTML = `Disponible: ${f.inicio} - ${f.fin}`;
            dayDiv.appendChild(franjaDiv);
        });
        dias[dia].citas.forEach(c => {
            const citaDiv = document.createElement('div');
            citaDiv.className = 'calendar-cita';
            citaDiv.innerHTML = `Agendado: ${c.cliente} / ${c.servicio} (${c.hora})`;
            dayDiv.appendChild(citaDiv);
        });
        cal.appendChild(dayDiv);
    });
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
