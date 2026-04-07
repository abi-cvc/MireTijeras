// emailService.js — Envío de notificaciones por email con nodemailer
const nodemailer = require('nodemailer');
const logger = require('../logger');

// El transporter se crea una sola vez. Si no hay config de SMTP, se desactiva silenciosamente.
let transporter = null;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: parseInt(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Envía email de confirmación al cliente y notificación al admin.
 * Si no hay config SMTP, no hace nada (no rompe el flujo).
 */
async function notificarCita({ cliente, email, telefono, fecha, hora, servicio }) {
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
  const from = process.env.EMAIL_FROM || `"MireTijeras" <${process.env.EMAIL_USER}>`;

  const promises = [];

  // Notificación al admin
  promises.push(
    transporter.sendMail({
      from,
      to: adminEmail,
      subject: `Nueva cita agendada — ${fecha} ${hora}`,
      text: [
        `Se agendó una nueva cita:`,
        ``,
        `Cliente:   ${cliente}`,
        `Email:     ${email || '—'}`,
        `Teléfono:  ${telefono || '—'}`,
        `Fecha:     ${fecha}`,
        `Hora:      ${hora}`,
        `Servicio:  ${servicio}`,
      ].join('\n'),
    })
  );

  // Confirmación al cliente (solo si proveyó email)
  if (email) {
    promises.push(
      transporter.sendMail({
        from,
        to: email,
        subject: `Confirmación de tu cita en MireTijeras`,
        text: [
          `Hola ${cliente},`,
          ``,
          `Tu cita ha sido confirmada:`,
          ``,
          `Fecha:    ${fecha}`,
          `Hora:     ${hora}`,
          `Servicio: ${servicio}`,
          ``,
          `Si necesitas cancelar o reprogramar, contáctanos.`,
          ``,
          `¡Hasta pronto!`,
          `MireTijeras`,
        ].join('\n'),
      })
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    logger.error('Error enviando email de cita', { message: err.message });
  }
}

/**
 * Notifica al admin cuando llega una nueva solicitud de convenio.
 */
async function notificarConvenio({ nombre, email, telefono, empresa, mensaje }) {
  if (!transporter) return;

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_USER;
  const from = process.env.EMAIL_FROM || `"MireTijeras" <${process.env.EMAIL_USER}>`;

  try {
    await transporter.sendMail({
      from,
      to: adminEmail,
      subject: `Nueva solicitud de convenio — ${empresa}`,
      text: [
        `Nueva solicitud de convenio recibida:`,
        ``,
        `Empresa:   ${empresa}`,
        `Contacto:  ${nombre}`,
        `Email:     ${email}`,
        `Teléfono:  ${telefono || '—'}`,
        `Mensaje:   ${mensaje || '—'}`,
      ].join('\n'),
    });
  } catch (err) {
    logger.error('Error enviando email de convenio', { message: err.message });
  }
}

module.exports = { notificarCita, notificarConvenio };
