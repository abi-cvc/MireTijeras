// Implementación concreta de IAuthService
const IAuthService = require('../interfaces/IAuthService');
const credentials = require('../config/adminCredentials.json');

class AuthService extends IAuthService {
    async login(email, password) {
        return email === credentials.email && password === credentials.password;
    }
}

module.exports = AuthService;