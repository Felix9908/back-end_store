const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const fs = require("fs");

const server = express();
server.use(cors());
const port = 9999;

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

server.use("/uploads", express.static("uploads"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
const keys = require("./settings/keys");
const secret_key = keys.key;

const db = mysql2.createConnection({
  host: "db4free.net",
  user: "xtremedb",
  password: "Felixrfy1234*",
  database: "storedb001",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  jwt.verify(token, "secret_key", (err, user) => {
    if (err) return res.sendStatus(404);
    req.user = user;
    next();
  });
};

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

server.post("/sendEmail", (req, res) => {
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
});

//send code
server.post("/getCode", (req, res) => {
  const { emailUser } = req.body;
  const sql = "select * from users where email = ?";
  db.query(sql, [emailUser], (err, response) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

//change password
server.post("/resetPassword", (req, res) => {
  const { id, password } = req.body;
  const sql = "UPDATE users SET password = ?  WHERE id = ?";
  db.query(sql, [password, id], (err, response) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("contraseña cambiada exitosamente");
    }
  });
});

// Create product
server.post("/create", upload.single("image"), function (req, res, next) {
  const imageFile = req.file;
  const { productName, type, description, price, available } = req.body;

  if (
    !imageFile ||
    !productName ||
    !type ||
    !description ||
    !price ||
    !available
  ) {
    res.status(400).send("No se recibieron todos los datos");
    return;
  }
  const { filename, path } = imageFile;

  const sql =
    "INSERT INTO products (productName, type, nameImg, imagePath, description, price, available) VALUES (?, ?, ?, ?, ?, ?, ?)";

  const values = [
    productName,
    type,
    filename,
    path,
    description,
    price,
    available,
  ];

  db.query(sql, values, function (err, result) {
    if (err) {
      console.error("Error inserting data into SQL table:", err);
      res.status(500).send("Error inserting data into SQL table");
    } else {
      res.status(200).send("Product uploaded successfully");
    }
  });
});

// Delete Product
server.delete("/deleteProducts/:id", verifyToken, function (req, res) {
  const productId = req.params.id;

  const selectSql = "SELECT nameImg FROM products WHERE id = ?";
  const deleteSql = "DELETE FROM products WHERE id = ?";
  const deleteCommentsSql = "DELETE FROM comments WHERE product_id = ?";

  db.query(selectSql, [productId], function (err, result) {
    if (err) {
      console.error("Error querying data from SQL table:", err);
      res.status(500).send("Error querying data from SQL table");
      return;
    }

    if (result.length === 0) {
      res.status(404).send("Product not found");
      return;
    }

    const imageName = result[0].nameImg;

    db.query(deleteCommentsSql, [productId], (err2, response) => {
      if (err2) {
        res.status(500).send(err2);
      }
    });

    db.query(deleteSql, [productId], function (err, result) {
      if (err) {
        console.error("Error deleting data from SQL table:", err);
        res.status(500).send("Error deleting data from SQL table");
        return;
      }

      // Borra la foto físicamente
      fs.unlink(`uploads/${imageName}`, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
          res.status(500).send("Error deleting image file");
          return;
        }

        res.status(200).send("Product and image deleted successfully");
      });
    });
  });
});

server.get("/data", function (req, res, next) {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data from SQL table:", err);
      res.status(500).send("Error fetching data from SQL table");
    } else {
      res.status(200).json(result);
    }
  });
});

server.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query(
    "SELECT * FROM users WHERE email = ? and password = ?",
    [email, password],
    (err, data) => {
      if (err) {
        res.status(400).send(err);
      } else {
        if (data.length > 0) {
          const payload = {
            check: true,
            data: data,
          };
          jwt.sign(payload, "secret_key", (err, token) => {
            if (err) {
              res.status(400).send(err);
            } else {
              res.send({
                msg: "AUTEMTICACION EXITOSA",
                token: token,
                userData: data,
              });
            }
          });
        } else {
          res.send({ msg: "No se encontraron datos de usuario" });
        }
      }
    }
  );
});

