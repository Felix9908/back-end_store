import { db } from "../app.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

//send code
export const sendCode = (req, res) => {
  const { emailUser } = req.body;
  const sql = "select * from users where email = ?";
  db.query(sql, [emailUser], (err, response) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(response);
    }
  });
};

//change password
export const resetPassword = (req, res) => {
  const { id, password } = req.body;
  const sql = "UPDATE users SET password = ?  WHERE id = ?";
  db.query(sql, [password, id], (err, response) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("contraseña cambiada exitosamente");
    }
  });
};

//send email
export const sendEmail = (req, res) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return res.status(400).send("Correo electrónico no válido");
  }
  const query = "SELECT * FROM users where email = ?";
  db.query(query, [email], (err, response) => {
    if (err) {
      res.status(500).send("Error en la base de datos");
    } else if (response.length === 0) {
      res.status(404).send("El usuario no existe");
    } else {
      const id = response[0].id;
      const verificationCode = generateVerificationCode();
      sendVerificationCode(email, verificationCode);
      const query2 = "UPDATE users SET code = ?  WHERE id = ?";
      db.query(query2, [verificationCode, id], (err2, response2) => {
        if (err2) {
          res.status(500).send("Error al actualizar el código de verificación");
        } else {
          res.status(200).send("Código de verificación enviado correctamente.");
        }
      });
    }
  });
};

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
function sendVerificationCode(email, code) {
    const mailOptions = {
      from: "tu_correo@gmail.com",
      to: email,
      subject: "Código de Verificación para Restablecer Contraseña",
      text: `Tu código de verificación es: ${code}`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo electrónico:", error);
      } else {
        console.log("Correo electrónico enviado:", info.response);
      }
    });
  }

  function generateVerificationCode() {
    return crypto.randomBytes(3).toString("hex").toUpperCase();
  }
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "maguastore3@gmail.com",
      pass: "hmua mzxd lymn lmro",
    },
  });
  
