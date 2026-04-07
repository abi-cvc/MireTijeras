// logger.js — Logger estructurado simple. Reemplaza console.log/error directos.
// Formato: [ISO timestamp] LEVEL  mensaje  {contexto?}

const LEVELS = { info: 'INFO ', warn: 'WARN ', error: 'ERROR' };

function log(level, message, context) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] ${LEVELS[level]}  ${message}`;
  if (context !== undefined) {
    process.stdout.write(prefix + '  ' + JSON.stringify(context) + '\n');
  } else {
    process.stdout.write(prefix + '\n');
  }
}

module.exports = {
  info:  (msg, ctx) => log('info',  msg, ctx),
  warn:  (msg, ctx) => log('warn',  msg, ctx),
  error: (msg, ctx) => log('error', msg, ctx),
};
