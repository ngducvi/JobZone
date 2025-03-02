import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./ViewedJob.module.scss";
import { authAPI, userApis } from "~/utils/api";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const ViewdJob = () => {
  const [viewdJobs, setviewdJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedStatus, setSavedStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [viewedResponse, savedResponse] = await Promise.all([
          authAPI().get(userApis.getAllViewedJobsByUser, {
            params: { page: currentPage },
          }),
          authAPI().get(userApis.getAllSavedJobsByUser)
        ]);

        setviewdJobs(viewedResponse.data.viewedJobs);
        setTotalPages(viewedResponse.data.totalPages);
        console.log(viewedResponse.data.viewedJobs);

        const initialSavedStatus = {};
        savedResponse.data.savedJobs.forEach(job => {
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentPage]);

  // Cập nhật hàm xóa một job
  const handleDeleteViewedJob = async (jobId) => {
    try {
      await authAPI().delete(userApis.deleteViewedJob(jobId));
      setviewdJobs(prev => prev.filter(job => job.job_id !== jobId));
      // Emit sự kiện để cập nhật UserInfo
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error deleting viewed job:", error);
    }
  };

  // Cập nhật hàm xóa tất cả
  const handleClearAllViewedJobs = async () => {
    try {
      await authAPI().delete(userApis.clearViewedJobs);
      setviewdJobs([]);
      // Emit sự kiện để cập nhật UserInfo
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error clearing viewed jobs:", error);
    }
  };

  // Thêm hàm xử lý lưu/hủy lưu job
  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation(); // Ngăn chặn việc chuyển trang
    if (!jobId) {
      console.error('Invalid job ID');
      return;
    }

    try {
      if (savedStatus[jobId]) {
        // Nếu đã lưu thì gọi API hủy lưu
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: false}));
      } else {
        // Nếu chưa lưu thì gọi API lưu
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
      // Emit sự kiện để cập nhật UserInfo
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  // Thêm hàm xử lý click job
  const handleJobClick = async (jobId) => {
    try {
      // Đã có viewed job rồi nên không cần thêm nữa
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error navigating to job detail:", error);
    }
  };

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
            <div className={cx("actions")}>
              <button 
                className={cx("clear-all-btn")}
                onClick={handleClearAllViewedJobs}
              >
                <i className="fas fa-trash-alt"></i>
                Xóa tất cả
              </button>
              <div className={cx("sort-options")}>
                <select className={cx("sort-select")}>
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="salary">Lương cao nhất</option>
                </select>
              </div>
            </div>
          </div>

          <div className={cx("job-list")}>
            {viewdJobs.map((job) => (
             <div key={job.id} className={cx('job-card')} onClick={() => handleJobClick(job.job_id)}>
             <div className={cx('job-header')}>
               <img src={job.company_logo || images.company_1} alt={job.company_name} />
               <div className={cx('job-title')}>
                 <h3>{job.job.title || "Frontend Developer"}</h3>
                 <p>{job.company_name || "Công ty ABC"}</p>
               </div>
               <button 
                 className={cx('save-btn', { saved: savedStatus[job.job_id] })}
                 onClick={(e) => handleSaveJob(e, job.job_id)}
               >
                 <i className="fas fa-bookmark"></i>
                 <span className={cx('default-text')}>
                   {savedStatus[job.job_id] ? 'Đã Lưu' : 'Lưu Tin'}
                 </span>
                 <span className={cx('hover-text')}>
                   {savedStatus[job.job_id] ? 'Hủy Lưu' : 'Lưu Tin'}
                 </span>
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
               <button 
                 className={cx('delete-btn')}
                 onClick={(e) => {
                   e.stopPropagation();
                   handleDeleteViewedJob(job.job_id);
                 }}
               >
                 <i className="fas fa-times"></i>
               </button>
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
