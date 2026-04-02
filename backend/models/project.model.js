import mongoose from "mongoose";

const createProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
}, { timestamps: true });

const ProjectModel = mongoose.model("Project", createProjectSchema);

export default ProjectModel;