import { generateContent } from "../services/ai.service.js";

export const generateContentController = async (req, res) => {
    try {
        const { prompt } = req.query || req.body;
        const finalPrompt = prompt || req.body.prompt;
        
        if (!finalPrompt) {
            return res.status(400).send("Prompt is required");
        }

        const result = await generateContent(finalPrompt);
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
}