const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_FROM, // tu correo Gmail
    pass: process.env.EMAIL_PASS, // tu contraseña o app password
  },
});

async function enviarEmailRecuperacion(destinatario, token) {
  const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;


  const mailOptions = {
    from: `CineStash <${process.env.EMAIL_FROM}>`,
    to: destinatario,
    subject: "Recupera tu contraseña",
    html: `
      <h2>Recuperar contraseña</h2>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace caduca en 15 minutos.</p>
      <a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#1f8df5;color:white;border-radius:5px;text-decoration:none">Restablecer contraseña</a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${link}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  enviarEmailRecuperacion,
};
