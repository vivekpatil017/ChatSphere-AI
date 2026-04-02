import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routers/user.route.js";
import projectRoute from "./routers/project.router.js";
import aiRoute from "./routers/ai.route.js";

const app = express();

app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,
    }
));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/user", userRoute);

app.use("/projects", projectRoute);

app.use("/ai", aiRoute);
export default app;