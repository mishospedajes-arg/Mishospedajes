const bcrypt = require('bcryptjs');

const password = 'admin123'; // Cambia esto por una contraseña segura
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed password:', hash);
});
