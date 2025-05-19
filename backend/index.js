import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import pool from "./config/database.js";
import authRouter from "./routes/authRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import fs from 'fs';
import path from 'path';
import { authMiddleware } from "./middleware/middleware.js";


const app = express();
const PORT = process.env.PORT || 8383;
const FrontendAccess = process.env.FRONTEND_ACCESS
pool
  .connect()
  .then(() => console.log("Database connected ✅"))
  .catch((err) => console.error("Database connection error ❌", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // <-- Handles form data
app.use(cookieParser());
app.use(cors({ origin: FrontendAccess, credentials: true }));

//api endpoints
app.use("/api/auth", authRouter);//authentication routes
app.use("/api/ticket", ticketRouter);//ticketing routes
app.use("/api/user", userRouter);//user routes
app.use("/api/category", categoryRouter);//category routes
// Secure route to serve uploaded files only to authenticated users
app.get('/uploads/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename;
  
  // Validate filename to prevent directory traversal attacks
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), 'uploads', sanitizedFilename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  // You can add additional authorization checks here
  // For example, check if the user has access to the ticket containing this file
  
  // Send the file
  res.sendFile(filePath);
});

try {
  app.listen(PORT, () => console.log(`🚀 Server is running on port: ${PORT}`));
} catch (err) {
  console.error("❌ Server startup error:", err);
}
