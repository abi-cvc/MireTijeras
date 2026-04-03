# Configuración segura de PostgreSQL (Neon) para MireTijeras

1. **Nunca subas tu archivo `.env` real al repositorio.**
   - Usa `.env.example` como plantilla.
   - Agrega `.env` a tu `.gitignore`.

2. **Variables necesarias en `.env`:**
   - PGHOST
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
   - PGPORT

3. **Conexión:**
   - El backend usa `db.js` para conectarse a PostgreSQL usando el paquete `pg` y variables de entorno.
   - El pool de conexiones está configurado para Neon (requiere SSL).

4. **¿Cómo usar?**
   - Copia `.env.example` a `.env` y pon tus credenciales reales.
   - No subas `.env` a GitHub.

5. **Seguridad:**
   - Nunca escribas credenciales en el código fuente ni en archivos públicos.
   - Usa siempre variables de entorno para datos sensibles.
