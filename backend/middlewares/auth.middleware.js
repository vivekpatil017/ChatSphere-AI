import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUserMiddleware = async (req, res, next) => {
    try {
        const tokenFromCookies = req.cookies.token;
        const tokenFromHeaders = req.headers.authorization?.split(" ")[1];
        const token = tokenFromCookies || tokenFromHeaders;

        if (!token) {
            return res.status(401).json({ message: "authUserMiddlewareError: Unauthorized" });
        }

        console.log("Token source:", tokenFromCookies ? "Cookie" : "Header");

        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.cookie('token', '');
            return res.status(401).json({ message: "authUserMiddlewareError: Unauthorized" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        
        console.log("Authenticated user email from token:", req.user.email);

        next();
    } catch (error) {
        console.log("Auth error:", error.message);
        res.status(500).json({ message: "authUserMiddleware: Internal server error" });
    }
};
