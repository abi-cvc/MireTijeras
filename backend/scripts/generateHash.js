// Uso: node scripts/generateHash.js <password>
// Genera el hash bcrypt para poner en la variable ADMIN_PASSWORD_HASH del .env
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
    console.log('Uso: node scripts/generateHash.js <password>');
    process.exit(1);
}

bcrypt.hash(password, 12).then(hash => {
    console.log('\nCopia esta línea en tu .env de Render:\n');
    console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
});
