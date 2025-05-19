import express from "express";
import { authMiddleware } from "../middleware/middleware.js";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import {
  assignTickets,
  closeTicket,
  createTicket,
  getTickets,
  getTicketStatus,
  replyToResponse,
  resolveTicket,
  selfAssignTicket,
  updateTicket,
} from "../controllers/ticketControllers.js";

const ticketRouter = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created successfully');
}

// Configure multer with improved file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create a safe filename with timestamp to prevent overwrites
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${timestamp}-${originalName}`);
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, and image files are allowed.'), false);
  }
};

// Configure multer with limits and filters
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Error handling middleware for multer errors
ticketRouter.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
});

// Updated route to handle file uploads for ticket creation
ticketRouter.post("/create-ticket", authMiddleware, upload.single("file"), createTicket);
ticketRouter.get("/get-ticket", authMiddleware, getTickets);
ticketRouter.post("/assign", authMiddleware, assignTickets);
ticketRouter.post("/self-assign", authMiddleware, selfAssignTicket);
ticketRouter.post("/resolve", authMiddleware, resolveTicket);
ticketRouter.post("/close", authMiddleware, closeTicket);
ticketRouter.post("/respond", authMiddleware, updateTicket);
ticketRouter.post("/reply", authMiddleware, replyToResponse);
ticketRouter.get("/ticket-stat/:user_id", authMiddleware, getTicketStatus);
ticketRouter.get("/fetch-ticket-details", authMiddleware, (req, res) => {
  console.log("✅ Access granted to:", req.user);
  res.json({ message: "Success", data: [] });
});

export default ticketRouter;