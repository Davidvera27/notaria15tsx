import express from "express";
import  db  from "../database/db";

const router = express.Router();

// Obtener todos los casos terminados
router.get("/", async (req, res) => {
  try {
    const cases = await db.all("SELECT * FROM case_rents_finished");
    res.json(cases);
  } catch (error) {
    console.error("Error al obtener casos terminados:", error);
    res.status(500).json({ error: "Error al obtener casos terminados" });
  }
});

// Agregar un caso terminado (usado durante el traslado)
router.post("/", async (req, res) => {
  const { id, creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified } = req.body;

  try {
    await db.run(
      `INSERT INTO case_rents_finished (id, creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, creation_date, document_date, escritura, radicado, protocolista, observaciones, last_modified]
    );

    res.status(200).json({ message: "Caso trasladado exitosamente a terminados" });
  } catch (error) {
    console.error("Error al agregar caso terminado:", error);
    res.status(500).json({ error: "Error al trasladar el caso" });
  }
});

export default router;
