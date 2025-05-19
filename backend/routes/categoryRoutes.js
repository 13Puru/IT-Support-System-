import express from 'express'
import { adminAuthMiddleware, authMiddleware } from '../middleware/middleware.js';
import { categoryUpdate, getCategory } from '../controllers/categoryControllers.js';


const categoryRouter = express.Router();

categoryRouter.put("/update", adminAuthMiddleware, categoryUpdate)
categoryRouter.get("/get", authMiddleware, getCategory)

export default categoryRouter;