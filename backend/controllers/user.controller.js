import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const registerUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await userService.registerUser(req.body);

        const token = user.generateToken();

        res.cookie("token", token);
        delete user._doc.password;

        res.status(201).json({
            message: "registerSuccess: User registered successfully",
            user,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "registerError: Internal server error",
            error: error.message
        });
    }
};

export const loginUserController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: "loginError: Email and password are required" });
        }

        const user = await userModel
            .findOne({ email })
            .select("+password");

        if (!user) {
            return res.status(404).json({ message: "loginError: User not found" });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "loginError: Invalid password" });
        }

        const token = user.generateToken();


        res.cookie("token", token);
        delete user._doc.password;


        res.status(200).json({
            message: "loginSuccess: User logged in successfully",
            user,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "loginError: Internal server error",
            error: error.message
        });
    }
};

export const profileController = async (req, res) => {
    res.status(200).json({
        user: req.user
    });
}

export const logoutUserController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        redisClient.set(token,'logout', "EX", 60 * 60 * 24);

        res.status(200).json({ message: "logoutSuccess: User logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: "logoutError: Internal server error", error: error.message });
    }
}

export const getAllUsersController = async (req, res) => {
    try{
        const loggedInUser = await userModel.findOne({email: req.user.email});

        if(!loggedInUser){
            return res.status(404).json({ message: "getAllUsersError: User not found" });
        }

        const users = await userService.getAllUsersService({ loggedInUserId: loggedInUser._id });
        res.status(200).json({
            message: "getAllUsersSuccess: Users fetched successfully",
            users
        });
    }catch(error){
        res.status(500).json({
            message: "getAllUsersError: Internal server error",
            error: error.message
        });
    }
}