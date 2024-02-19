import { db } from "../app.js";

export const login = (req, res) => {
  const UserName = req.body.userName;
  const password = req.body.password;
  const sql = "SELECT * FROM users WHERE username = ? and password = ?";
  db.query(sql, [UserName, password], (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (data.length > 0) {
        const payload = {
          check: true,
          data: data,
        };
        jwt.sign(payload, secret_key, (err, token) => {
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
  });
};

export const logOut = (req, res) => {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, secret_key, { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.send({ msg: "Has sido desconectado" });
    } else {
      res.send({ msg: "Error" });
    }
  });
};
