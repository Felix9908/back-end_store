import express from "express";
import cors from "cors";
import fs from "fs";
import { myRutes } from "./Router/routes.js";
import { createDatabasePool } from "./config.js";
export const server = express();
server.use(cors());
import {PORT} from './config.js'


server.use("/uploads", express.static("uploads"));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));


export const db = createDatabasePool()

// Función para reconectar en caso de desconexión o error
const handleDisconnect = () => {
  db.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      console.error("Database connection was lost. Reconnecting...");
      db = createDatabasePool();
      handleDisconnect(); 
    } else {
      throw err;
    }
  });
};

// Llama a la función para manejar la reconexión
handleDisconnect();

db.query("SELECT 1", (err, result) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the database!");
});

myRutes();

// Función para ejecutar consultas SQL
export async function query(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

// Función para eliminar una imagen física
export async function deleteImage(imagePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(imagePath, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

server.listen(PORT, () =>
  console.log(`the server is active on the port ${PORT}`)
);
