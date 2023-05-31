const express = require("express");
const mysql2 = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");

const server = express();
server.use(cors());
const port = 9999;

server.use("/uploads", express.static("uploads"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
const keys = require("./settings/keys");
const secret_key = keys.key;

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "store",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

verifyToken= (req, res, next)=> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  jwt.verify(token, "secret_key", (err, user) => {
    if (err) return res.sendStatus(404);
    req.user = user;
    next();
  });
}

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
  console.log(req.params.id)

  const selectSql = "SELECT nameImg FROM products WHERE id = ?";
  const deleteSql = "DELETE FROM products WHERE id = ?";

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
              res.send({ msg: "AUTEMTICACION EXITOSA", token: token, userData: data });
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
  
  const sql = "INSERT INTO users (user, password, fullName, email, privUser) VALUES (?, ?, ?, ?, ?)";
  const values = [username, password, fullName, email, privUser];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting data into users table:", err);
      res.status(500).send("Error inserting data into users table");
    } else {
      res.status(200).send("User created successfully");
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

server.get("/users",verifyToken,(req,res)=>{
  db.query("select * from users",(err,data)=>{
    if(err){
      res.status(400).send("Not found")
    }else{
      res.status(200).send(data)
    }
  })
})

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
  const { productId, text, clientName } = req.body;

  if (!productId || !text || !clientName) {
    res.status(400).send("No se recibieron todos los datos requeridos");
    return;
  }

  const sql =
    "INSERT INTO comments (product_id, text, clientName) VALUES (?, ?, ?)";

  const values = [productId, text, clientName];

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



server.listen(port, () =>
  console.log(`the server is active on the port ${port}`)
);
