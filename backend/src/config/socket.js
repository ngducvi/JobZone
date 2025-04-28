const { Server } = require('socket.io');
const http = require('http');

let io = null;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3001',
                'http://localhost:5173',
                'http://localhost:3002',
                'http://localhost:3000',
                'http://0.0.0.0:3000',
                'http://192.168.10.228:3000',
                'https://kldr50z4-3000.asse.devtunnels.ms',
                'https://ss0x2xqz-3000.asse.devtunnels.ms',
            ],
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
}

module.exports = {
    initializeSocket,
    getIO
}; 