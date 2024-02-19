import { db } from "../app.js";

//get all contact us
export const getAllContactUs = async (req, res) => {
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
};

// contact to administrator
export const createContactUs = (req, res) => {
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
};

//delete comments contact us
export const deleteContactUs =  (req, res) => {
  const id = req.params.id;
  db.query("delete from contactUs where id = ?", id, (err, ersponse) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send("comentario eliminadox");
    }
  });
};
