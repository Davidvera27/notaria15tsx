import nodemailer from "nodemailer";

// Configuración del transportador SMTP
export const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: "drestrepo@correo.iue.edu.co",
        pass: "vera.96082719544",
    },
});


// Verificar conexión con el servidor SMTP
transporter.verify((error) => {
  if (error) {
    console.error("Error al conectar con el servidor SMTP:", error);
  } else {
    console.log("Servidor SMTP listo para enviar correos.");
  }
});
