import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register",
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.registerUserController
);

router.post("/login",
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    userController.loginUserController
);

router.get("/profile", authMiddleware.authUserMiddleware, userController.profileController);

router.get("/logout", authMiddleware.authUserMiddleware, userController.logoutUserController);

router.get("/all", authMiddleware.authUserMiddleware, userController.getAllUsersController);

export default router;