server.post("/createUser", (req, res) => {
  const { username, password, fullName, email, privUser } = req.body;

  // Verificar si el correo ya existe en la base de datos
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error("Error checking email in users table:", err);
      res.status(500).send("Error checking email in users table");
    } else if (result.length > 0) {
      // Si el correo ya existe, devolver un mensaje al cliente
      res
        .status(400)
        .send("El correo ya está registrado en nuestra base de datos");
    } else {
      // Si el correo no existe, insertar el nuevo usuario en la tabla users
      const insertUserQuery =
        "INSERT INTO users (userName, password, fullName, email, privUser) VALUES (?, ?, ?, ?, ?)";
      const values = [username, password, fullName, email, privUser];

      db.query(insertUserQuery, values, (err, result) => {
        if (err) {
          console.error("Error inserting data into users table:", err);
          res.status(500).send("Error inserting data into users table");
        } else {
          res.status(200).send("Usuario creado exitosamente");
        }
      });
    }
  });
});

server.put("/logout", verifyToken, function (req, res) {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, "secret_key", { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.send({ msg: "Has sido desconectado" });
    } else {
      res.send({ msg: "Error" });
    }
  });
});

server.get("/users", verifyToken, (req, res) => {
  db.query("select * from users", (err, data) => {
    if (err) {
      res.status(400).send("Not found");
    } else {
      res.status(200).send(data);
    }
  });
});

server.delete("/deleteUser/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  db.query(`DELETE FROM users WHERE id = ${id}`, (err, resp) => {
    if (err) {
      res.status(400).send(`Error: ${err}`);
    } else {
      res.status(200).send("User deleted");
    }
  });
});

// Crear un comentario
server.post("/comments/create", verifyToken, (req, res) => {
  const { productId, text, clientName, formattedFecha } = req.body;

  if (!productId || !text || !clientName || !formattedFecha) {
    res.status(400).send("No se recibieron todos los datos requeridos");
    return;
  }

  const sql =
    "INSERT INTO comments (product_id, text, clientName, fecha) VALUES (?, ?, ?, ?)";

  const values = [productId, text, clientName, formattedFecha];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into comments table:", err);
      res.status(500).send("Error inserting data into comments table");
    } else {
      res.status(200).send("Comentario creado exitosamente");
    }
  });
});

// Borrar un comentario
server.delete("/comments/delete/:id", verifyToken, (req, res) => {
  const commentId = req.params.id;

  const sql = "DELETE FROM comments WHERE id = ?";

  db.query(sql, [commentId], (err, result) => {
    if (err) {
      console.error("Error deleting data from comments table:", err);
      res.status(500).send("Error deleting data from comments table");
    } else {
      res.status(200).send("Comentario eliminado exitosamente");
    }
  });
});

// Editar un comentario
server.put("/comments/edit/:id", verifyToken, (req, res) => {
  const commentId = req.params.id;
  const { text } = req.body;

  if (!text) {
    res.status(400).send("No se recibieron todos los datos requeridos");
    return;
  }

  const sql = "UPDATE comments SET text = ? WHERE id = ?";

  db.query(sql, [text, commentId], (err, result) => {
    if (err) {
      console.error("Error updating data in comments table:", err);
      res.status(500).send("Error updating data in comments table");
    } else {
      res.status(200).send("Comentario editado exitosamente");
    }
  });
});

// Obtener todos los comentarios y enviarlos al frontend
server.get("/comments/:productId", (req, res) => {
  const productId = req.params.productId;
  const sql = "select * from comments where product_id = ?";

  db.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("Error fetching data from comments table:", err);
      res.status(500).send("Error fetching data from comments table");
    } else {
      res.status(200).json(result);
    }
  });
});

