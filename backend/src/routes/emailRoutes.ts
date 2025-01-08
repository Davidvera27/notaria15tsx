import express from "express";
import { transporter } from "../utils/emailConfig";

const router = express.Router();

router.post("/send-email", async (req, res) => {
    const { to, subject, text } = req.body;
  
    if (!to || !to.includes("@")) {
      return res.status(400).send({ error: "El destinatario es obligatorio y debe ser un correo válido." });
    }
  
    try {
      await transporter.sendMail({
        from: "drestrepo@correo.iue.edu.co",
        to,
        subject: subject || "Notificación de Caso",
        text: text || "Mensaje sin contenido.",
      });
      res.status(200).send({ message: "Correo enviado correctamente" });
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      res.status(500).send({ error: "Error al enviar el correo." });
    }
  });
  

export default router;
