import express from "express";
import { addToWatchLater } from "../controllers/watchlater.js";
import middleware from "../middlewares/middleware.js";
const router = express.Router();

router.use(middleware);

router.post("/add", addToWatchLater);
export default router;
