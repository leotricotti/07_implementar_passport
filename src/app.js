import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import * as dotenv from "dotenv";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import handlebars from "express-handlebars";
import CartsRouter from "./routes/carts.routes.js";
import LoginRouter from "./routes/login.routes.js";
import ForgotRouter from "./routes/forgot.routes.js";
import SignUpRouter from "./routes/signup.routes.js";
import SessionRouter from "./routes/session.routes.js";
import ProductsRouter from "./routes/products.routes.js";
import Products from "./dao/dbmanager/products.manager.js";
import initializePassport from "./config/passport.config.js";
import RealTimeProducts from "./routes/realTimeProducts.routes.js";

//Inicializar servicios
dotenv.config();
const productsManager = new Products();

//Variables
const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Handlebars
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main.handlebars",
    extname: "hbs",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);

// Connect to MongoDB
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
      ttl: 30 * 60,
    }),
    secret: "codersecret",
    resave: false,
    saveUninitialized: true,
  })
);

// Conexión respuesta de la base de datos
const enviroment = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Base de datos conectada");
  } catch (error) {
    console.log(error);
  }
};

enviroment();

// Middlewares
app.use(express.json());
app.use(passport.session());
app.use(passport.initialize());
app.use(express.static("public"));
app.use(cookieParser("C0d3rS3cr3t"));
app.use(express.urlencoded({ extended: true }));

//Middleware para hacer privadas las rutas
const auth = async (req, res, next) => {
  try {
    const session = await req.session;
    const user = await session.user;
    if (user && session) {
      return next();
    } else {
      return res.status(401).json({
        respuesta: "No estás autorizado",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Middleware para validar si el usuario es administrador
const authAdmin = async (req, res, next) => {
  try {
    const admin = req.session.admin;
    if (admin) {
      return next();
    } else {
      return res.status(401).json({
        respuesta: "No estás autorizado",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Routes
app.use("/", LoginRouter);
app.use("/signup", SignUpRouter);
app.use("/forgot", ForgotRouter);
app.use("/api/carts", auth, CartsRouter);
app.use("/api/session", SessionRouter);
app.use("/api/products", auth, ProductsRouter);
app.use("/api/realtimeproducts", authAdmin, RealTimeProducts);

// Server
const httpServer = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket
const io = new Server(httpServer);
// Código para el manejo de conexiones de socket
io.on("connection", async (socket) => {
  // Mensaje de bienvenida al cliente que se conectó
  console.log("Un cliente se ha conectado");

  // Obtener datos de la base de datos
  socket.on("nextPage", async (page) => {
    try {
      const products = await productsManager.getAll();
      const orderedProducts = products.reverse();
      const paginatedProducts = orderedProducts.slice(0, page * 10);
      io.emit("products", paginatedProducts);
    } catch (error) {
      // Manejar el error
      console.log(error);
    }
  });
});
