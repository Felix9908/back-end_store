import { db } from "../app.js";

// Crear un comentario
export const createComment = (req, res) => {
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
  };
  
  // Borrar un comentario
export const deleteComment = (req, res) => {
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
  };
  
  // Editar un comentario
export const updateComment = (req, res) => {
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
  };
  
  // Obtener todos los comentarios
export const getAllComments = (req, res) => {
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
  };