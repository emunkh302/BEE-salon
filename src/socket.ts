// src/socket.ts
import { Server, Socket } from 'socket.io';

const initializeSocket = (io: Server) => {
    // This function will run every time a new client connects
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);

        // --- Define Socket Event Listeners Here ---

        // Example: Join a room based on user ID
        // A user would emit a 'joinRoom' event after logging in
        socket.on('joinRoom', (userId: string) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined room: ${userId}`);
        });

        // Example: Listen for a private message
        // socket.on('privateMessage', (data) => { ... });


        // Handle client disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};

export default initializeSocket;
