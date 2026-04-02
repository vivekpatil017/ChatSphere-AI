# 🚀 AI + Real-Time Chat Application

## 📌 Overview

This is a **real-time chat application** that allows users to communicate with **friends and AI in the same platform**.

The app is designed around the concept of **projects (chat spaces)**, where users can collaborate, chat, and interact with AI for help, discussions, and problem-solving.

---

## ✨ Key Features

### 👥 Project-Based Chat

* Users must create a **project** to start chatting
* Each project acts like a **group chat workspace**
* Users can invite and add friends to the project

---

### 💬 Real-Time Messaging

* Instant messaging between project members
* Group conversations with all added friends
* Seamless communication using real-time technology

---

### 🤖 AI Integration

* Chat with AI inside the project
* Ask questions, clear doubts, and get instant responses
* AI assists all members in the project

---

### 🔄 Multi-User Collaboration

* Multiple users can join the same project
* All members can:

  * Chat with each other
  * Interact with AI
* Each user can create their own projects and invite others

---

## 🧠 How It Works

1. User creates a **project**
2. Adds friends to the project
3. Starts chatting in real-time
4. Uses AI within the chat for:

   * Asking questions
   * Getting explanations
   * Solving problems

---

## 🛠️ Tech Stack (Example)

* Frontend: React
* Backend: Node.js + Express
* Real-time: Socket.IO
* Database: MongoDB
* AI: OpenAI API / Gemini

---

## 🎯 Purpose

This application combines **human communication and AI assistance** into a single collaborative platform, making conversations smarter and more productive.

---

## 🔥 Future Enhancements

* AI message suggestions
* Voice chat integration
* Smart notifications
* Advanced project management

---

## 💡 Summary

👉 A platform where users can **create projects, chat with friends, and interact with AI — all in one place.**

---

# 🚀 AI Chat App: The Intelligent Developer Workspace

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

An advanced AI-powered real-time chat application designed for modern developer teams. It combines the seamless collaboration of Slack with a high-performance AI assistant that thinks like a Senior Software Engineer.

---

## ✨ Cutting-Edge Features

### 🧠 Senior Developer AI Integration
- **Context-Aware Memory**: The AI remembers entire conversation threads during a project session. No more re-explaining the same context!
- **Real-time Streaming**: Watch the AI "think" and "type" word-by-word with high-fidelity streaming responses.
- **Structured Solutions**: AI provides full project overviews, folder structures, setup steps, and production-ready code.

### 📁 Virtual File Explorer
- AI-suggested project architectures are automatically parsed and displayed in a **Virtual File Tree** in the project sidebar. Explore your next project ideas before you even write a line of code.

### 🎭 Cinematic UI/UX
- **3D Perspective Design**: Interactive 3D tilt effects on project cards for a premium, tactile experience.
- **Modern Dark Aesthetic**: A sleek, dark-themed interface built with Tailwind CSS, optimized for long developer sessions.
- **Smart Guidance**: Dynamic rotating placeholders and pulsing indicators teach users how to interact with the AI assistant effortlessly.

### ⚡ Real-Time Collaboration
- **Encrypted Messaging**: Secure real-time chat powered by Socket.io.
- **Connection Health**: Real-time status indicators (Connected/Reconnecting) and member activity tracking.
- **Global Search**: Instantly find specific code or discussions using the integrated project-wide search.

---

## 🛠️ Technology Stack

| Role | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Remix Icons, Framer Motion (Simulation) |
| **Backend** | Node.js, Express, Socket.io |
| **Database** | MongoDB Atlas (Mongoose), Redis (ioredis) |
| **AI Engine** | Google Generative AI (Gemini 2.5 Flash) |
| **Styling** | Vanilla CSS, Glassmorphism, 3D Transforms |

---

## 📂 Project Architecture

```text
├── backend/
│   ├── controllers/    # API Request Handlers
│   ├── models/         # Mongoose Schemas (User, Project)
│   ├── services/       # Business Logic (AI Service, Socket logic)
│   ├── routers/        # Express Routes
│   ├── db/             # Database Connection
│   └── server.js       # Entry Point & Socket Configuration
│
├── frontend/
│   ├── src/
│   │   ├── pages/      # Home, Project, Login, Register
│   │   ├── context/    # Global State (UserContext)
│   │   ├── config/     # Axios and Socket Instances
│   │   └── components/ # Reusable UI Components
│   └── public/         # Static Assets
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js installed on your system.
- MongoDB Atlas account for the database.
- Redis Cloud or local Redis instance.
- Google AI API Key (Get it at [aistudio.google.com](https://aistudio.google.com/)).

### 1. Clone & Configure Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder based on `.env.example`:
```env
PORT=3000
MONGODB_URI=your_uri
JWT_SECRET=your_secret
REDIS_HOST=your_host
REDIS_PORT=your_port
REDIS_PASSWORD=your_password
Google_AI_Key=your_gemini_key
```

### 2. Configure Frontend
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` folder:
```text
VITE_API_URL=http://localhost:3000
```

### 3. Start the Engines
**Run Backend:**
```bash
npm run dev
```
**Run Frontend:**
```bash
npm run dev
```

---

## 🚀 How to Chat with AI
Simply mention **@ai** in your message to trigger the assistant.
Example:
- `@ai Create a basic Express server with login routes.`
- `@ai My name is Vivek. What project are we building right now?` (Demonstrates Memory)

---

## 🔒 Security & Secrets
> [!IMPORTANT]
> Never commit your `.env` files to version control. The project includes a root-level `.gitignore` that handles this automatically. Use the provided `.env.example` files to share the configuration requirements with your team.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](file:///c:/Users/vivek/OneDrive/Desktop/AI%20chat%20App/LICENSE) file for details.

---

### Developed with 💻 and 🦾 for modern dev teams.