server.get("/contactUsData", verifyToken, async (req, res) => {
  try {
    db.query("SELECT * FROM contactUs", (err, response) => {
      if (err) {
        res.status(404).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//ruta para contactar al administrador
server.post("/contactUs", verifyToken, (req, res) => {
  const { name, email, message } = req.body;
  const sql = "INSERT INTO contactUs (name, email, message) VALUES (?, ?, ?)";
  db.query(sql, [name, email, message], (err, response) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error interno del servidor");
    } else {
      res.status(200).send("¡Mensaje enviado correctamente!");
    }
  });
});

//Ruta para eliminar comentario del contact us
server.delete("/contactUs/delete/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  db.query("delete from contactUs where id = ?", id, (err, ersponse) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send("comentario eliminadox");
    }
  });
});

//add compra a la base de datos
server.post("/buys", verifyToken, function (req, res) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //Desencripta el token para obtener la información del usuario
  jwt.verify(token, "secret_key", (err, authData) => {
    if (err) {
      // Si hay un error en el token, responde con un código de estado 403 (Prohibido)
      res.sendStatus(403);
    } else {
      const userId = authData.data[0].id;
      const userEmail = authData.data[0].email;
      const userName = authData.data[0].fullName;
      const commentExtra = null;
      const estado = "pendiente";
      const {
        amount,
        productName,
        id,
        direccion,
        telefono,
        totalPrice,
        price,
        fecha_compra,
        available,
      } = req.body;

      const sql =
        "INSERT INTO compras (producto_id, cliente_id, nombre_cliente, nombre_producto, direccion_cliente, numero_telefono, correo_electronico, cantidad_producto, precio_producto, precio_total, commentExtra, fecha_compra,estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      const values = [
        id,
        userId,
        userName,
        productName,
        direccion,
        telefono,
        userEmail,
        amount,
        price,
        totalPrice,
        commentExtra,
        fecha_compra,
        estado,
      ];

      db.query(sql, values, function (err, result) {
        if (err) {
          console.error("Error inserting data into compras table:", err);
          res.status(500).send("Error inserting data into compras table");
        } else {
          res.status(200).send("Compra agregada exitosamente");
          const newAvailable = available - amount;
          db.query(
            `UPDATE products SET available = ? WHERE id = ?`,
            [newAvailable, id],
            (err2, response2) => {
              if (err2) {
                res.status(404).send(err);
              } else {
                res.status(200);
              }
            }
          );
        }
      });
    }
  });
});

//get compras
server.get("/getbuys", verifyToken, async (req, res) => {
  try {
    db.query("SELECT * FROM compras", (err, response) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//update compras
server.put("/putBuys", verifyToken, async (req, res) => {
  const { id } = req.body.id;
  console.log(id)
  try {
    db.query(
      `UPDATE compras SET estado = "vendido"  WHERE id = ${id}`,
      (err, response) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send("Aclualizado");
        }
      }
    );
  } catch (err) {
    res.status(500).send(err);
  }
});

//delete compras
server.delete("/deleteBuy/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    db.query(`delete from compras where id = ${id}`, (err, response) => {
      if (err) {
        res.status(404).send(err);
      } else {
        res.status(200).send("compra eliminada");
      }
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

//get tienda
server.get("/getTienda", (req,res)=>{
  db.query('SELECT * FROM tienda', (err,result)=>{
    if(err){
      res.status(404).send(err)
    }else{
      res.status(200).send(result)
    }
  })
})

//change discount
server.post("/changeDiscount", verifyToken, (req,res)=>{
  const {select, discount, id} = req.body

  const sql = "UPDATE tienda SET estadoDescuento = ?, CatnDescuento = ? WHERE id = ?"
  db.query(sql,[select,discount,id],(err,response)=>{
    if(err){
      res.status(400).send(err)
    }else{
      res.status(200).send("Descuento actualizado correctamente")
    }
  })
})


server.listen(port, () =>
  console.log(`the server is active on the port ${port}`)
);
