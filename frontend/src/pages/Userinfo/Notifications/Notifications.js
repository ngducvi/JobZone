// page notifications
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Notifications.module.scss';
import { userApis, authAPI } from '~/utils/api';
import socketService from '~/utils/socket';
import { toast } from 'react-hot-toast';
import { useNotification } from '~/context/NotificationContext';
import { FaBell, FaEnvelope, FaCommentAlt, FaCheck, FaTrash } from 'react-icons/fa';

const cx = classNames.bind(styles);

const defaultSettings = {
    jobAlerts: true,
    messages: true,
    promotions: false,
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const { updateUnreadCount } = useNotification();

    useEffect(() => {
        fetchNotifications();
        fetchCurrentUser();

        return () => {
            socketService.disconnect();
        };
    }, [page]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await authAPI().get(userApis.getUserNotifications, {
                params: { page, limit: 10 }
            });
            
            if (response.data.success) {
                const { rows, count, currentPage, totalPages } = response.data.data;
                setNotifications(prev => page === 1 ? rows : [...prev, ...rows]);
                setHasMore(currentPage < totalPages);
            } else {
                setError(response.data.message || 'Không thể tải thông báo');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải thông báo. Vui lòng thử lại sau.');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI().get(userApis.getCurrentUser);
            setCurrentUser(response.data.user);
            
            const token = localStorage.getItem('token');
            socketService.connect(token);
            socketService.joinUserRoom(response.data.user.id);
            
            socketService.onNewNotification((newNotification) => {
                setNotifications(prev => {
                    const exists = prev.some(noti => noti.id === newNotification.id);
                    if (!exists) {
                        return [newNotification, ...prev];
                    }
                    return prev;
                });
                toast.success('Bạn có thông báo mới!');
            });
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const handleToggle = async (key) => {
        try {
            // TODO: Implement API call to update notification settings
            setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
        } catch (err) {
            console.error('Error updating notification settings:', err);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await authAPI().patch(userApis.markNotificationAsRead(notificationId));
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, is_read: true }
                            : notification
                    )
                );
                // Cập nhật số lượng thông báo chưa đọc
                const unreadCount = notifications.filter(n => !n.is_read).length - 1;
                updateUnreadCount(unreadCount);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const response = await authAPI().patch(userApis.markAllNotificationsAsRead);
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, is_read: true }))
                );
                updateUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await authAPI().delete(userApis.deleteNotification(notificationId));
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(noti => noti.id !== notificationId));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const deleteAllRead = async () => {
        try {
            const response = await authAPI().delete(userApis.deleteAllReadNotifications);
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(noti => !noti.is_read));
            }
        } catch (err) {
            console.error('Error deleting all read notifications:', err);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Thông báo</h1>
                    <p className={cx('subtitle')}>Quản lý thông báo và cài đặt nhận thông báo của bạn</p>
                </div>

                <div className={cx('content-grid')}>
                    <div className={cx('settings-section')}>
                        <h2 className={cx('section-title')}>
                            <FaBell className={cx('icon')} />
                            Cài đặt thông báo
                        </h2>
                        <div className={cx('settings-list')}>
                            <div className={cx('setting-item')}>
                                <span>
                                    <FaEnvelope className={cx('icon')} />
                                    Thông báo việc làm
                                </span>
                                <label className={cx('switch')}>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.jobAlerts} 
                                        onChange={() => handleToggle('jobAlerts')} 
                                    />
                                    <span className={cx('slider')}></span>
                                </label>
                            </div>
                            <div className={cx('setting-item')}>
                                <span>
                                    <FaCommentAlt className={cx('icon')} />
                                    Thông báo tin nhắn
                                </span>
                                <label className={cx('switch')}>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.messages} 
                                        onChange={() => handleToggle('messages')} 
                                    />
                                    <span className={cx('slider')}></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={cx('notifications-section')}>
                        <div className={cx('section-header')}>
                            <h2 className={cx('section-title')}>Danh sách thông báo</h2>
                            <div className={cx('action-buttons')}>
                                <button 
                                    className={cx('mark-all-read')}
                                    onClick={markAllAsRead}
                                    disabled={notifications.every(noti => noti.is_read)}
                                >
                                    <FaCheck className={cx('icon')} />
                                    Đánh dấu đã đọc
                                </button>
                                <button 
                                    className={cx('delete-read')}
                                    onClick={deleteAllRead}
                                    disabled={notifications.every(noti => !noti.is_read)}
                                >
                                    <FaTrash className={cx('icon')} />
                                    Xóa đã đọc
                                </button>
                            </div>
                        </div>

                        {error ? (
                            <div className={cx('error-message')}>
                                <FaBell className={cx('icon')} />
                                {error}
                            </div>
                        ) : notifications.length > 0 ? (
                            <>
                                <div className={cx('notifications-list')}>
                                    {notifications.map((noti) => (
                                        <div 
                                            key={noti.id} 
                                            className={cx('notification-card', { read: noti.is_read })}
                                        >
                                            <div 
                                                className={cx('notification-content')}
                                                onClick={() => !noti.is_read && markAsRead(noti.id)}
                                            >
                                                <div className={cx('notification-header')}>
                                                    <h3 className={cx('notification-title')}>{noti.title}</h3>
                                                    <span className={cx('notification-date')}>
                                                        {new Date(noti.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <div className={cx('notification-body')}>{noti.content}</div>
                                            </div>
                                            <button 
                                                className={cx('delete-button')}
                                                onClick={() => deleteNotification(noti.id)}
                                                title="Xóa thông báo"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {hasMore && (
                                    <button 
                                        className={cx('load-more')}
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tải...' : 'Tải thêm thông báo'}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className={cx('no-notifications')}>
                                <FaBell size={24} color="#666" />
                                <p>Bạn chưa có thông báo nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
