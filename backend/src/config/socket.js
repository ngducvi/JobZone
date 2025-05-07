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

        // Join user's personal room
        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        // Join conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`User joined conversation ${conversationId}`);
        });

        // Leave conversation room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`User left conversation ${conversationId}`);
        });

        // Handle typing status
        socket.on('typing', ({ conversationId, userId, isTyping }) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId,
                isTyping
            });
        });

        // Handle read status
        socket.on('mark_as_read', ({ conversationId, userId }) => {
            socket.to(`conversation_${conversationId}`).emit('messages_read', {
                userId,
                conversationId
            });
        });

        // Handle notification read status
        socket.on('mark_notification_read', (notificationId) => {
            // Emit to all users in the room that the notification was read
            socket.emit('notification_read', { notificationId });
        });

        // Handle notification settings update
        socket.on('update_notification_settings', (settings) => {
            // Emit to all users in the room that notification settings were updated
            socket.emit('notification_settings_updated', settings);
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