const express = require("express");
const { createUser, getUsers } = require("../controllers/loginController");
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/register", createUser);

// Ruta opcional para obtener todos los usuarios
router.get("/users", getUsers);

module.exports = router;
