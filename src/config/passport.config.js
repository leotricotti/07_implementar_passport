import passport from "passport";
import passportLocal from "passport-local";
import User from "../dao/dbmanager/users.manager.js";
import { hashPassword, comparePassword } from "../utils.js";

// Inicializar passport y user manager
const usersManager = new User();
const localStrategy = passportLocal.Strategy;

// Configurar passport
const initializePassport = () => {
  passport.use(
    "signup",
    new localStrategy(
      { passReqToCallback: true, userNameField: "email" },
      async (req, username, password, done) => {
        const { firs_name, last_name, email, age } = req.body;
        try {
          const user = await usersManager.getOne(username);
          if (user.length > 0) {
            console.log("El usuario ya existe");
            return done(null, false);
          }
          const newUser = {
            firs_name,
            last_name,
            email,
            age,
            password: hashPassword(password),
          };

          const result = await usersManager.signup(newUser);
          return done(null, {
            message: "Usuario creado con éxito",
            data: result,
          });
        } catch (error) {
          return done({ message: "Error al crear el usuario", data: error });
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await usersManager.getOne(username);
          if (!user) {
            return done(null, false, { message: "Usuario no encontrado" });
          }
          if (!comparePassword(password, user.password)) {
            return done(null, false, { message: "Contraseña incorrecta" });
          }
          return done(null, user);
        } catch (error) {
          return done({ mensage: "Error al iniciar sesión", data: error });
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await usersManager.getOne(id);
    done(null, user);
  });
};

export default initializePassport;
