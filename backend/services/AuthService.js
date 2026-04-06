// Implementación concreta de IAuthService
const IAuthService = require('../interfaces/IAuthService');
const bcrypt = require('bcryptjs');

class AuthService extends IAuthService {
    async login(email, password) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminEmail || !adminHash) return false;
        if (email !== adminEmail) return false;
        return bcrypt.compare(password, adminHash);
    }
}

module.exports = AuthService;