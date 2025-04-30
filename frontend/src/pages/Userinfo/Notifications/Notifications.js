// page notifications
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Notifications.module.scss';
import { userApis, authAPI } from '~/utils/api';
import socketService from '~/utils/socket';
import { toast } from 'react-hot-toast';
import { useNotification } from '~/context/NotificationContext';
import { FaBell, FaEnvelope, FaCommentAlt, FaCheck, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const cx = classNames.bind(styles);

const defaultSettings = {
    is_notification: true,
    is_message: true,
};

const ITEMS_PER_PAGE = 4;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const { updateUnreadCount, notificationSettings, setNotificationSettings } = useNotification();

    // Tính toán tổng số trang
    const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);

    // Lấy notifications cho trang hiện tại
    const getCurrentPageNotifications = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return notifications.slice(startIndex, endIndex);
    };

    // Tạo mảng số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    useEffect(() => {
        fetchNotifications();
        fetchCurrentUser();
        fetchNotificationSettings();

        return () => {
            socketService.disconnect();
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await authAPI().get(userApis.getUserNotifications);
            const candidateResponse = await authAPI().get(userApis.getCandidateNotification);
            console.log("candidateResponse",candidateResponse.data.data);
            
            if (response.data.success) {
                setNotifications(response.data.data.rows);
                setHasMore(response.data.data.currentPage < response.data.data.totalPages);
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

    const handleToggle = async (key) => {
        try {
            const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
            const response = await authAPI().patch(userApis.updateCandidateNotification, {
                is_notification: newSettings.is_notification,
                is_message: newSettings.is_message
            });
            
            if (response.data.success) {
                setNotificationSettings(newSettings);
                toast.success('Cập nhật cài đặt thông báo thành công');
            } else {
                toast.error('Cập nhật cài đặt thông báo thất bại');
            }
        } catch (err) {
            console.error('Error updating notification settings:', err);
            toast.error('Có lỗi xảy ra khi cập nhật cài đặt thông báo');
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setCurrentPage(prev => prev + 1);
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
                                    Thông báo hệ thống
                                </span>
                                <label className={cx('switch')}>
                                    <input 
                                        type="checkbox" 
                                        checked={notificationSettings.is_notification} 
                                        onChange={() => handleToggle('is_notification')} 
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
                                        checked={notificationSettings.is_message} 
                                        onChange={() => handleToggle('is_message')} 
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
                                    {getCurrentPageNotifications().map((noti) => (
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

                                {totalPages > 1 && (
                                    <div className={cx('pagination')}>
                                        <button
                                            className={cx('page-btn', 'nav')}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <FaChevronLeft className={cx('icon')} />
                                            Trước
                                        </button>

                                        {getPageNumbers().map(pageNum => (
                                            <button
                                                key={pageNum}
                                                className={cx('page-btn', { active: currentPage === pageNum })}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}

                                        <button
                                            className={cx('page-btn', 'nav')}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Sau
                                            <FaChevronRight className={cx('icon')} />
                                        </button>
                                    </div>
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
