// Job.js
import { useEffect, useState } from "react";
import React from "react";
import classNames from "classnames/bind";
import styles from "./Job.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaGraduationCap, FaClock, FaMoneyBillWave, FaUserTie, FaCalendarAlt, FaChartLine, FaCheckCircle, FaBan } from "react-icons/fa";

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

  useEffect(() => {
    fetchData();
  }, [activeTab, pageStates[activeTab].page]); // Fetch when tab or its page changes

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

  return (
    <div className={cx("wrapper")}>
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
                          <span>Company Name</span>
                        </div>
                        <div className={cx("location")}>
                          <FaMapMarkerAlt className={cx("icon")} />
                          <span>{job.location}</span>
                        </div>
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
                        <button className={cx("action-btn", "edit")}>
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
    </div>
  );
}

export default Job;
