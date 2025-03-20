import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./RecruiterJobs.module.scss";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import images from "~/assets/images";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import JobDetailModal from './JobDetailModal';

const cx = classNames.bind(styles);

const JOB_STATUS = {
  ACTIVE: {
    label: 'Đang hiển thị',
    icon: 'fa-solid fa-circle-check',
    color: '#10b981'
  },
  PENDING: {
    label: 'Chờ duyệt',
    icon: 'fa-solid fa-clock',
    color: '#f59e0b'
  },
  EXPIRED: {
    label: 'Hết hạn',
    icon: 'fa-solid fa-circle-xmark',
    color: '#ef4444'
  },
  DRAFT: {
    label: 'Bản nháp',
    icon: 'fa-solid fa-file-lines',
    color: '#6b7280'
  },
  CLOSED: {
    label: 'Đã đóng',
    icon: 'fa-solid fa-lock',
    color: '#dc2626'
  }
};

// Job Edit Modal Component
function EditJobModal({ isOpen, onClose, jobData, onEdit, setSelectedJob }) {
  const [title, setTitle] = useState(jobData ? jobData.title : 'Chưa có tiêu đề');
  const [description, setDescription] = useState(jobData ? jobData.description : 'Chưa có mô tả');
  const [salary, setSalary] = useState(jobData ? jobData.salary : 'Chưa có mức lương');
  const [location, setLocation] = useState(jobData ? jobData.location : 'Chưa có địa điểm');
  const [experience, setExperience] = useState(jobData ? jobData.experience : 'Chưa có kinh nghiệm');
  const [jobType, setJobType] = useState(jobData ? jobData.working_time : 'Chưa có hình thức làm việc');
  const [rank, setRank] = useState(jobData ? jobData.rank : 'Chưa có cấp bậc');
  const [deadline, setDeadline] = useState(jobData ? jobData.deadline.split('T')[0] : 'Chưa có hạn nộp đơn');
  const [benefits, setBenefits] = useState(jobData ? jobData.benefits : 'Chưa có quyền lợi');
  const [jobRequirements, setJobRequirements] = useState(jobData ? jobData.job_requirements : '');
  const [workingLocation, setWorkingLocation] = useState(jobData ? jobData.working_location : 'Chưa có địa điểm');
  const [status, setStatus] = useState(jobData ? jobData.status : 'Chưa có trạng thái');
  const [categoryId, setCategoryId] = useState(jobData ? jobData.category_id : 'Chưa có chuyên ngành');

  // active, pending, closed
  const statusLabel = status === 'Active' ? 'Đang hiển thị' : status === 'Pending' ? 'Chờ duyệt' : 'Đã đóng';

  useEffect(() => {
    if (jobData) {
      setTitle(jobData.title);
      setDescription(jobData.description);
      setSalary(jobData.salary);
      setLocation(jobData.location);
      setExperience(jobData.experience);
      setJobType(jobData.working_time);
      setRank(jobData.rank);
      setDeadline(jobData.deadline.split('T')[0]);
      setBenefits(jobData.benefits);
      setJobRequirements(jobData.job_requirements);
      setWorkingLocation(jobData.working_location);
      setStatus(jobData.status);
      setCategoryId(jobData.category_id);
    }
  }, [jobData]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedJob = {
      title,
      description,
      salary,
      location,
      experience,
      working_time: jobType,
      rank,
      deadline,
      benefits,
      job_requirements:jobRequirements,
      working_location:workingLocation,
      status,
      category_id:categoryId,
    };
    await onEdit(jobData.job_id, updatedJob);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cx('modal-overlay')}> 
      <div className={cx('modal-content')}> 
        <h2>Chỉnh sửa tin tuyển dụng</h2>
        <form onSubmit={handleSubmit} >
          <div className={cx('form-group')}> 
            <label htmlFor="title">Tiêu đề công việc</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="description">Mô tả công việc</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="salary">Mức lương</label>
            <select id="salary" value={salary} onChange={(e) => setSalary(e.target.value)} required>
              <option value="">Chọn mức lương</option>
              <option value="Dưới 10 triệu">Dưới 10 triệu</option>
              <option value="10 - 15 triệu">10 - 15 triệu</option>
              <option value="15 - 20 triệu">15 - 20 triệu</option>
              <option value="20 - 25 triệu">20 - 25 triệu</option>
              <option value="25 - 30 triệu">25 - 30 triệu</option>
              <option value="30 - 50 triệu">30 - 50 triệu</option>
              <option value="Trên 50 triệu">Trên 50 triệu</option>
              <option value="Thỏa thuận">Thỏa thuận</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="location">Địa điểm làm việc</label>
            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="experience">Kinh nghiệm</label>
            <select id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} required>
              <option value="">Tất cả</option>
              <option value="Không yêu cầu">Không yêu cầu</option>
              <option value="Dưới 1 năm">Dưới 1 năm</option>
              <option value="1 năm">1 năm</option>
              <option value="2 năm">2 năm</option>
              <option value="3 năm">3 năm</option>
              <option value="4 năm">4 năm</option>
              <option value="5 năm">5 năm</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="jobType">Hình thức làm việc</label>
            <select id="jobType" value={jobType} onChange={(e) => setJobType(e.target.value)} required>
              <option value="">Chọn hình thức</option>
              <option value="Toàn thời gian">Toàn thời gian</option>
              <option value="Bán thời gian">Bán thời gian</option>
              <option value="Thực tập">Thực tập</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="rank">Cấp bậc</label>
            <select id="rank" value={rank} onChange={(e) => setRank(e.target.value)} required>
              <option value="">Chọn cấp bậc</option>
              <option value="staff">Nhân viên</option>
              <option value="team_lead">Trưởng nhóm</option>
              <option value="manager">Trưởng/Phó phòng</option>
              <option value="Quản lý / Giám sát">Quản lý / Giám sát</option>
              <option value="branch_manager">Trưởng chi nhánh</option>
              <option value="vice_director">Phó giám đốc</option>
              <option value="director">Giám đốc</option>
              <option value="intern">Thực tập sinh</option>
            </select>
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="deadline">Hạn nộp đơn</label>
            <input type="date" id="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="benefits">Quyền lợi</label>
            <textarea id="benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="jobRequirements">Yêu cầu công việc</label>
            <textarea id="jobRequirements" value={jobRequirements} onChange={(e) => setJobRequirements(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="workingLocation">Địa điểm làm việc</label>
            <input type="text" id="workingLocation" value={workingLocation} onChange={(e) => setWorkingLocation(e.target.value)} required />
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="status">Trạng thái</label>
            {status === 'Active' ? (
              <input type="text" id="status" value={statusLabel} readOnly />
            ) : (
              <input type="text" id="status" value={statusLabel} readOnly />
            )}
          </div>
          <div className={cx('form-group')}> 
            <label htmlFor="categoryId">Chuyên ngành</label>
            <select id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Chọn chuyên ngành</option>
              <option value="1f25e3ee-ce9e-11ef-9430-2cf05db24bc7">Software Engineering</option>
              <option value="1f25e912-ce9e-11ef-9430-2cf05db24bc7">Data Science</option>
              <option value="1f25ea73-ce9e-11ef-9430-2cf05db24bc7">Project Management</option>
              <option value="1f25eb8c-ce9e-11ef-9430-2cf05db24bc7">Marketing</option>
              <option value="1f25ec4e-ce9e-11ef-9430-2cf05db24bc7">Graphic Design</option>
              <option value="1f25ed2a-ce9e-11ef-9430-2cf05db24bc7">Sales</option>
              <option value="1f25ee06-ce9e-11ef-9430-2cf05db24bc7">Human Resources</option>
              <option value="1f25eec3-ce9e-11ef-9430-2cf05db24bc7">Customer Support</option>
              <option value="1f25fb0c-ce9e-11ef-9430-2cf05db24bc7">Web Development</option>
              <option value="1f25f02b-ce9e-11ef-9430-2cf05db24bc7">Mobile Development</option>
            </select>
          </div>
          <div className={cx('button-group')}> 
            <button type="submit" className={cx('submit-btn')}>Lưu thay đổi</button>
            <button type="button" className={cx('cancel-btn')} onClick={() => { onClose(); setSelectedJob(null); }}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailModalOpen, setIsJobDetailModalOpen] = useState(false);
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;
  const [hasBusinessLicense, setHasBusinessLicense] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCheckingLicense(true);
        // Fetch company info
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCompanyInfo(responseCompany.data.companies[0]);

        // Check business license
        const responseCheckLicense = await authAPI().get(
          recruiterApis.checkBusinessLicense(responseCompany.data.companies[0].company_id)
        );
        setHasBusinessLicense(responseCheckLicense.data.businessLicense);

        if (responseCheckLicense.data.businessLicense) {
          // Only fetch other data if business license exists
          // Fetch jobs
          const responseJobs = await authAPI().get(
            recruiterApis.getAllJobsByCompanyId(responseCompany.data.companies[0].company_id)
          );
          setJobs(responseJobs.data.jobs);

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
        }
      } catch (error) {
        console.error(error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsCheckingLicense(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (jobId, updatedJob) => {
    try {
      await authAPI().post(recruiterApis.editJob(jobId), updatedJob);
      setJobs((prevJobs) => prevJobs.map((job) => (job.job_id === jobId ? { ...job, ...updatedJob } : job)));
      toast.success('Chỉnh sửa tin tuyển dụng thành công!');
    } catch (error) {
      console.error("Error editing job:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?');
    if (!confirmDelete) return;

    try {
      await authAPI().delete(recruiterApis.deleteJob(jobId));
      setJobs((prevJobs) => prevJobs.filter((job) => job.job_id !== jobId));
      toast.success('Xóa tin tuyển dụng thành công!');
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJobDetails(job);
    setIsJobDetailModalOpen(true);
  };

  const isJobExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const getFilteredJobs = () => {
    let filtered = [...jobs];

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(job => {
        if (activeTab === 'expired') {
          return isJobExpired(job.deadline);
        }
        if (activeTab === 'active') {
          return job.status === 'Active' && !isJobExpired(job.deadline);
        }
        if (activeTab === 'closed') {
          return job.status === 'Closed';
        }
        return job.status.toLowerCase() === activeTab;
      });
    }

    return filtered;
  };

  // Tính toán các jobs cho trang hiện tại
  const getCurrentJobs = () => {
    const filtered = getFilteredJobs();
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filtered.slice(indexOfFirstJob, indexOfLastJob);
  };

  // Tính tổng số trang
  const totalPages = Math.ceil(getFilteredJobs().length / jobsPerPage);

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleAddLicense = () => {
    navigate("/recruiter/settings", { state: { activeTab: 'license' } });
  };

  if (isCheckingLicense) {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("loading")}>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!hasBusinessLicense) {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("no-license")}>
          <div className={cx("message")}>
            <i className="fa-solid fa-exclamation-triangle"></i>
            <h2>Bạn cần cập nhật giấy phép kinh doanh</h2>
            <p>Để sử dụng tính năng quản lý tin tuyển dụng, vui lòng cập nhật thông tin giấy phép kinh doanh của công ty.</p>
            <button className={cx("add-license-btn")} onClick={handleAddLicense}>
              <i className="fa-solid fa-plus"></i>
              Thêm giấy phép kinh doanh
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <span className={cx('stat-label')}>Tin đóng</span>
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
              data-tab="all"
            >
              Tất cả tin
              <span className={cx('count-badge')}>{jobs.length}</span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'active' })}
              onClick={() => setActiveTab('active')}
              data-tab="active"
            >
              <i className={JOB_STATUS.ACTIVE.icon}></i>
              Đang hiển thị
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Active' && !isJobExpired(job.deadline)).length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'pending' })}
              onClick={() => setActiveTab('pending')}
              data-tab="pending"
            >
              <i className={JOB_STATUS.PENDING.icon}></i>
              Chờ duyệt
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Pending').length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'expired' })}
              onClick={() => setActiveTab('expired')}
              data-tab="expired"
            >
              <i className={JOB_STATUS.EXPIRED.icon}></i>
              Hết hạn
              <span className={cx('count-badge')}>
                {jobs.filter(job => isJobExpired(job.deadline)).length}
              </span>
            </button>
            <button
              className={cx('tab', { active: activeTab === 'closed' })}
              onClick={() => setActiveTab('closed')}
              data-tab="closed"
            >
              <i className={JOB_STATUS.CLOSED.icon}></i>
              Đã đóng
              <span className={cx('count-badge')}>
                {jobs.filter(job => job.status === 'Closed').length}
              </span>
            </button>
          </div>

          <div className={cx('search-section')}>
            <div className={cx('search-box')}>
              <i className="fa-solid fa-search"></i>
              <input 
                type="text" 
                placeholder="Tìm kiếm tin tuyển dụng..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className={cx('jobs-grid')}>
          {getCurrentJobs().map(job => (
            <div key={job.job_id} className={cx('job-card')}>
              <div className={cx('job-header')}>
                <h3>{job.title}</h3>
                <span className={cx('job-status')} 
                  data-status={job.status.toLowerCase()}
                  style={{ 
                    color: JOB_STATUS[job.status]?.color,
                    backgroundColor: `${JOB_STATUS[job.status]?.color}15`
                  }}
                >
                  <i className={JOB_STATUS[job.status]?.icon}></i>
                  {JOB_STATUS[job.status]?.label}
                </span>
              </div>
              
              <div className={cx('job-info')}>
                <p><i className="fa-solid fa-building"></i>{companyInfo?.company_name}</p>
                <p><i className="fa-solid fa-location-dot"></i>{job.location || "Không có địa điểm"}</p>
                <p><i className="fa-solid fa-clock"></i>Hết hạn: {new Date(job.deadline).toLocaleDateString('en-US')}</p>
              </div>

              <div className={cx('job-stats')}>
                <span><i className="fa-solid fa-eye"></i>{job.views || 0} lượt xem</span>
                <span><i className="fa-solid fa-users"></i>{jobApplications[job.job_id]?.length || 0} ứng viên</span>
              </div>

              <div className={cx('job-actions')}>
                <button className={cx('action-btn', 'edit')} onClick={() => handleEditJob(job)}>
                  <i className="fa-solid fa-pen"></i>Chỉnh sửa
                </button>
                <button className={cx('action-btn', 'delete')} onClick={() => handleDeleteJob(job.job_id)}>
                  <i className="fa-solid fa-trash"></i>Xóa
                </button>
                <button className={cx('action-btn', 'view')} onClick={() => handleViewJob(job)}>
                  <i className="fa-solid fa-eye"></i>Xem Job
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Thêm phân trang */}
        {totalPages > 1 && (
          <div className={cx('pagination')}>
            <button 
              className={cx('pagination-btn')} 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {getPageNumbers().map(number => (
              <button
                key={number}
                className={cx('pagination-btn', { active: currentPage === number })}
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            ))}

            <button 
              className={cx('pagination-btn')} 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
      <EditJobModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        jobData={selectedJob} 
        onEdit={handleEditSubmit} 
        setSelectedJob={setSelectedJob} 
      />
      <JobDetailModal 
        isOpen={isJobDetailModalOpen} 
        onClose={() => setIsJobDetailModalOpen(false)} 
        jobDetails={selectedJobDetails} 
      />
    </div>
  );
}

export default RecruiterJobs;
