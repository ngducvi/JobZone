import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./RecruiterJobs.module.scss";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

const JOB_STATUS = {
  Active: { label: 'Đang hiển thị', color: '#02a346', icon: 'fa-solid fa-circle-check' },
  Pending: { label: 'Chờ duyệt', color: '#f59e0b', icon: 'fa-solid fa-clock' },
  Expired: { label: 'Hết hạn', color: '#dc2626', icon: 'fa-solid fa-circle-xmark' },
  Draft: { label: 'Bản nháp', color: '#64748b', icon: 'fa-solid fa-file-lines' }
};

function RecruiterJobs() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [jobApplications, setJobApplications] = useState({});
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    draftJobs: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company info
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCompanyInfo(responseCompany.data.companies[0]);

        // Fetch jobs
        const responseJobs = await authAPI().get(
          recruiterApis.getAllJobsByCompanyId(responseCompany.data.companies[0].company_id)
        );
        setJobs(responseJobs.data.jobs);
        console.log(responseJobs.data);

        // Calculate job statistics
        const stats = responseJobs.data.jobs.reduce((acc, job) => {
          acc.totalJobs++;
          acc[`${job.status.toLowerCase()}Jobs`]++;
          return acc;
        }, { totalJobs: 0, activeJobs: 0, pendingJobs: 0, expiredJobs: 0, draftJobs: 0 });
        
        setJobStats(stats);

        // Get all job applications for each job
        const applications = {};
        for (const job of responseJobs.data.jobs) {
          const responseJobApplications = await authAPI().get(
            recruiterApis.getAllJobApplicationsByJobId(job.job_id)
          );
          applications[job.job_id] = responseJobApplications.data.jobApplications;
        }
        setJobApplications(applications);
      } catch (error) {
        console.error(error);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const filteredJobs = activeTab === 'all' 
    ? jobs 
    : jobs.filter(job => job.status.toLowerCase() === activeTab);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header-section')}>
        <div className={cx('title-section')}>
          <h1>Quản lý Tin Tuyển Dụng</h1>
          <button className={cx('create-job-btn')} onClick={() => navigate('/recruiter/post-job')}>
            <i className="fa-solid fa-plus"></i>
            Đăng tin tuyển dụng
          </button>
        </div>

        <div className={cx('stats-section')}>
          <div className={cx('stats-grid')}>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-briefcase"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.totalJobs}</span>
                <span className={cx('stat-label')}>Tổng tin tuyển dụng</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-circle-check"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.activeJobs}</span>
                <span className={cx('stat-label')}>Tin đang hiển thị</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-circle-xmark"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.expiredJobs}</span>
                <span className={cx('stat-label')}>Tin hết hạn</span>
              </div>
            </div>
            <div className={cx('stat-card')}>
              <i className="fa-solid fa-file-lines"></i>
              <div className={cx('stat-info')}>
                <span className={cx('stat-value')}>{jobStats.draftJobs}</span>
                <span className={cx('stat-label')}>Tin nháp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cx('content-section')}>
        <div className={cx('filter-section')}>
          <div className={cx('tabs')}>
            <button 
              className={cx('tab', { active: activeTab === 'all' })}
              onClick={() => setActiveTab('all')}
            >
              Tất cả tin
            </button>
            {Object.entries(JOB_STATUS).map(([key, value]) => (
              <button
                key={key}
                className={cx('tab', { active: activeTab === key.toLowerCase() })}
                onClick={() => setActiveTab(key.toLowerCase())}
              >
                <i className={value.icon}></i>
                {value.label}
              </button>
            ))}
          </div>

          <div className={cx('search-section')}>
            <div className={cx('search-box')}>
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder="Tìm kiếm tin tuyển dụng..." />
            </div>
          </div>
        </div>

        <div className={cx('jobs-grid')}>
          {filteredJobs.map(job => (
            <div key={job.job_id} className={cx('job-card')}>
              <div className={cx('job-header')}>
                <h3>{job.title}</h3>
                <span className={cx('job-status')} style={{ 
                  color: JOB_STATUS[job.status]?.color,
                  backgroundColor: `${JOB_STATUS[job.status]?.color}15`
                }}>
                  <i className={JOB_STATUS[job.status]?.icon}></i>
                  {JOB_STATUS[job.status]?.label}
                </span>
              </div>
              
              <div className={cx('job-info')}>
                <p><i className="fa-solid fa-building"></i>{companyInfo?.company_name}</p>
                <p><i className="fa-solid fa-location-dot"></i>{job.location || "Không có địa điểm"}</p>
                <p><i className="fa-solid fa-clock"></i>Hết hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</p>
              </div>

              <div className={cx('job-stats')}>
                <span><i className="fa-solid fa-eye"></i>{job.views || 0} lượt xem</span>
                <span><i className="fa-solid fa-users"></i>{jobApplications[job.job_id]?.length || 0} ứng viên</span>
              </div>

              <div className={cx('job-actions')}>
                <button className={cx('action-btn', 'edit')}>
                  <i className="fa-solid fa-pen"></i>Chỉnh sửa
                </button>
                <button className={cx('action-btn', 'delete')}>
                  <i className="fa-solid fa-trash"></i>Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecruiterJobs;
