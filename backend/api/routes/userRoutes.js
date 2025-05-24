import express from "express";
import {
  authMiddleware,
  adminAuthMiddleware,
} from "../middleware/middleware.js";
import {
  createUser,
  getAllUsers,
  getProfile,
  restrictUser,
  unrestrictUser,
} from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.get("/get-profile/:user_id", authMiddleware, getProfile);
userRouter.get("/get-all-users", adminAuthMiddleware, getAllUsers); //for admins fetching all users
userRouter.post("/create-user", adminAuthMiddleware, createUser);

//For Restrict-un-restrict user
userRouter.post("/users-restrict/:user_id", adminAuthMiddleware, restrictUser);
userRouter.post(
  "/users-unrestrict/:user_id",
  adminAuthMiddleware,
  unrestrictUser
);

export default userRouter;
