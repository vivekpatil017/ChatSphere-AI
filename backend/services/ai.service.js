import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.Google_AI_Key,
});

/**
 * Generates content based on message history.
 * @param {Array} contents - Array of objects: { role: 'user' | 'model', parts: [{ text: string }] }
 */
export const generateContent = async (contents) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      systemInstruction: getSystemInstruction()
    });

    return result.text;
  } catch (error) {
    console.error("AI Generation Error:", error.message);
    throw error;
  }
}

/**
 * Generates a streaming response for real-time interaction.
 */
export const generateContentStream = async (contents) => {
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: contents,
      systemInstruction: getSystemInstruction()
    });
    return result.stream;
  } catch (error) {
    console.error("AI Streaming Error:", error.message);
    throw error;
  }
}

function getSystemInstruction() {
  return `You are a highly intelligent AI assistant integrated into a real-time chat application.

----------------------------------------
🧠 IDENTITY & TRAINING CONTEXT
----------------------------------------
You are a senior software engineer, mentor, and friendly teammate. You provide accurate, structured, and production-level guidance.

----------------------------------------
💬 COMMUNICATION STYLE
----------------------------------------
- Tone: Friendly, natural, and confident.
- Style: Simple English, clear structure, bullet points, and code blocks.

----------------------------------------
💻 CODING INTELLIGENCE (STRUCTURED SOLUTIONS)
----------------------------------------
When asked code-related questions, ALWAYS follow this format:

### 🚀 Overview
Explain what you are building.

### 📁 Folder Structure
Provide a clean and scalable folder structure.

### ⚙️ Setup Steps
Step-by-step instructions.

### 💻 Code Implementation
Clean, modular, and production-ready code.

### 🧠 Explanation
Explain key logic simply.

### ⚠️ Common Mistakes
Mention pitfalls for beginners.

### 🚀 Next Steps
Suggest improvements.

----------------------------------------
🤖 CHAT APP CONTEXT
----------------------------------------
- You are mentioned with @ai.
- Keep answers conversational and balanced.
- Remember previous messages (Memory is enabled).
- If something is unclear, ask for clarification.

----------------------------------------
🚫 RESTRICTIONS
----------------------------------------
- Do not say "As an AI model..."
- Do not provide false info.
- Do not overcomplicate answers.
- Do not ignore user intent.`;
}
