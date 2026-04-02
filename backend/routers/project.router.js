import router from "express";
import {body} from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleware from "../middlewares/auth.middleware.js";


const Router = router();

Router.post("/create",
    authMiddleware.authUserMiddleware,
    body('name').isString().withMessage('name is required'),
    projectController.createProject
 )

Router.get("/all",authMiddleware.authUserMiddleware, projectController.getAllProjects);

Router.put("/add-user",
    authMiddleware.authUserMiddleware,
    body('projectId').isMongoId().withMessage('Invalid Project ID'),
    body('users').isArray({ min: 1 }).withMessage('users must be an array of strings').custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    body('users.*').isMongoId().withMessage('Invalid user ID'),
    projectController.addUserToProject
);

Router.get("/get-project/:projectId", authMiddleware.authUserMiddleware, projectController.getProjectById)
export default Router;