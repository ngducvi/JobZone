import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./ViewedJob.module.scss";
import { authAPI, userApis } from "~/utils/api";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";

const cx = classNames.bind(styles);

const ViewdJob = () => {
  const [viewdJobs, setviewdJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await authAPI().get(userApis.getAllViewedJobsByUser, {
          params: { page: currentPage },
        });
        setviewdJobs(response.data.viewedJobs);
        setTotalPages(response.data.totalPages);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentPage]);

  return (
    <div className={cx("wrapper")}>
      {/* Header */}
      <div className={cx("header")}>
        <h1>Việc làm đã Xem</h1>
      </div>

      <div className={cx("main-content")}>
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
                <span>Đã lưu: {savedJobs.length}</span>
              </div>
              <div className={cx('stat-item')}>
                <i className="fas fa-paper-plane"></i>
                <span>Đã ứng tuyển: 5</span>
              </div>
            </div>
          </div>
        </div> */}

        {/* Right Column - Saved Jobs */}
        <div className={cx("saved-jobs")}>
          <div className={cx("filter-bar")}>
            <div className={cx("total-jobs")}>
              Tìm thấy <span>{viewdJobs.length}</span> việc làm
            </div>
            <div className={cx("sort-options")}>
              <select className={cx("sort-select")}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="salary">Lương cao nhất</option>
              </select>
            </div>
          </div>

          <div className={cx("job-list")}>
            {viewdJobs.map((job) => (
             <div key={job.id} className={cx('job-card')}>
             <div className={cx('job-header')}>
               <img src={job.company_logo || images.company_1} alt={job.company_name} />
               <div className={cx('job-title')}>
                 <h3>{job.job.title || "Frontend Developer"}</h3>
                 <p>{job.company_name || "Công ty ABC"}</p>
               </div>
               <button className={cx('unsave-btn')}>
                 <i className="fas fa-bookmark"></i>
               </button>
             </div>
             <div className={cx('job-info')}>
               <div className={cx('info-item')}>
                 <i className="fas fa-money-bill"></i>
                 <span>{job.job.salary || "15-20 triệu"}</span>
               </div>
               <div className={cx('info-item')}>
                 <i className="fas fa-map-marker-alt"></i>
                 <span>{job.job.location || "Hồ Chí Minh"}</span>
               </div>
               <div className={cx('info-item')}>
                 <i className="far fa-clock"></i>
                 <span>Còn {job.job.deadline ? Math.max(0, Math.ceil((new Date(job.job.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : 25} ngày để ứng tuyển</span>
               </div>
             </div>
             <div className={cx('job-actions')}>
               <button className={cx('apply-btn')}>Ứng tuyển ngay</button>
             </div>
           </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewdJob;
