// Job.js
import { useEffect, useState } from "react";
import React from "react";
import classNames from "classnames/bind";
import styles from "./Job.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaClock, FaMoneyBillWave, FaUserTie, FaCalendarAlt, FaChartLine, FaCheckCircle, FaBan, FaTimes, FaUsers, FaGlobe } from "react-icons/fa";

const cx = classNames.bind(styles);

function Job() {
  // Separate pagination state for each tab
  const [pageStates, setPageStates] = useState({
    Active: { page: 1, total: 1 },
    Pending: { page: 1, total: 1 },
    Closed: { page: 1, total: 1 }
  });

  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');
  const [counts, setCounts] = useState({
    active: 0,
    pending: 0,
    closed: 0
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    status: '',
    deadline: '',
    quantity: '',
    education: '',
    experience: '',
    rank: ''
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [companyDetails, setCompanyDetails] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await authAPI().get(adminApis.getAllJobs, {
        params: { 
          page: pageStates[activeTab].page,
          status: activeTab
        },
      });
      setJobData(result.data.jobs);
      console.log(result.data.jobs);

      
      // Update total pages for current tab
      setPageStates(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          total: result.data.totalPages
        }
      }));

      // Update counts
      const newCounts = {
        active: result.data.counts?.active || 0,
        pending: result.data.counts?.pending || 0,
        closed: result.data.counts?.closed || 0
      };
      setCounts(newCounts);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async (company_id) => {
    try {
      const response = await authAPI().get(adminApis.getCompanyDetailByCompanyId(company_id));
      if (response.status === 200) {
        setCompanyDetails(prev => ({
          ...prev,
          [company_id]: response.data.company
        }));
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, pageStates[activeTab].page]); // Fetch when tab or its page changes

  useEffect(() => {
    if (jobData.length > 0) {
      jobData.forEach(job => {
        if (!companyDetails[job.company_id]) {
          fetchCompanyDetails(job.company_id);
        }
      });
    }
  }, [jobData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageStates[activeTab].total) {
      setPageStates(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          page: newPage
        }
      }));
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Keep the page state when switching tabs
  };

  // Format salary
  const formatSalary = (salary) => {
    const [min, max] = salary.split('-');
    return `$${parseInt(min).toLocaleString()} - $${parseInt(max).toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setEditFormData({
      title: job.title,
      description: job.description,
      salary: job.salary,
      location: job.location,
      status: job.status,
      deadline: new Date(job.deadline).toISOString().split('T')[0],
      quantity: job.quantity,
      education: job.education,
      experience: job.experience,
      rank: job.rank
    });
    
    setIsEditModalOpen(true);
    
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedJob(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        title: editFormData.title,
        description: editFormData.description,
        salary: editFormData.salary,
        location: editFormData.location,
        status: editFormData.status,
        education: editFormData.education,
        experience: editFormData.experience,
        rank: editFormData.rank,
        deadline: editFormData.deadline,
        quantity: editFormData.quantity,
        company_id: selectedJob.company_id
      };

      const response = await authAPI().put(
        adminApis.editJob(selectedJob.job_id), 
        dataToSend
      );

      if (response.status === 200) {
        setNotification({
          show: true,
          message: 'Cập nhật thành công!',
          type: 'success'
        });
        handleCloseModal();
        fetchData();
        
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating job:", error);
      setNotification({
        show: true,
        message: 'Có lỗi xảy ra khi cập nhật!',
        type: 'error'
      });
    }
  };

  return (
    <div className={cx("wrapper")}>
      {notification.show && (
        <div className={cx("notification", notification.type)}>
          {notification.message}
        </div>
      )}
      <div className={cx("header")}>
        <div className={cx("header-content")}>
          <h1>
            <FaBriefcase className={cx("header-icon")} />
            Quản lý tin tuyển dụng
          </h1>
          <p>Quản lý và giám sát các tin tuyển dụng trên hệ thống</p>
        </div>
      </div>

      <div className={cx("main-content")}>
        <div className={cx("tabs-wrapper")}>
          <div className={cx("tabs")}>
            <button 
              className={cx("tab-btn", { active: activeTab === 'Active' })}
              onClick={() => handleTabChange('Active')}
              data-count={counts.active}
            >
              <FaCheckCircle className={cx("tab-icon")} />
              Đang hoạt động
            </button>
            <button 
              className={cx("tab-btn", { active: activeTab === 'Pending' })}
              onClick={() => handleTabChange('Pending')}
              data-count={counts.pending}
            >
              <FaClock className={cx("tab-icon")} />
              Chờ duyệt
            </button>
            <button 
              className={cx("tab-btn", { active: activeTab === 'Closed' })}
              onClick={() => handleTabChange('Closed')}
              data-count={counts.closed}
            >
              <FaBan className={cx("tab-icon")} />
              Đã đóng
            </button>
          </div>

          <button className={cx("add-btn")}>
            <FaBriefcase /> Thêm tin tuyển dụng
          </button>
        </div>

        <div className={cx("table-wrapper")}>
          <table className={cx("job-table")}>
            <thead>
              <tr>
                <th>Thông tin công việc</th>
                <th>Yêu cầu</th>
                <th>Chi tiết</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className={cx("loading")}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : (
                jobData.map((job) => (
                  <tr key={job.job_id}>
                    <td>
                      <div className={cx("job-info")}>
                        <h3>{job.title}</h3>
                        <div className={cx("company-info")}>
                          <FaBuilding className={cx("icon")} />
                          <span>
                            {companyDetails[job.company_id] ? (
                              <>
                                {companyDetails[job.company_id].company_name}
                                {companyDetails[job.company_id].verified && (
                                  <FaCheckCircle className={cx("verified-icon")} title="Đã xác thực" />
                                )}
                              </>
                            ) : (
                              "Đang tải..."
                            )}
                          </span>
                        </div>
                        <div className={cx("location")}>
                          <FaMapMarkerAlt className={cx("icon")} />
                          <span>{job.location}</span>
                        </div>
                        {companyDetails[job.company_id] && (
                          <div className={cx("company-extra-info")}>
                            <div className={cx("company-size")}>
                              <FaUsers className={cx("icon")} />
                              <span>{companyDetails[job.company_id].company_size} nhân viên</span>
                            </div>
                            {companyDetails[job.company_id].website && (
                              <div className={cx("company-website")}>
                                <FaGlobe className={cx("icon")} />
                                <a href={companyDetails[job.company_id].website} target="_blank" rel="noopener noreferrer">
                                  Website công ty
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={cx("requirements")}>
                        <div className={cx("req-item")}>
                          <FaGraduationCap className={cx("icon")} />
                          <span>{job.education}</span>
                        </div>
                        <div className={cx("req-item")}>
                          <FaClock className={cx("icon")} />
                          <span>{job.experience}</span>
                        </div>
                        <div className={cx("req-item")}>
                          <FaUserTie className={cx("icon")} />
                          <span>{job.rank}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={cx("details")}>
                        <div className={cx("detail-item")}>
                          <FaMoneyBillWave className={cx("icon")} />
                          <span>{formatSalary(job.salary)}</span>
                        </div>
                        <div className={cx("detail-item")}>
                          <FaCalendarAlt className={cx("icon")} />
                          <span>Hết hạn: {formatDate(job.deadline)}</span>
                        </div>
                        <div className={cx("quantity")}>
                          <span>Số lượng: {job.quantity}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={cx("status", job.status.toLowerCase())}>
                        {job.status}
                      </div>
                    </td>
                    <td>
                      <div className={cx("actions")}>
                        <button 
                          className={cx("action-btn", "edit")}
                          onClick={() => handleEditClick(job)}
                        >
                          Chỉnh sửa
                        </button>
                        <button className={cx("action-btn", "delete")}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={cx("pagination")}>
          <button
            className={cx("page-btn")}
            onClick={() => handlePageChange(pageStates[activeTab].page - 1)}
            disabled={pageStates[activeTab].page === 1}
          >
            <PrevPageIcon />
          </button>
          <span className={cx("page-info")}>
            Trang {pageStates[activeTab].page} / {pageStates[activeTab].total}
          </span>
          <button
            className={cx("page-btn")}
            onClick={() => handlePageChange(pageStates[activeTab].page + 1)}
            disabled={pageStates[activeTab].page === pageStates[activeTab].total}
          >
            <NextPageIcon />
          </button>
        </div>
      </div>

      {/* Add Modal Form */}
      {isEditModalOpen && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-header")}>
              <h2>Chỉnh sửa tin tuyển dụng</h2>
              <button className={cx("close-btn")} onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className={cx("edit-form")}>
              <div className={cx("form-group")}>
                <label>Tiêu đề</label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* company name  */}
              <div className={cx("form-group")}>
                <label>Tên công ty</label>
                <input
                  type="text"
                  name="company_name"
                  value={companyDetails[selectedJob.company_id]?.company_name || "Loading..."}
                  disabled
                />
              </div>
              <div className={cx("form-group")}>
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Mức lương</label>
                  <input
                    type="text"
                    name="salary"
                    value={editFormData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Địa điểm</label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Trình độ</label>
                  <input
                    type="text"
                    name="education"
                    value={editFormData.education}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Kinh nghiệm</label>
                  <input
                    type="text"
                    name="experience"
                    value={editFormData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Cấp bậc</label>
                  <input
                    type="text"
                    name="rank"
                    value={editFormData.rank}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Số lượng</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className={cx("form-row")}>
                <div className={cx("form-group")}>
                  <label>Hạn nộp</label>
                  <input
                    type="date"
                    name="deadline"
                    value={editFormData.deadline}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={cx("form-group")}>
                  <label>Trạng thái</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Active">Đang hoạt động</option>
                    <option value="Pending">Chờ duyệt</option>
                    <option value="Closed">Đã đóng</option>
                  </select>
                </div>
              </div>

              <div className={cx("form-actions")}>
                <button type="button" onClick={handleCloseModal} className={cx("cancel-btn")}>
                  Hủy
                </button>
                <button type="submit" className={cx("submit-btn")}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Job;
