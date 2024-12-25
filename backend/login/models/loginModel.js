const { getDB } = require("../../utils/dbConnection");

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {Object} user - Datos del usuario a registrar.
 * @param {string} user.firstName - Primer nombre del usuario.
 * @param {string} [user.middleName] - Segundo nombre del usuario (opcional).
 * @param {string} user.lastName - Apellidos del usuario.
 * @param {string} user.email - Correo electrónico del usuario.
 * @param {string} user.password - Contraseña del usuario.
 * @returns {Promise<Object>} - Promesa con el resultado de la inserción.
 */
const createUser = (user) => {
  return new Promise((resolve, reject) => {
    const db = getDB();

    const { firstName, middleName = "", lastName, email, password } = user;

    const query = `
      INSERT INTO Users (Nombres, Apellidos, CorreoElectronico, Contrasena, FechaCreacion)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;

    db.run(
      query,
      [`${firstName} ${middleName}`.trim(), lastName, email, password],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, message: "Usuario creado exitosamente" });
      }
    );
  });
};

module.exports = {
  createUser,
};
