import express from "express";
import {
  getAllCases,
  createCase,
  updateCase,
  deleteCase,
} from "../controllers/caseRentsFormController.js";

const router = express.Router();

// Rutas para la tabla CaseRentsForm
router.get("/", getAllCases); // Obtener todos los casos
router.post("/", createCase); // Crear un nuevo caso
router.put("/:id", updateCase); // Actualizar un caso existente
router.delete("/:id", deleteCase); // Eliminar un caso

export default router;
