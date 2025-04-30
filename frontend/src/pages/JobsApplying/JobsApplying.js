import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./JobsApplying.module.scss";
import { authAPI, userApis } from "~/utils/api";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const JobsApplying = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [jobDetails, setJobDetails] = useState({});
  const [filteredJobs, setFilteredJobs] = useState([]);
  const navigate = useNavigate();

  // Cập nhật statusMap với đầy đủ các trạng thái
  const statusMap = {
    'pending': 'Đang xét duyệt',
    'interview-waiting': 'Chờ phỏng vấn',
    'interview-done': 'Đã phỏng vấn',
    'interview-passed': 'Đạt phỏng vấn',
    'received': 'Đã nhận',
    'rejected': 'Đã từ chối',
    'expired': 'Hết hạn'
  };

  // Cập nhật tabs với đầy đủ các trạng thái và icons phù hợp
  const tabs = [
    {
      id: 'all', 
      label: 'Tất cả', 
      icon: 'fas fa-list-ul',
      color: '#374151'
    },
    { 
      id: 'pending', 
      label: 'Đang xét duyệt', 
      icon: 'fas fa-hourglass-half',
      color: '#FF9F43'
    },
    { 
      id: 'interview-waiting', 
      label: 'Chờ phỏng vấn', 
      icon: 'fas fa-user-clock',
      color: '#7367F0'
    },
    { 
      id: 'interview-done', 
      label: 'Đã phỏng vấn', 
      icon: 'fas fa-user-check',
      color: '#00CFE8'
    },
    { 
      id: 'interview-passed', 
      label: 'Đạt phỏng vấn', 
      icon: 'fas fa-medal',
      color: '#28C76F'
    },
    { 
      id: 'received', 
      label: 'Đã nhận', 
      icon: 'fas fa-handshake',
      color: '#28C76F'
    },
    { 
      id: 'rejected', 
      label: 'Đã từ chối', 
      icon: 'fas fa-times-circle',
      color: '#EA5455'
    },
    { 
      id: 'expired', 
      label: 'Hết hạn', 
      icon: 'fas fa-calendar-times',
      color: '#82868B'
    }
  ];

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
        
        const details = {};
        await Promise.all(
          response.data.appliedJobs.map(async (appliedJob) => {
            const jobDetail = await authAPI().get(userApis.getJobDetailByJobId(appliedJob.job_id));
            details[appliedJob.job_id] = jobDetail.data;
          })
        );
        setJobDetails(details);
        console.log("jobDetails",jobDetails);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredJobs(appliedJobs);
    } else {
      setFilteredJobs(appliedJobs.filter(job => job.status === statusMap[activeTab]));
    }
  }, [activeTab, appliedJobs]);

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
          <div className={cx('tabs-container')}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={cx('tab-button', { active: activeTab === tab.id })}
                onClick={() => setActiveTab(tab.id)}
                data-tab={tab.id}
                style={{
                  '--tab-color': tab.color
                }}
              >
                <i className={tab.icon} style={{ color: activeTab === tab.id ? tab.color : 'inherit' }}></i>
                {tab.label}
                <span className={cx('job-count')} style={{ 
                  backgroundColor: activeTab === tab.id ? `${tab.color}20` : '#F3F4F6',
                  color: activeTab === tab.id ? tab.color : 'inherit'
                }}>
                  {tab.id === 'all' 
                    ? appliedJobs.length 
                    : appliedJobs.filter(job => job.status === statusMap[tab.id]).length}
                </span>
              </button>
            ))}
          </div>

          <div className={cx('filter-bar')}>
            <div className={cx('total-jobs')}>
              Tìm thấy <span>{filteredJobs.length}</span> việc làm
            </div>
            <div className={cx('sort-options')}>
              <select className={cx('sort-select')}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          <div className={cx('job-list')}>
            {filteredJobs.map((appliedJob) => {
              const job = jobDetails[appliedJob.job_id] || {};
                return (
                  <div
                    key={appliedJob.job_id}
                  className={cx('job-card')} 
                    onClick={() => handleJobClick(appliedJob.job_id)}
                  >
                  <div className={cx('job-header')}>
                    <img 
                      src={jobDetails[appliedJob.job_id]?.companyLogo || images.company_1} 
                      alt={jobDetails[appliedJob.job_id]?.companyName || "Công ty ABC"} 
                    />
                    <div className={cx('job-title')}>
                      <h3>{jobDetails[appliedJob.job_id]?.job?.title || "Frontend Developer"}</h3>
                      <p>{jobDetails[appliedJob.job_id]?.companyName || "Công ty ABC"}</p>
                      </div>
                    <div className={cx('application-status')} data-status={appliedJob.status.toLowerCase()}>
                        {appliedJob.status}
                      </div>
                    </div>

                  <div className={cx('job-info')}>
                    <div className={cx('info-item')}>
                      <i className="fas fa-money-bill"></i>
                      <span>{jobDetails[appliedJob.job_id]?.job?.salary || "Thương lượng"}</span>
                      </div>
                    <div className={cx('info-item')}>
                        <i className="fas fa-map-marker-alt"></i>
                      <span>{jobDetails[appliedJob.job_id]?.job?.location || "Remote"}</span>
                      </div>
                    <div className={cx('info-item')}>
                        <i className="far fa-clock"></i>
                      <span>
                        Đã ứng tuyển: {new Date(appliedJob.applied_at).toLocaleDateString('vi-VN')}
                      </span>
                      </div>
                    </div>

                  <div className={cx('application-info')}>
                    <div className={cx('resume-info')}>
                        <i className="far fa-file-pdf"></i>
                      <span>CV đã nộp: {appliedJob.resume}</span>
                      </div>
                    <div className={cx('last-update')}>
                        <i className="fas fa-history"></i>
                        <span>
                        Cập nhật cuối: {
                          appliedJob.updated_at 
                          ? new Date(appliedJob.updated_at).toLocaleDateString('vi-VN')
                          : 'Chưa có cập nhật'
                        }
                        </span>
                    </div>
                  </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobsApplying;
