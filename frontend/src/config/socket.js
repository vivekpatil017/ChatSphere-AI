import { io } from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = (projectId) => {
    if (!projectId) return null;

    // Disconnect previous instance if exists to prevent leaks or conflicts
    if (socketInstance) {
        socketInstance.disconnect();
    }

    socketInstance = io(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem("token")
        },
        query: {
            projectId
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    // Log connection errors for debugging
    socketInstance.on('connect_error', (err) => {
        console.error("Socket error:", err.message);
    });

    return socketInstance
} 

export const receiveMessage = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.on(eventName, cb);
    }
}

export const sendMessage = (eventName, data) => {
    if (socketInstance) {
        socketInstance.emit(eventName, data);
    }
}

export const removeListener = (eventName, cb) => {
    if (socketInstance) {
        socketInstance.off(eventName, cb);
    }
}

export const getSocket = () => socketInstance;