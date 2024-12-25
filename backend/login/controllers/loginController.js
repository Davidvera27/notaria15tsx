const { getDB } = require("../../utils/dbConnection");
const { createUser: createUserModel } = require("../models/loginModel");

// Crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res
                .status(400)
                .json({ error: "Todos los campos obligatorios deben estar llenos." });
        }

        const result = await createUserModel({
            firstName,
            middleName,
            lastName,
            email,
            password,
        });

        res.status(201).json({ message: "Usuario creado exitosamente", userId: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener todos los usuarios (opcional para pruebas)
const getUsers = (req, res) => {
    const query = "SELECT * FROM Users";

    const db = getDB();
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
};

module.exports = { createUser, getUsers };
