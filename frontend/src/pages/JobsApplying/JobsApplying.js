import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./JobsApplying.module.scss";
import { authAPI, userApis } from "~/utils/api";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";

const cx = classNames.bind(styles);

const JobsApplying = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await authAPI().get(userApis.getAllAppliedJobsByUser, {
          params: { page: currentPage },
        });
        setAppliedJobs(response.data.appliedJobs);
        setTotalPages(response.data.totalPages);
        console.log(response.data.appliedJobs);   
      
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentPage]);

  return (
    <div className={cx('wrapper')}>
      {/* Header */}
      <div className={cx('header')}>
        <h1>Việc làm đã ứng tuyển</h1>
        <p>Xem lại danh sách những việc làm mà bạn đã ứng tuyển. Theo dõi trạng thái ứng tuyển và phản hồi từ nhà tuyển dụng.</p>
      </div>

      <div className={cx('main-content')}>
        {/* Left Column - User Info */}
        <UserInfo />
        {/* <div className={cx('user-info')}>
          <div className={cx('user-card')}>
            <img src={user?.avatar || images.avatar} alt="Avatar" className={cx('avatar')} />
            <h3>{user?.name || "Vĩ Nguyễn Đức"}</h3>
            <p className={cx('user-title')}>Frontend Developer</p>
            <div className={cx('user-stats')}>
              <div className={cx('stat-item')}>
                <i className="fas fa-eye"></i>
                <span>Đã xem: 12</span>
              </div>
              <div className={cx('stat-item')}>
                <i className="fas fa-bookmark"></i>
                <span>Đã ứng tuyển: {appliedJobs.length}</span>
              </div>
              <div className={cx('stat-item')}>
                <i className="fas fa-paper-plane"></i>
                <span>Đã ứng tuyển: {appliedJobs.length}</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Right Column - Saved Jobs */}
        <div className={cx('saved-jobs')}>
          <div className={cx('filter-bar')}>
            <div className={cx('total-jobs')}>
              Tìm thấy <span>{appliedJobs.length}</span> việc làm
            </div>
            <div className={cx('sort-options')}>
              <select className={cx('sort-select')}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="salary">Lương cao nhất</option>
              </select>
            </div>
          </div>

          <div className={cx('job-list')}>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsApplying;
