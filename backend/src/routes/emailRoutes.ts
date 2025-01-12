import express from "express";
import { transporter } from "../utils/emailConfig";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  // Validar que el destinatario y el formato del correo sean válidos
  if (!to || !to.includes("@")) {
    return res.status(400).send({
      error: "El destinatario es obligatorio y debe ser un correo válido.",
    });
  }

  try {
    // Enviar el correo
    await transporter.sendMail({
      from: "drestrepo@correo.iue.edu.co", // Remitente
      to, // Destinatario
      subject: subject || "Notificación de Caso", // Asunto con predeterminado
      text: text || "Mensaje sin contenido.", // Cuerpo del correo con predeterminado
    });

    res.status(200).send({ message: "Correo enviado correctamente" });
  } catch (error: unknown) {
    // Manejar el error asegurando que `error` sea del tipo correcto
    if (error instanceof Error) {
      console.error("Error al enviar el correo:", error.message);
      res.status(500).send({
        error: error.message || "Error al enviar el correo. Intente más tarde.",
      });
    } else {
      console.error("Error desconocido al enviar el correo:", error);
      res.status(500).send({ error: "Error desconocido al enviar el correo." });
    }
  }
});


export default router;
