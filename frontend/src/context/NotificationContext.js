import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, recruiterApis, userApis } from '~/utils/api';
import socketService from '~/utils/socket';
import { toast } from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [notificationSettings, setNotificationSettings] = useState({
        is_notification: true,
        is_message: true
    });

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found');
                return null;
            }

            // Check if user is recruiter
            try {
                const response = await authAPI().get(userApis.getCurrentUser);
                // console.log("response",response.data);
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

    const fetchNotificationSettings = async () => {
        try {
            const response = await authAPI().get(userApis.getCandidateNotification);
            if (response.data.success) {
                setNotificationSettings({
                    is_notification: response.data.data.is_notification,
                    is_message: response.data.data.is_message
                });
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error);
        }
    };

    const showNotificationToast = (notification) => {
        // Check if it's a system notification and if system notifications are disabled
        if (notification.type === 'system' && !notificationSettings.is_notification) {
            return;
        }
        
        // Check if it's a message notification and if message notifications are disabled
        if (notification.type === 'message' && !notificationSettings.is_message) {
            return;
        }

        const toastId = `notification-${Date.now()}`;
        
        toast.custom(
            (t) => (
                <div
                    className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                    max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto 
                    flex flex-col ring-1 ring-black ring-opacity-5`}
                    style={{
                        padding: '16px',
                        borderLeft: '4px solid #02a346',
                        marginBottom: '16px'
                    }}
                >
                    <div className="flex items-start">
                        <div className="flex-1">
                            <h3 style={{ 
                                fontSize: '16px', 
                                fontWeight: '600',
                                color: '#013a74',
                                marginBottom: '8px'
                            }}>
                                {notification.title || 'Thông báo mới'}
                            </h3>
                            <p style={{ 
                                fontSize: '14px',
                                color: '#333',
                                lineHeight: '1.5'
                            }}>
                                {notification.content}
                            </p>
                        </div>
                        <button
                            onClick={() => toast.dismiss(toastId)}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: '4px',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            ),
            {
                id: toastId,
                duration: 5000,
                position: 'top-right'
            }
        );
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

            // Fetch notification settings before setting up socket
            await fetchNotificationSettings();

            // Connect socket and join user room
            if (!socketService.socket) {
                socketService.connect(token);
            }
            socketService.joinUserRoom(currentUser.id);
            
            // Set up new notification listener
            socketService.onNewNotification((newNotification) => {
                console.log('New notification received:', newNotification);
                setUnreadCount(prev => prev + 1);
                showNotificationToast(newNotification);
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
            // Don't disconnect socket here as it might be used by other features
            // Just remove the notification listener
            if (socketService.socket) {
                socketService.socket.off('new_notification');
            }
        };
    }, []);

    const updateUnreadCount = (newCount) => {
        setUnreadCount(newCount);
    };

    return (
        <NotificationContext.Provider value={{ 
            unreadCount, 
            updateUnreadCount, 
            socket, 
            user, 
            error,
            showNotificationToast,
            notificationSettings,
            setNotificationSettings
        }}>
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