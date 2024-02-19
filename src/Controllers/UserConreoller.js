import { db } from "../app.js";

export const createUser = (req, res) => {
    const { username, password, fullName, email, privUser } = req.body;
    const mode = 0;
  
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
          "INSERT INTO users (userName, password, fullName, email, privUser, mode) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [username, password, fullName, email, privUser, mode];
  
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
  };

 export const getAllUsers = (req, res) => {
    db.query("select * from users", (err, data) => {
      if (err) {
        res.status(400).send("Not found");
      } else {
        res.status(200).send(data);
      }
    });
  };

export const deleteUser = (req, res) => {
    const id = req.params.id;
    const deleteSql = "DELETE FROM users WHERE id = ?";
    const deleteCommentsSql = "DELETE FROM comments WHERE product_id = ?";
    const deleteComprasSql = "DELETE FROM compras WHERE id = ?";
    db.query(deleteCommentsSql, [id]);
    db.query(deleteComprasSql, [id]);
    db.query(deleteSql, [id], (err, resp) => {
      if (err) {
        res.status(400).send(`Error: ${err}`);
      } else {
        res.status(200).send("User deleted");
      }
    });
  };