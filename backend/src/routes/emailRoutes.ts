import { Router } from "express";
import { transporter } from "../utils/emailConfig";

const router = Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const mailOptions = {
    from: "drestrepo@correo.iue.edu.co",
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

export default router;
