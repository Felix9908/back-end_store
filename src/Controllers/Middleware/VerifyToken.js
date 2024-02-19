import jwt from "jsonwebtoken";
import { secret_key } from "../../../settings/keys.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(403);
  jwt.verify(token, secret_key, (err, user) => {
    if (err) return res.sendStatus(404);
    req.user = user;
    next();
  });
};
