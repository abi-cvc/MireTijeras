// admin-common.js — Compartido por todas las páginas del panel admin

// Protección de ruta: redirigir si no hay token
if (!sessionStorage.getItem('adminToken')) {
    window.location.href = 'admin-login.html';
}

const API_BASE_URL =
    window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://miretijeras.onrender.com';

function getAdminToken() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) { window.location.href = 'admin-login.html'; return null; }
    return token;
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAdminToken()}` };
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function safeImgSrc(url) {
    if (!url) return '';
    try {
        const u = new URL(url);
        if (u.protocol === 'http:' || u.protocol === 'https:') return url;
    } catch (_) {}
    return '';
}
