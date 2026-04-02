import userModel from "../models/user.model.js";

export const registerUser = async ({ email, password }) => {

    if (!email || !password) {
        throw new Error("Please provide email and password");
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    return user;
};

export const getAllUsersService = async ({loggedInUserId}) => {
    const users = await userModel.find({
        _id: { $ne: loggedInUserId }
    });
    return users;
}