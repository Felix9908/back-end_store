import { query } from "../app.js";
import { deleteImage } from "../app.js";
import { db } from "../app.js";

export const deleteProducts = async (req, res) => {
  try {
    const productId = req.params.id;

    const selectSql = "SELECT nameImg FROM products WHERE id = ?";
    const deleteSql = "DELETE FROM products WHERE id = ?";
    const deleteCommentsSql = "DELETE FROM comments WHERE product_id = ?";
    const checkBuys = "SELECT * FROM compras WHERE producto_id = ?";

    const check = await query(checkBuys, [productId]);
    if (check.length == 0) {
      const result = await query(selectSql, [productId]);

      if (result.length === 0) {
        res.status(404).send("Product not found");
        return;
      }

      const imageName = result[0].nameImg;

      query(deleteCommentsSql, [productId]);

      await query(deleteSql, [productId]);

      await deleteImage(`uploads/${imageName}`);

      res.status(200).send("Product and image deleted successfully");
    } else {
      res.status(202).send("Todavia hay usuarios con pedidos de este producto");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};

export const createProduct = async (req, res, next) => {
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
};

export const getProducts = (req, res, next) => {
  const sql = "SELECT * FROM products";

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching data from SQL table:", err);
      res.status(500).send("Error fetching data from SQL table");
    } else {
      res.status(200).json(result);
    }
  });
};

export const updateAvailable = (req, res) => {
  const { newAvailable, id } = req.body;
  const availableInt = parseInt(newAvailable);
  const sql = "UPDATE products SET available = ? WHERE id = ?";
  db.query(sql, [availableInt, id], (err, response) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send("Cantidad disponible actualizada correctamente");
    }
  });
};
