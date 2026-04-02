// Botón flotante de WhatsApp para todas las páginas
(function() {
    const phone = '0987042660';
    const message = encodeURIComponent('¡Hola! Quiero agendar una cita o consultar un servicio.');
    const link = `https://wa.me/593${phone.slice(1)}?text=${message}`;
    const btn = document.createElement('a');
    btn.href = link;
    btn.target = '_blank';
    btn.className = 'whatsapp-float';
    btn.title = 'Contáctanos por WhatsApp';
    btn.innerHTML = `
        <svg viewBox="0 0 32 32" width="38" height="38" fill="#fff" style="vertical-align:middle;">
            <circle cx="16" cy="16" r="16" fill="#25D366"/>
            <path d="M24.5 19.7c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.4-.7 1.2-.9 1.4-.2.2-.3.3-.7.1-.4-.2-1.5-.6-2.8-1.8-1-1-1.7-2.2-1.9-2.6-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.2-.4.3-.6.1-.2 0-.5-.1-.7-.1-.2-.7-1.7-1-2.3-.3-.6-.6-.5-.8-.5-.2 0-.5 0-.7 0-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.5c.2.2 2.3 3.6 5.6 5.1.8.3 1.4.5 1.9.6.8.1 1.5.1 2 .1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.1-.4-.2-.8-.4z"/>
        </svg>
    `;
    document.body.appendChild(btn);
})();
