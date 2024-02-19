import { db } from "../app.js";

//get store
export const getStore = (req, res) => {
    db.query("SELECT * FROM tienda", (err, result) => {
      if (err) {
        res.status(404).send(err);
      } else {
        res.status(200).send(result);
      }
    });
  };

//change light or dark mode
export const changeMode = (req, res) => {
    const { newModeValue, id } = req.body;
    const updateQuery = "UPDATE users SET mode = ? WHERE id = ?";
  
    db.query(updateQuery, [newModeValue, id], (err, result) => {
      if (err) {
        res.status(400).json({
          error: "Error updating mode in users table",
          details: err.message, // Utilizamos err.message para obtener el mensaje específico del error
        });
        // Manejar el error según tus necesidades
      } else {
        res.status(200).json({
          message: "Modo actualizado correctamente",
          result: result, // Si es necesario, puedes incluir el resultado de la actualización
        });
        // Realizar acciones adicionales si es necesario
      }
    });
  };

//change discount
export const changeDiscount = (req, res) => {
    const { select, discount, id } = req.body;
  
    const sql =
      "UPDATE tienda SET estadoDescuento = ?, CatnDescuento = ? WHERE id = ?";
    db.query(sql, [select, discount, id], (err, response) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).send("Descuento actualizado correctamente");
      }
    });
  };