import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/upload-pdf", async (req, res) => {
    try {
      // Su lógica de envío al backend Python.
      const response = await axios.post("http://127.0.0.1:5001/process-pdf", req.files);
      res.json(response.data);
    } catch (error) {
      // Verifica si el error es un AxiosError
      if (axios.isAxiosError(error)) {
        console.error("Error al comunicarse con Python:", error.message);
        res.status(500).json({ error: error.message });
      } else if (error instanceof Error) {
        // Si el error es de tipo Error estándar.
        console.error("Error desconocido:", error.message);
        res.status(500).json({ error: "Error desconocido al procesar el PDF." });
      } else {
        // Para otros tipos desconocidos.
        console.error("Error desconocido sin información adicional:", error);
        res.status(500).json({ error: "Error desconocido al procesar el PDF." });
      }
    }
  });
  

export default router;
