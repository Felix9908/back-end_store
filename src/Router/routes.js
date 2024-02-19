import { logOut, login } from "../Controllers/AuthController.js";
import {
  createBuy,
  deleteBuy,
  getBuys,
  putBuysCliente,
  updateBuy,
} from "../Controllers/BuysController.js";
import {
  createComment,
  deleteComment,
  getAllComments,
  updateComment,
} from "../Controllers/CommentsController.js";
import {
  createContactUs,
  deleteContactUs,
  getAllContactUs,
} from "../Controllers/ContactUsController.js";
import {
  createProduct,
  getProducts,
  deleteProducts,
  updateAvailable,
} from "../Controllers/ProductController.js";
import {
  createUser,
  deleteUser,
  getAllUsers,
} from "../Controllers/UserConreoller.js";
import { changeMode, getStore } from "../Controllers/StoreController.js";
import { server } from "../app.js";
import { verifyToken } from "../Controllers/Middleware/VerifyToken.js";
import multer from "multer";
import { sendCode, sendEmail } from "../Controllers/ChangePasswordController.js";
const upload = multer({ dest: "uploads/" });

export const myRutes = () => {
  //Product routes
  server.delete("/deleteProducts/:id", verifyToken, deleteProducts);
  server.post("/create", upload.single("image"), createProduct);
  server.get("/data", getProducts);
  server.post("/updateAvailable", verifyToken, updateAvailable);

  //User routes
  server.post("/createUser", createUser);
  server.get("/users", verifyToken, getAllUsers);
  server.delete("/deleteUser/:id", verifyToken, deleteUser);

  //Comments routes
  server.post("/comments/create", verifyToken, createComment);
  server.delete("/comments/delete/:id", verifyToken, deleteComment);
  server.put("/comments/edit/:id", verifyToken, updateComment);
  server.get("/comments/:productId", getAllComments);

  //Contact Us routes
  server.get("/contactUsData", verifyToken, getAllContactUs);
  server.post("/contactUs", verifyToken, createContactUs);
  server.delete("/contactUs/delete/:id", verifyToken, deleteContactUs);

  //buys routes
  server.post("/buys", verifyToken, createBuy);
  server.get("/getbuys", verifyToken, getBuys);
  server.put("/putBuysVendedor", verifyToken, updateBuy);
  server.put("/putBuysCliente", verifyToken, putBuysCliente);
  server.delete("/deleteBuy/:id", verifyToken, deleteBuy);

  //table store routes
  server.get("/getTienda", getStore);
  server.put("/changeMode", verifyToken, changeMode);
  server.post("/changeDiscount", verifyToken);

  //auth routes
  server.post("/login", login);
  server.put("/logout", verifyToken, logOut);

  //Recovry password routes
  server.post("/getCode", sendCode);
  server.post("/resetPassword",);
  server.post("/sendEmail", sendEmail);
};
