import { db } from "../app.js";
import jwt from "jsonwebtoken";
import { secret_key } from "../../settings/keys.js";

//create buy to database
export const createBuy = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //Desencripta el token para obtener la información del usuario
  jwt.verify(token, secret_key, (err, authData) => {
    if (err) {
      // Si hay un error en el token, responde con un código de estado 403 (Prohibido)
      res.sendStatus(403);
    } else {
      const userId = authData.data[0].id;
      const userEmail = authData.data[0].email;
      const userName = authData.data[0].fullName;
      const commentExtra = null;
      const estadoEntVendedor = "pendiente";
      const estadoEntCliente = "pendiente";
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
        "INSERT INTO compras (producto_id, cliente_id, nombre_cliente, nombre_producto, direccion_cliente, numero_telefono, correo_electronico, cantidad_producto, precio_producto, precio_total, commentExtra, fecha_compra,estadoEntVendedor,estadoEntCliente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

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
        estadoEntVendedor,
        estadoEntCliente,
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
};

//get compras
export const getBuys = async (req, res) => {
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
};

//update buy
export const updateBuy = async (req, res) => {
  const { id } = req.body.id;
  try {
    db.query(
      `UPDATE compras SET estadoEntVendedor = "vendido"  WHERE id = ${id}`,
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
};

//edit customer purchase status
export const putBuysCliente = async (req, res) => {
  const { id } = req.body.id;
  try {
    db.query(
      `UPDATE compras SET estadoEntCliente = "vendido"  WHERE id = ${id}`,
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
};

//delete buy
export const deleteBuy = async (req, res) => {
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
};