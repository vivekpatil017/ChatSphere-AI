import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./db/connectdb.js";
import dns from "dns";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import ProjectModel from "./models/project.model.js";
import { generateContentStream } from "./services/ai.service.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

connectDB();

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];
        const projectId = socket.handshake.query.projectId;

        console.log("Socket connection attempt:", { projectId, hasToken: !!token });

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error("socketAuthError: Invalid project ID"));
        }

        socket.project = await ProjectModel.findById(projectId);
        
        if (!socket.project) {
            return next(new Error("socketAuthError: Project not found"));
        }

        if (!token) {
            return next(new Error("socketAuthError: Unauthorized error (No token provided)"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error("socketAuthError: Unauthorized error (Invalid token)"));
        }

        socket.user = decoded;
        next();
    } catch (error) {
        console.error("Socket authentication error:", error.message);
        next(new Error("socketAuthError: " + error.message));
    }
});

const projectHistory = new Map();
const AI_SENDER = { _id: "AI", name: "AI Assistant" };

io.on('connection', socket => {
    console.log("a user is connected");

    socket.join(socket.project._id.toString());

    socket.on("Project-message", async data => {

        const aiIsPresentInMessage = data.message.includes("@ai");
        socket.broadcast.to(socket.project._id.toString()).emit("Project-message", data);

        if (aiIsPresentInMessage) {
            const prompt = data.message.replace("@ai", "").trim();
            const projectId = socket.project._id.toString();

            // Initialize or get history
            if (!projectHistory.has(projectId)) {
                projectHistory.set(projectId, []);
            }
            let history = projectHistory.get(projectId);

            // Add user message to history
            history.push({ role: 'user', parts: [{ text: prompt || "Hello! How can you help me today?" }] });
            
            // Limit history to last 10 messages (5 pairs)
            if (history.length > 10) {
                history = history.slice(-10);
            }

            try {
                const stream = await generateContentStream(history);
                
                let fullResponse = "";
                for await (const chunk of stream) {
                    const text = chunk.text();
                    fullResponse += text;
                    io.to(projectId).emit("Project-message-chunk", {
                        chunk: text,
                        sender: AI_SENDER
                    });
                }

                // Finalize response
                io.to(projectId).emit("Project-message-end", {
                    fullResponse,
                    sender: AI_SENDER
                });

                // Add AI response to history
                history.push({ role: 'model', parts: [{ text: fullResponse }] });
                projectHistory.set(projectId, history);

            } catch (error) {
                console.error("AI Streaming Error:", error);
                io.to(projectId).emit("Project-message", {
                    message: "Sorry, I encountered an error while processing your request.",
                    sender: AI_SENDER
                });
            }
        }
    });

    socket.on('disconnect', () => {
        socket.leave(socket.project._id.toString());
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});