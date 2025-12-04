const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Serve the main page for root and any room ID
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        
        rooms.get(roomId).add(socket.id);
        
        // Notify others in the room
        socket.to(roomId).emit('user-connected', socket.id);
        
        console.log(`User ${socket.id} joined room ${roomId}`);
        console.log(`Room ${roomId} now has ${rooms.get(roomId).size} users`);
    });

    socket.on('offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('offer', { offer, userId: socket.id });
    });

    socket.on('answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('answer', { answer, userId: socket.id });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', { candidate, userId: socket.id });
    });

    socket.on('leave-room', (roomId) => {
        leaveRoom(socket, roomId);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from all rooms
        rooms.forEach((users, roomId) => {
            if (users.has(socket.id)) {
                leaveRoom(socket, roomId);
            }
        });
    });

    function leaveRoom(socket, roomId) {
        socket.leave(roomId);
        
        if (rooms.has(roomId)) {
            rooms.get(roomId).delete(socket.id);
            
            if (rooms.get(roomId).size === 0) {
                rooms.delete(roomId);
            } else {
                socket.to(roomId).emit('user-disconnected', socket.id);
            }
        }
        
        console.log(`User ${socket.id} left room ${roomId}`);
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});