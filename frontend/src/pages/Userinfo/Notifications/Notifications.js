// page notifications
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Notifications.module.scss';

const cx = classNames.bind(styles);

const sampleNotifications = [
    { id: 1, title: 'Công việc mới phù hợp', content: 'Có 3 công việc mới phù hợp với hồ sơ của bạn.', date: '2024-06-01', read: false },
    { id: 2, title: 'Cập nhật hồ sơ', content: 'Hồ sơ của bạn đã được duyệt.', date: '2024-05-30', read: true },
    { id: 3, title: 'Tin nhắn mới', content: 'Bạn có 1 tin nhắn mới từ nhà tuyển dụng.', date: '2024-05-28', read: false },
];

const defaultSettings = {
    jobAlerts: true,
    messages: true,
    promotions: false,
};

const Notifications = () => {
    const [notifications, setNotifications] = useState(sampleNotifications);
    const [settings, setSettings] = useState(defaultSettings);

    const handleToggle = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Thông báo</h1>
                <p className={cx('subtitle')}>Quản lý thông báo và cài đặt nhận thông báo của bạn</p>
            </div>

            <div className={cx('settings-section')}>
                <h2 className={cx('section-title')}>Cài đặt nhận thông báo</h2>
                <div className={cx('settings-list')}>
                    <div className={cx('setting-item')}>
                        <span>Nhận thông báo việc làm mới</span>
                        <label className={cx('switch')}>
                            <input type="checkbox" checked={settings.jobAlerts} onChange={() => handleToggle('jobAlerts')} />
                            <span className={cx('slider')}></span>
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <span>Nhận thông báo tin nhắn</span>
                        <label className={cx('switch')}>
                            <input type="checkbox" checked={settings.messages} onChange={() => handleToggle('messages')} />
                            <span className={cx('slider')}></span>
                        </label>
                    </div>
                    <div className={cx('setting-item')}>
                        <span>Nhận thông báo khuyến mãi</span>
                        <label className={cx('switch')}>
                            <input type="checkbox" checked={settings.promotions} onChange={() => handleToggle('promotions')} />
                            <span className={cx('slider')}></span>
                        </label>
                    </div>
                </div>
            </div>

            <div className={cx('notifications-section')}>
                <h2 className={cx('section-title')}>Danh sách thông báo</h2>
                {notifications.length > 0 ? (
                    <div className={cx('notifications-list')}>
                        {notifications.map((noti) => (
                            <div key={noti.id} className={cx('notification-card', { read: noti.read })}>
                                <div className={cx('notification-header')}>
                                    <h3 className={cx('notification-title')}>{noti.title}</h3>
                                    <span className={cx('notification-date')}>{noti.date}</span>
                                </div>
                                <div className={cx('notification-content')}>{noti.content}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={cx('no-notifications')}>
                        <p>Bạn chưa có thông báo nào</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
