import React, { useEffect, useState } from 'react'
import images from '~/assets/images';
import styles from './UserInfo.module.scss';
import classNames from 'classnames/bind';
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

function UserInfo() {
    const [user, setUser] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [viewedJobs, setViewedJobs] = useState([]);

    const fetchUserData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const [userResponse, appliedJobsResponse, savedJobsResponse, viewedJobsResponse] = await Promise.all([
                authAPI().get(userApis.getCurrentUser),
                authAPI().get(userApis.getAllAppliedJobsByUser),
                authAPI().get(userApis.getAllSavedJobsByUser),
                authAPI().get(userApis.getAllViewedJobsByUser),
            ]);
            setUser(userResponse.data.user);
            setAppliedJobs(appliedJobsResponse.data.appliedJobs);
            setSavedJobs(savedJobsResponse.data.savedJobs);
            setViewedJobs(viewedJobsResponse.data.viewedJobs);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchUserData();
    }, []);

    // Thêm một useEffect để lắng nghe sự kiện cập nhật
    useEffect(() => {
        // Lắng nghe sự kiện cập nhật từ các components khác
        const handleDataUpdate = () => {
            fetchUserData();
        };

        window.addEventListener('user-data-update', handleDataUpdate);

        return () => {
            window.removeEventListener('user-data-update', handleDataUpdate);
        };
    }, []);

    return (
        <div>
            <div className={cx('user-info')}>
                <div className={cx('user-card')}>
                    <img src={user?.avatar || images.avatar} alt="Avatar" className={cx('avatar')} />
                    <h3>{user?.name || "Vĩ Nguyễn Đức"}</h3>
                    <p className={cx('user-title')}>Frontend Developer</p>
                    <div className={cx('user-stats')}>
                        <div className={cx('stat-item')}>
                            <i className="fas fa-eye"></i>
                            <span>Đã xem: {viewedJobs.length}</span>
                        </div>
                        <div className={cx('stat-item')}>
                            <i className="fas fa-paper-plane"></i>
                            <span>Đã lưu: {savedJobs.length}</span>
                        </div>
                        <div className={cx('stat-item')}>
                            <i className="fas fa-bookmark"></i>
                            <span>Đã ứng tuyển: {appliedJobs.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserInfo;
