import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8080';

class SocketService {
    constructor() {
        this.socket = null;
        this.typingTimeout = null;
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

    joinConversation(conversationId) {
        if (this.socket) {
            this.socket.emit('join_conversation', conversationId);
        }
    }

    leaveConversation(conversationId) {
        if (this.socket) {
            this.socket.emit('leave_conversation', conversationId);
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onMessageUpdated(callback) {
        if (this.socket) {
            this.socket.on('message_updated', callback);
        }
    }

    onMessageDeleted(callback) {
        if (this.socket) {
            this.socket.on('message_deleted', callback);
        }
    }

    onNewConversation(callback) {
        if (this.socket) {
            this.socket.on('new_conversation', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    onMessagesRead(callback) {
        if (this.socket) {
            this.socket.on('messages_read', callback);
        }
    }

    onNewNotification(callback) {
        if (this.socket) {
            this.socket.on('new_notification', callback);
        }
    }

    emitTyping(conversationId, userId, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { conversationId, userId, isTyping });
        }
    }

    emitMarkAsRead(conversationId, userId) {
        if (this.socket) {
            this.socket.emit('mark_as_read', { conversationId, userId });
        }
    }

    // Helper method to handle typing status with debounce
    handleTyping(conversationId, userId, isTyping) {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }

        this.emitTyping(conversationId, userId, isTyping);

        if (isTyping) {
            this.typingTimeout = setTimeout(() => {
                this.emitTyping(conversationId, userId, false);
            }, 3000);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService(); 