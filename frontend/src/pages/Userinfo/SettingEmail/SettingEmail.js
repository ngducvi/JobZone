// page setting email
import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './SettingEmail.module.scss';
import { FaEnvelope, FaBell, FaCheck } from 'react-icons/fa';

const cx = classNames.bind(styles);

const SettingEmail = () => {
    const [emailSettings, setEmailSettings] = useState({
        email: '',
        jobAlerts: true,
        applicationUpdates: true,
        companyNews: false,
        marketingEmails: false
    });

    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Fetch current email settings
        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                // TODO: Replace with actual API call
                // const response = await api.getEmailSettings();
                // setEmailSettings(response.data);
            } catch (error) {
                setErrorMessage('Không thể tải cài đặt email. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleToggle = (setting) => {
        setEmailSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            // TODO: Replace with actual API call
            // await api.updateEmailSettings(emailSettings);
            setSuccessMessage('Cài đặt email đã được cập nhật thành công!');
        } catch (error) {
            setErrorMessage('Có lỗi xảy ra khi cập nhật cài đặt. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Cài đặt Email</h1>
                    <p className={cx('subtitle')}>
                        Quản lý cài đặt email và tùy chọn thông báo
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={cx('form')}>
                    <div className={cx('form-group')}>
                        <label className={cx('label')}>
                            <FaEnvelope className={cx('icon')} />
                            Địa chỉ Email
                        </label>
                        <input
                            type="email"
                            value={emailSettings.email}
                            onChange={(e) => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                            className={cx('input')}
                            placeholder="Nhập địa chỉ email của bạn"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={cx('settings-group')}>
                        <h2 className={cx('settings-title')}>
                            <FaBell className={cx('icon')} />
                            Tùy chọn thông báo
                        </h2>
                        
                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h3 className={cx('setting-name')}>Thông báo việc làm mới</h3>
                                <p className={cx('setting-description')}>
                                    Nhận thông báo về các công việc phù hợp với hồ sơ của bạn
                                </p>
                            </div>
                            <label className={cx('toggle')}>
                                <input
                                    type="checkbox"
                                    checked={emailSettings.jobAlerts}
                                    onChange={() => handleToggle('jobAlerts')}
                                    disabled={isLoading}
                                />
                                <span className={cx('slider')}></span>
                            </label>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h3 className={cx('setting-name')}>Cập nhật đơn ứng tuyển</h3>
                                <p className={cx('setting-description')}>
                                    Nhận thông báo về trạng thái đơn ứng tuyển của bạn
                                </p>
                            </div>
                            <label className={cx('toggle')}>
                                <input
                                    type="checkbox"
                                    checked={emailSettings.applicationUpdates}
                                    onChange={() => handleToggle('applicationUpdates')}
                                    disabled={isLoading}
                                />
                                <span className={cx('slider')}></span>
                            </label>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h3 className={cx('setting-name')}>Tin tức từ công ty</h3>
                                <p className={cx('setting-description')}>
                                    Nhận thông tin về các công ty bạn đang theo dõi
                                </p>
                            </div>
                            <label className={cx('toggle')}>
                                <input
                                    type="checkbox"
                                    checked={emailSettings.companyNews}
                                    onChange={() => handleToggle('companyNews')}
                                    disabled={isLoading}
                                />
                                <span className={cx('slider')}></span>
                            </label>
                        </div>

                        <div className={cx('setting-item')}>
                            <div className={cx('setting-info')}>
                                <h3 className={cx('setting-name')}>Email tiếp thị</h3>
                                <p className={cx('setting-description')}>
                                    Nhận thông tin về các chương trình khuyến mãi và ưu đãi
                                </p>
                            </div>
                            <label className={cx('toggle')}>
                                <input
                                    type="checkbox"
                                    checked={emailSettings.marketingEmails}
                                    onChange={() => handleToggle('marketingEmails')}
                                    disabled={isLoading}
                                />
                                <span className={cx('slider')}></span>
                            </label>
                        </div>
                    </div>

                    <div className={cx('button-group')}>
                        <button
                            type="submit"
                            className={cx('save-button')}
                            disabled={isLoading}
                        >
                            <FaCheck className={cx('button-icon')} />
                            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>

                    {successMessage && (
                        <div className={cx('success-message')}>
                            <FaCheck className={cx('message-icon')} />
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className={cx('error-message')}>
                            <FaBell className={cx('message-icon')} />
                            {errorMessage}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SettingEmail;
