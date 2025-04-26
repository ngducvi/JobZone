import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./SaveJob.module.scss";
import { authAPI, userApis } from "~/utils/api";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const SaveJob = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [savedStatus, setSavedStatus] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await authAPI().get(userApis.getAllSavedJobsByUser);
        setSavedJobs(response.data.savedJobs);
        // console.log('Saved jobs:', response.data.savedJobs);
        const reviewsResponse = await authAPI().get(userApis.getAllReviewsByUserId(1));
        console.log('Reviews:', reviewsResponse.data);
        
        // Khởi tạo trạng thái saved cho mỗi job
        const initialSavedStatus = {};
        response.data.savedJobs.forEach(job => {
          // Sử dụng job_id thay vì job.id
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      }
    };
    fetchSavedJobs();
  }, []);

  const handleSaveJob = async (jobId) => {
    if (!jobId) {
      console.error('Invalid job ID');
      return;
    }

    try {
      if (savedStatus[jobId]) {
        // Nếu đã lưu thì gọi API hủy lưu
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: false}));
        // Cập nhật lại danh sách jobs đã lưu
        setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
      } else {
        // Nếu chưa lưu thì gọi API lưu
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus(prev => ({...prev, [jobId]: true}));
        // Refresh lại danh sách saved jobs
        const response = await authAPI().get(userApis.getAllSavedJobsByUser);
        setSavedJobs(response.data.savedJobs);
      }
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(prev => ({...prev, [jobId]: true}));
      }
    }
  };

  const handleJobClick = async (jobId) => {
    try {
      // Thêm job vào viewed jobs khi click
      await authAPI().post(userApis.addViewedJob(jobId));
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error handling job click:", error);
    }
  };

  return (
    <div className={cx('wrapper')}>
      {/* Header */}
      <div className={cx('header')}>
        <h1>Việc làm đã lưu</h1>
        <p>Xem lại danh sách những việc làm mà bạn đã lưu trước đó. Ứng tuyển ngay để không bỏ lỡ cơ hội nghề nghiệp dành cho bạn.</p>
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
        <div className={cx('saved-jobs')}>
          <div className={cx('filter-bar')}>
            <div className={cx('total-jobs')}>
              Tìm thấy <span>{savedJobs.length}</span> việc làm
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
            {savedJobs.map((savedJob) => (
              <div 
                key={savedJob.job_id} 
                className={cx('job-card')} 
                onClick={() => handleJobClick(savedJob.job_id)}
              >
                <div className={cx('job-header')}>
                  <img 
                    src={savedJob.company_logo || images.company_1} 
                    alt={savedJob.company_name} 
                  />
                  <div className={cx('job-title')}>
                    <h3>{savedJob.job.title || "Frontend Developer"}</h3>
                    <p>{savedJob.company_name || "Công ty ABC"}</p>
                  </div>
                  <button 
                    className={cx('save-button', { 'saved': savedStatus[savedJob.job_id] })}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveJob(savedJob.job_id);
                    }}
                  >
                    <i className={`fa-${savedStatus[savedJob.job_id] ? 'solid' : 'regular'} fa-bookmark`}></i>
                    <span className={cx('default-text')}>
                      {savedStatus[savedJob.job_id] ? 'Đã Lưu' : 'Lưu Tin'}
                    </span>
                    <span className={cx('hover-text')}>Hủy Lưu</span>
                  </button>
                </div>
                <div className={cx('job-info')}>
                  <div className={cx('info-item')}>
                    <i className="fas fa-money-bill"></i>
                    <span>{savedJob.salary || "15-20 triệu"}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{savedJob.location || "Hồ Chí Minh"}</span>
                  </div>
                  <div className={cx('info-item')}>
                    <i className="far fa-clock"></i>
                    <span>
                      Còn {savedJob.deadline 
                        ? Math.max(0, Math.ceil((new Date(savedJob.deadline) - new Date()) / (1000 * 60 * 60 * 24))) 
                        : 25} ngày để ứng tuyển
                    </span>
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

export default SaveJob;
