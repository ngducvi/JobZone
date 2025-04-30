// Trang quản lý thông báo cho nhà tuyển dụng

import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../utils/api';
import { recruiterApis } from '../../../utils/api';
import classNames from 'classnames/bind';
import styles from './NotificationsManager.module.scss';
import { format } from 'date-fns/format';
import { vi } from 'date-fns/locale/vi';
import { useNotification } from '~/context/NotificationContext';
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

const NotificationsManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
    const { unreadCount, updateUnreadCount, socket } = useNotification();

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();

        // Listen for new notifications from socket
        if (socket) {
            socket.on('new_notification', (newNotification) => {
                setNotifications(prev => {
                    const exists = prev.some(noti => noti.id === newNotification.id);
                    if (!exists) {
                        return [newNotification, ...prev];
                    }
                    return prev;
                });
                updateUnreadCount(prev => prev + 1);
                toast.success('Bạn có thông báo mới!');
            });
        }

        return () => {
            if (socket) {
                socket.off('new_notification');
            }
        };
    }, [socket]);

    const fetchNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const response = await authAPI().get(recruiterApis.getNotifications, {
                params: { page, limit: 10 }
            });
            if (response.data.code === 1) {
                setNotifications(response.data.notifications);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            setError('Không thể tải thông báo. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await authAPI().get(recruiterApis.getUnreadNotificationsCount);
            if (response.data.code === 1) {
                updateUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const response = await authAPI().put(recruiterApis.markNotificationAsRead(notificationId));
            if (response.data.code === 1) {
                setNotifications(notifications.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, is_read: true }
                        : notification
                ));
                updateUnreadCount(prev => prev - 1);
            }
        } catch (error) {
            setError('Không thể đánh dấu thông báo đã đọc. Vui lòng thử lại sau.');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await authAPI().put(recruiterApis.markAllNotificationsAsRead);
            if (response.data.code === 1) {
                setNotifications(notifications.map(notification => 
                    ({ ...notification, is_read: true })
                ));
                updateUnreadCount(0);
            }
        } catch (error) {
            setError('Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await authAPI().delete(recruiterApis.deleteNotification(notificationId));
            if (response.data.code === 1) {
                const deletedNotification = notifications.find(n => n.id === notificationId);
                if (deletedNotification && !deletedNotification.is_read) {
                    updateUnreadCount(prev => prev - 1);
                }
                setNotifications(notifications.filter(notification => notification.id !== notificationId));
            }
        } catch (error) {
            setError('Không thể xóa thông báo. Vui lòng thử lại sau.');
        }
    };

    const handleDeleteAllRead = async () => {
        try {
            const response = await authAPI().delete(recruiterApis.deleteAllReadNotifications);
            if (response.data.code === 1) {
                setNotifications(notifications.filter(notification => !notification.is_read));
            }
        } catch (error) {
            setError('Không thể xóa tất cả thông báo đã đọc. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className={cx('notifications-container')}>
            <div className={cx('header')}>
                <h1>Quản lý thông báo</h1>
                <div className={cx('actions')}>
                    <button 
                        className={cx('action-button')}
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                    <button 
                        className={cx('action-button', 'delete')}
                        onClick={handleDeleteAllRead}
                        disabled={notifications.every(n => !n.is_read)}
                    >
                        Xóa tất cả đã đọc
                    </button>
                </div>
            </div>

            {error && <div className={cx('error')}>{error}</div>}

            {loading ? (
                <div className={cx('loading')}>Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
                <div className={cx('empty')}>Không có thông báo nào</div>
            ) : (
                <div className={cx('notifications-list')}>
                    {notifications.map(notification => (
                        <div 
                            key={notification.id} 
                            className={cx('notification-item', { unread: !notification.is_read })}
                        >
                            <div className={cx('notification-content')}>
                                <h3>{notification.title}</h3>
                                <p>{notification.content}</p>
                                <span className={cx('timestamp')}>
                                    {format(new Date(notification.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                </span>
                            </div>
                            <div className={cx('notification-actions')}>
                                {!notification.is_read && (
                                    <button 
                                        className={cx('action-button', 'read')}
                                        onClick={() => handleMarkAsRead(notification.id)}
                                    >
                                        Đánh dấu đã đọc
                                    </button>
                                )}
                                <button 
                                    className={cx('action-button', 'delete')}
                                    onClick={() => handleDeleteNotification(notification.id)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={cx('page-button', { active: page === currentPage })}
                            onClick={() => fetchNotifications(page)}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationsManager;
