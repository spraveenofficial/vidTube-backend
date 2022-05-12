import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import "./database/db.js";
import morgan from "morgan";
dotenv.config();
import authRoutes from "./routes/routes.js";
import fileUpload from "express-fileupload";
import videoRoute from "./routes/video.js";
import feelingRoutes from "./routes/feelings.js";
import SubscriptionROutes from "./routes/subscription.js";
import PlayListRoutes from "./routes/playlist.js";
import HistoryRoutes from "./routes/history.js";

// This is solution for __dirname in ES6
const __dirname = path.resolve();
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);
// Registering morgan for development
app.use(morgan("dev"));

// Registering Cors
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
const PORT = process.env.PORT || 3505;

// Giving Path for Sending Static Files like Images
app.use("/v1/api", express.static(path.join(__dirname, "public")));


// Registering Routes
app.use("/v1/api/auth", authRoutes);
app.use("/v1/api/video", videoRoute);
app.use("/v1/api/feelings", feelingRoutes);
app.use("/v1/api/subscription", SubscriptionROutes);
app.use("/v1/api/playlist", PlayListRoutes);
app.use("/v1/api/history", HistoryRoutes);

// Server initialize
app.listen(PORT, () => console.log(`App started running on ${PORT}`));
