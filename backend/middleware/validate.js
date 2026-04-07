const { validationResult } = require('express-validator');

/**
 * Middleware que intercepta errores de express-validator y responde 400
 * si hay campos inválidos. Se coloca después de los chains de validación.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(e => ({ campo: e.path, mensaje: e.msg })) });
  }
  next();
}

module.exports = validate;
