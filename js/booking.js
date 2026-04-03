// booking.js: Lógica para el calendario de agendar cita


// Detecta si está en localhost o en producción
const API_BASE_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:3001"
        : "https://miretijeras.onrender.com";

const calendarContainer = document.getElementById('booking-calendar');
const weekLabel = document.getElementById('calendar-week-label');
const prevWeekBtn = document.getElementById('prev-week');
const nextWeekBtn = document.getElementById('next-week');
const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');

let franjas = [];
let citas = [];

async function fetchFranjasYCitas() {
    try {
        const [franjasRes, citasRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/franjas`),
            fetch(`${API_BASE_URL}/api/citas`)
        ]);
        franjas = await franjasRes.json();
        citas = await citasRes.json();
    } catch (err) {
        franjas = [];
        citas = [];
    }
}

// Configuración de días y horas
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HOURS = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00'
];

// Fecha de referencia (hoy)
const TODAY = new Date();
TODAY.setHours(0,0,0,0);

// Estado de la semana mostrada (0 = semana actual, 1 = siguiente, etc.)
let weekOffset = 0;

// Calcula el lunes de la semana correspondiente
function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    return new Date(d.setDate(diff));
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function isPast(date) {
    return date < TODAY;
}

function renderCalendar() {
    // Calcula el lunes de la semana a mostrar
    const baseMonday = getMondayOfWeek(TODAY);
    const monday = addDays(baseMonday, weekOffset * 7);
    const sunday = addDays(monday, 6);

    // Limita a 2 semanas desde hoy
    const maxSunday = addDays(getMondayOfWeek(TODAY), 13);
    nextWeekBtn.disabled = sunday >= maxSunday;
    prevWeekBtn.disabled = weekOffset === 0;

    // Etiqueta de la semana
    weekLabel.textContent = `${monday.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })} - ${addDays(monday, 4).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    // Renderiza los días
    calendarContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const dayDate = addDays(monday, i);
        const dayDiv = document.createElement('div');
        dayDiv.className = 'booking-day';
        if (isPast(dayDate)) dayDiv.classList.add('past');
        dayDiv.dataset.date = formatDate(dayDate);

        // Etiqueta del día
        const label = document.createElement('div');
        label.className = 'day-label';
        label.textContent = `${DAYS[i]}\n${dayDate.getDate()}/${dayDate.getMonth()+1}`;
        dayDiv.appendChild(label);

        // Mostrar solo horas disponibles según franjas y citas
        if (isPast(dayDate)) {
            const noDisp = document.createElement('div');
            noDisp.className = 'no-available';
            noDisp.textContent = 'No disponible';
            dayDiv.appendChild(noDisp);
        } else {
            // Buscar franjas para este día
            const diaStr = formatDate(dayDate);
            const franjasDia = franjas.filter(f => f.dia === diaStr);
            let hasAvailable = false;
            HOURS.forEach(hour => {
                // ¿Está dentro de alguna franja?
                const disponible = franjasDia.some(f => hour >= f.inicio && hour < f.fin);
                // ¿Ya hay cita en esa hora?
                const ocupada = citas.some(c => c.dia === diaStr && c.hora === hour);
                if (disponible && !ocupada) {
                    const slot = document.createElement('div');
                    slot.className = 'hour-slot';
                    slot.textContent = hour;
                    slot.tabIndex = 0;
                    slot.addEventListener('click', () => selectSlot(dayDate, hour, slot));
                    dayDiv.appendChild(slot);
                    hasAvailable = true;
                }
            });
            if (!hasAvailable) {
                const noDisp = document.createElement('div');
                noDisp.className = 'no-available';
                noDisp.textContent = 'No hay horarios disponibles';
                dayDiv.appendChild(noDisp);
            }
        }
        calendarContainer.appendChild(dayDiv);
    }
}

let selectedDate = '';
let selectedHour = '';
function selectSlot(date, hour, slotElem) {
    // Deselecciona anteriores
    document.querySelectorAll('.hour-slot.selected').forEach(e => e.classList.remove('selected'));
    slotElem.classList.add('selected');
    selectedDate = formatDate(date);
    selectedHour = hour;
    // Rellena el formulario
    document.getElementById('date').value = selectedDate;
    document.getElementById('time').value = selectedHour;
}

prevWeekBtn.addEventListener('click', () => {
    if (weekOffset > 0) {
        weekOffset--;
        renderCalendar();
    }
});
nextWeekBtn.addEventListener('click', () => {
    // Solo permite avanzar hasta 2 semanas
    if (weekOffset < 2) {
        weekOffset++;
        renderCalendar();
    }
});

bookingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!selectedDate || !selectedHour) {
        bookingMessage.textContent = 'Por favor selecciona una fecha y hora.';
        bookingMessage.style.color = '#a94442';
        return;
    }
    // Enviar reserva al backend
    const nombre = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('phone').value;
    const servicio = document.getElementById('service').value;
    try {
        const res = await fetch(`${API_BASE_URL}/api/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                dia: selectedDate,
                hora: selectedHour,
                cliente: nombre,
                email,
                telefono,
                servicio
            })
        });
        if (!res.ok) throw new Error('Error al reservar');
        bookingMessage.textContent = '¡Reserva enviada!';
        bookingMessage.style.color = 'green';
        await fetchFranjasYCitas();
        renderCalendar();
    } catch (err) {
        bookingMessage.textContent = 'Error al reservar';
        bookingMessage.style.color = '#a94442';
    }
    bookingForm.reset();
    document.getElementById('date').value = '';
    document.getElementById('time').value = '';
    document.querySelectorAll('.hour-slot.selected').forEach(e => e.classList.remove('selected'));
});


(async function() {
    await fetchFranjasYCitas();
    renderCalendar();
})();
