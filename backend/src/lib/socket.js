import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173'],
  },
});


export function getReceiverSocketId(userId) {
    return userSocketMap[userId]; // Return the socket ID for the given userId
} 


// Store online users
const userSocketMap = {}; // {userId: socketId}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId; // Assuming userId is sent in the query params

    if(userId) {
        userSocketMap[userId] = socket.id; // Map userId to socketId
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap)); // Emit online users to all clients

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from online users
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap)); // Emit updated online users
    });
})

export { io, app, server }