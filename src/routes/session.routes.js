import passport from "passport";
import { Router } from "express";
import User from "../dao/dbmanager/users.manager.js";
import { hashPassword, comparePassword } from "../utils.js";

//Inicializa variables
const router = Router();
const usersManager = new User();

//Ruta que realiza el login
router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "./faillogin" }),
  async (req, res) => {
    if (!req.user)
      res.status(400).json({ respuesta: "Credenciales invalidas" });
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      age: req.user.age,
    };
    res.status(200).json({ respuesta: "Bienvenido a la tienda" });
  }
);

//Ruta que devuelve un error si el login falla
router.get("/faillogin", async (req, res) => {
  res.status(401).json({ respuesta: "Credenciales invalidas" });
});

//Ruta que realiza el signup
router.post(
  "/signup",
  passport.authenticate("signup", { failureRedirect: "/failsignup" }),
  async (req, res) => {
    res.status(200).json({ respuesta: "Usuario creado con éxito" });
  }
);

router.get("/failsignup", async (req, res) => {
  res.status(401).json({ respuesta: "Error al crear el usuario" });
});

//Ruta que recupera la contraseña
router.post("/forgot", async (req, res) => {
  const { username, newPassword } = req.body;

  const result = await usersManager.getOne(username);
  if (result.length === 0)
    return res.status(401).json({
      respuesta: "El usuario no existe",
    });
  else {
    const updatePassword = await usersManager.updatePassword(
      result[0]._id,
      hashPassword(newPassword)
    );
    res.status(200).json({
      respuesta: "Contrseña actualizada con éxito",
    });
  }
});

export default router;
