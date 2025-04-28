import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, recruiterApis, userApis } from '~/utils/api';
import socketService from '~/utils/socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return null;
            }

            // Check if user is recruiter
            try {
                const response = await authAPI().get(recruiterApis.getCurrentUser);
                if (response.data.code === 1) {
                    setUser(response.data.user);
                    return response.data.user;
                }
            } catch (recruiterError) {
                // If recruiter endpoint fails, try user endpoint
                try {
                    const userResponse = await authAPI().get(userApis.getCurrentUser);
                    if (userResponse.data.code === 1) {
                        setUser(userResponse.data.user);
                        return userResponse.data.user;
                    }
                } catch (userError) {
                    console.error('Error fetching user:', userError);
                    setError('Failed to fetch user information');
                    return null;
                }
            }
        } catch (error) {
            console.error('Error in fetchCurrentUser:', error);
            setError('Authentication error');
            return null;
        }
    };

    const setupSocketConnection = async () => {
        try {
            const currentUser = await fetchCurrentUser();
            if (!currentUser) {
                console.log('No current user found, skipping socket connection');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, skipping socket connection');
                return;
            }

            // Connect socket and join user room
            socketService.connect(token);
            socketService.joinUserRoom(currentUser.id);
            
            // Set up new notification listener
            socketService.onNewNotification((newNotification) => {
                setUnreadCount(prev => prev + 1);
            });

            // Get socket instance after connection is established
            const socketInstance = socketService.socket;
            if (socketInstance) {
                setSocket(socketInstance);
            }
        } catch (error) {
            console.error('Error setting up socket connection:', error);
            setError('Failed to setup socket connection');
        }
    };

    useEffect(() => {
        setupSocketConnection();

        return () => {
            if (socketService.socket) {
                socketService.disconnect();
            }
        };
    }, []);

    const updateUnreadCount = (newCount) => {
        setUnreadCount(newCount);
    };

    return (
        <NotificationContext.Provider value={{ unreadCount, updateUnreadCount, socket, user, error }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 