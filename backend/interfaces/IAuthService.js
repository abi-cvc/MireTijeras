// Interfaz para el servicio de autenticación de administrador
/**
 * @interface IAuthService
 * Métodos para autenticación de administrador
 */
class IAuthService {
    /**
     * Autentica un usuario administrador
     * @param {string} email
     * @param {string} password
     * @returns {Promise<boolean>} true si es válido, false si no
     */
    async login(email, password) {
        throw new Error('Método no implementado');
    }
}

module.exports = IAuthService;