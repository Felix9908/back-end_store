import mysql2 from "mysql2";

export const PORT = process.env.PORT || 9999;

//  const  DB_HOST = process.env.DB_HOST || "monorail.proxy.rlwy.net"
//  const  DB_USER = process.env.DB_USER || "root"
//  const  DB_PASSWORD = process.env.DB_PASSWORD || "G5bcEbGaBgf6FaHe3GaHgBEfC6adeaAA"
//  const  DB_DATABASE = process.env.DB_DATABASE || "railway"
//  const  DB_PORT = process.env.DB_PORT || "40389"

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_DATABASE = process.env.DB_DATABASE || "store";
const DB_PORT = process.env.DB_PORT || "3306";

export const createDatabasePool = () => {
  return mysql2.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT,
    connectionLimit: 10,
  });
};
