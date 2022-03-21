import { Router } from "express";
import Controller from "../controllers/controller.js";
import middleware from "../middlewares/middleware.js";
const app = Router();

app.post("/signup", Controller.signup);
app.post("/login", Controller.login);
app.get("/verify", middleware, Controller.verifyUser);


export default app;
