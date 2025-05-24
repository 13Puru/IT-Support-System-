// api/index.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import pool from "../config/database.js";
import authRouter from "../routes/authRoutes.js";
import ticketRouter from "../routes/ticketRoutes.js";
import userRouter from "../routes/userRoutes.js";
import categoryRouter from "../routes/categoryRoutes.js";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/middleware.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const FrontendAccess = process.env.FRONTEND_ACCESS;

pool
  .connect()
  .then(() => console.log("Database connected ✅"))
  .catch((err) => console.error("Database connection error ❌", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: FrontendAccess, credentials: true }));

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);

// Secure file access route
app.get("/uploads/:filename", authMiddleware, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "..", "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: "File not found",
    });
  }

  res.sendFile(filePath);
});

// Export handler for Vercel
export default app;

