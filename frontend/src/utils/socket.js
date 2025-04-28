import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        this.socket = io(SOCKET_URL, {
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });
    }

    joinUserRoom(userId) {
        if (this.socket) {
            this.socket.emit('join', userId);
        }
    }

    onNewNotification(callback) {
        if (this.socket) {
            this.socket.on('new_notification', callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService(); 