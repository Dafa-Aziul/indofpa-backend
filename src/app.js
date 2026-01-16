import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.js";
import { corsOptions } from "./config/corsConfig.js";

const app = express();

const isDev = process.env.NODE_ENV !== "production";

// HELMET SECURITY
app.use(
  helmet({
    crossOriginResourcePolicy: false, 
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ORS — Auto Switch
if (isDev) {
  console.log("🌱 Development mode: CORS open");
  app.use(cors({ origin: true, credentials: true }));
} else {
  console.log("🚀 Production mode: CORS strict");
  app.use(cors(corsOptions)); // whitelist strict
}

// Body & Cookies
app.use(express.json());
app.use(cookieParser());

// API ROUTES
app.use("/api", routes);

// Error Handler
app.use(errorHandler);

export default app;
