// admin-convenios.js: Lógica para la gestión de convenios en el panel admin

document.getElementById('back-dashboard').addEventListener('click', function() {
    window.location.href = 'admin-panel.html';
});

// Aquí se cargará la lógica para mostrar y gestionar solicitudes de convenio
// Ejemplo de renderizado inicial (puedes conectar con backend después):

document.addEventListener('DOMContentLoaded', function() {
    const conveniosList = document.getElementById('convenios-list');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroAprobado = document.getElementById('filtro-aprobado');
    // Simulación de datos
    const convenios = [
        {
            org: 'Empresa Ejemplo S.A.',
            contacto: 'Ana Pérez',
            email: 'ana@ejemplo.com',
            telefono: '555-1234',
            mensaje: 'Nos interesa un convenio para 50 empleados.',
            estado: 'por revisar',
            aprobado: 'pendiente'
        },
        {
            org: 'Colegio ABC',
            contacto: 'Luis Gómez',
            email: 'luis@abc.edu',
            telefono: '555-5678',
            mensaje: 'Solicitamos información sobre beneficios para docentes.',
            estado: 'finalizado',
            aprobado: 'aprobado'
        },
        {
            org: 'ONG Salud+',
            contacto: 'Marta Ruiz',
            email: 'marta@saludmas.org',
            telefono: '555-9999',
            mensaje: 'Interesa convenio para voluntarios.',
            estado: 'finalizado',
            aprobado: 'pendiente'
        }
    ];
    const estados = ['por revisar', 'revisando', 'finalizado'];
    const aprobaciones = ['pendiente', 'aprobado', 'rechazado'];

    function renderConvenios() {
        conveniosList.innerHTML = '';
        const estadoFiltro = filtroEstado ? filtroEstado.value : 'todos';
        const aprobadoFiltro = filtroAprobado ? filtroAprobado.value : 'todos';
        convenios.forEach((c, idx) => {
            if (estadoFiltro !== 'todos' && c.estado !== estadoFiltro) return;
            if (aprobadoFiltro !== 'todos' && c.aprobado !== aprobadoFiltro) return;
            const card = document.createElement('div');
            card.className = 'convenio-card';
            card.innerHTML = `
                <strong>${c.org}</strong> <br>
                Contacto: ${c.contacto} <br>
                Email: ${c.email} <br>
                Tel: ${c.telefono} <br>
                Mensaje: <em>${c.mensaje}</em>
                <div class="convenio-status">
                    <label for="estado-${idx}">Estado:</label>
                    <select id="estado-${idx}" data-idx="${idx}">
                        ${estados.map(e => `<option value="${e}"${e === c.estado ? ' selected' : ''}>${e.charAt(0).toUpperCase() + e.slice(1)}</option>`).join('')}
                    </select>
                    ${c.estado === 'finalizado' ? `
                        <label for="aprobado-${idx}" style="margin-left:12px;">Aprobación:</label>
                        <select id="aprobado-${idx}" data-idx="${idx}">
                            ${aprobaciones.map(a => `<option value="${a}"${a === c.aprobado ? ' selected' : ''}>${a.charAt(0).toUpperCase() + a.slice(1)}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>
            `;
            conveniosList.appendChild(card);
        });
        // Listeners y badge visual para selects de estado
        document.querySelectorAll('.convenio-status select[id^="estado-"]').forEach(sel => {
            const idx = sel.getAttribute('data-idx');
            sel.setAttribute('data-current', convenios[idx].estado);
            sel.addEventListener('change', function() {
                const idx = this.getAttribute('data-idx');
                convenios[idx].estado = this.value;
                if (this.value !== 'finalizado') convenios[idx].aprobado = 'pendiente';
                renderConvenios();
            });
        });
        // Listeners y badge visual para selects de aprobado
        document.querySelectorAll('.convenio-status select[id^="aprobado-"]').forEach(sel => {
            const idx = sel.getAttribute('data-idx');
            sel.setAttribute('data-current', convenios[idx].aprobado);
            sel.addEventListener('change', function() {
                const idx = this.getAttribute('data-idx');
                convenios[idx].aprobado = this.value;
                renderConvenios();
            });
        });
    }

    if (filtroEstado) filtroEstado.addEventListener('change', renderConvenios);
    if (filtroAprobado) filtroAprobado.addEventListener('change', renderConvenios);
    renderConvenios();
});
