import ProjectModel from "../models/project.model.js";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import * as projectService from "../services/project.service.js";


export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{

    const { name } = req.body;
    const loggedInUser = await userModel.findOne({email: req.user.email});

    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({
        name,
        userId
    });


    res.status(201).json(newProject);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "createProjectError: Internal server error", error: error.message });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        });

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Searching projects for user ID:", loggedInUser._id);

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        });

        console.log("Projects found count:", allUserProjects.length);

        return res.status(200).json({
            allUserProjects
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "getAllProjectsError: Internal server error", error: error.message });
    }
}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        const project = await projectService.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });


        return res.status(200).json({
            project,
        });

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
};

export const getProjectById = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({ projectId });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "getProjectByIdError: Internal server error", error: error.message });
    }
}