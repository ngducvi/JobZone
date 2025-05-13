import React, { useContext, useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./RecruiterCVManagement.module.scss";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import images from "~/assets/images";
import { FaTimes, FaFileExcel, FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import socketService from "~/utils/socket";
const cx = classNames.bind(styles);

const JOB_STATUS = {
  // tất cả tin
  Active: {
    label: "Đang hiển thị",
    color: "#02a346",
    icon: "fa-solid fa-circle-check",
  },
  Pending: { label: "Chờ duyệt", color: "#f59e0b", icon: "fa-solid fa-clock" },
  Expired: {
    label: "Hết hạn",
    color: "#dc2626",
    icon: "fa-solid fa-circle-xmark",
  },
  Draft: {
    label: "Bản nháp",
    color: "#64748b",
    icon: "fa-solid fa-file-lines",
  },
};

const APPLICATION_STATUS = [
  "Đang xét duyệt",
  "Chờ phỏng vấn",
  "Đã phỏng vấn",
  "Đạt phỏng vấn",
  "Đã nhận",
  "Đã từ chối",
  "Hết hạn",
];

function RecruiterCVManagement() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [jobApplications, setJobApplications] = useState({});
  const [jobStats, setJobStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    draftJobs: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [hasBusinessLicense, setHasBusinessLicense] = useState(false);
  const [isCheckingLicense, setIsCheckingLicense] = useState(true);
  const [isCompanyActive, setIsCompanyActive] = useState(false);
  const [newApplicationsStats, setNewApplicationsStats] = useState({
    newApplications: 0,
    byStatus: [],
    byJob: [],
    timestamp: new Date()
  });
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [showNewApplicationsNotification, setShowNewApplicationsNotification] = useState(false);
  
  const pollIntervalRef = useRef(null);
  const prevNewApplicationsCountRef = useRef(0);

  const token = localStorage.getItem("token");

  // Fetch company and job data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCheckingLicense(true);
        // Fetch company info
        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
        setCompanyInfo(responseCompany.data.companies[0]);

        // Check company activation status
        const companyResponse = await authAPI().get(recruiterApis.checkRecruiterCompany);
        const isActive = companyResponse.data.recruiterCompany === 'active';
        setIsCompanyActive(isActive);

        // Check business license
        const responseCheckLicense = await authAPI().get(
          recruiterApis.checkBusinessLicense(responseCompany.data.companies[0].company_id)
        );
        setHasBusinessLicense(responseCheckLicense.data.businessLicense);

        if (responseCheckLicense.data.businessLicense) {
          // Only fetch other data if business license exists
          // Fetch jobs
          const responseJobs = await authAPI().get(
            recruiterApis.getAllJobsByCompanyId(
              responseCompany.data.companies[0].company_id
            )
          );
          setJobs(responseJobs.data.jobs);
          console.log(responseJobs.data);

          // Calculate job statistics
          const stats = responseJobs.data.jobs.reduce(
            (acc, job) => {
              acc.totalJobs++;
              acc[`${job.status.toLowerCase()}Jobs`]++;
              return acc;
            },
            {
              totalJobs: 0,
              activeJobs: 0,
              pendingJobs: 0,
              expiredJobs: 0,
              draftJobs: 0,
            }
          );

          setJobStats(stats);

          // Get all job applications for each job
          const applications = {};
          for (const job of responseJobs.data.jobs) {
            const responseJobApplications = await authAPI().get(
              recruiterApis.getAllJobApplicationsByJobId(job.job_id)
            );
            applications[job.job_id] =
              responseJobApplications.data.jobApplications;
          }
          setJobApplications(applications);
          
          // Fetch initial new applications stats
          await fetchNewApplicationsStats();
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

  // Setup polling for new applications
  useEffect(() => {
    if (hasBusinessLicense && isRealTimeEnabled && companyInfo) {
      // Start polling for new applications
      pollIntervalRef.current = setInterval(() => {
        fetchNewApplicationsStats();
      }, 30000); // Check every 30 seconds

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [hasBusinessLicense, isRealTimeEnabled, companyInfo]);
  
  // Setup socket.io for realtime updates
  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token && companyInfo && hasBusinessLicense) {
      // Connect socket
      socketService.connect(token);
      
      // Join company room
      socketService.joinCompanyRoom(companyInfo.company_id);
      
      // Listen for new job applications
      socketService.onNewJobApplication((data) => {
        console.log('Received new job application:', data);
        toast.info(`🎉 ${data.candidate_name} vừa ứng tuyển vào vị trí ${data.job_title}!`);
        setShowNewApplicationsNotification(true);
        
        // Cập nhật số lượng ứng viên cho job cụ thể
        setJobApplications(prev => {
          // Kiểm tra nếu job_id đã tồn tại trong state
          if (prev[data.job_id]) {
            // Thêm ứng viên vào danh sách hiện tại
            return {
              ...prev,
              [data.job_id]: [
                ...prev[data.job_id],
                {
                  application_id: data.application_id,
                  status: "Đang xét duyệt",
                  applied_at: data.applied_at,
                  user: { name: data.candidate_name },
                  candidate: { candidate_id: data.candidate_id }
                }
              ]
            };
          }
          return prev;
        });
        
        // Cập nhật newApplicationsStats
        setNewApplicationsStats(prev => {
          // Tạo một bản sao của byJob
          let updatedByJob = [...prev.byJob];
          
          // Kiểm tra xem job_id đã tồn tại trong byJob chưa
          const jobIndex = updatedByJob.findIndex(j => j.job_id === data.job_id);
          
          if (jobIndex >= 0) {
            // Nếu đã tồn tại, tăng count lên 1
            updatedByJob[jobIndex] = {
              ...updatedByJob[jobIndex],
              count: (updatedByJob[jobIndex].count || 0) + 1
            };
          } else {
            // Nếu chưa tồn tại, thêm mới vào danh sách
            updatedByJob.push({
              job_id: data.job_id,
              count: 1
            });
          }
          
          // Tương tự cho byStatus
          let updatedByStatus = [...prev.byStatus];
          const statusIndex = updatedByStatus.findIndex(s => s.status === "Đang xét duyệt");
          
          if (statusIndex >= 0) {
            updatedByStatus[statusIndex] = {
              ...updatedByStatus[statusIndex],
              count: (updatedByStatus[statusIndex].count || 0) + 1
            };
          } else {
            updatedByStatus.push({
              status: "Đang xét duyệt",
              count: 1
            });
          }
          
          return {
            ...prev,
            newApplications: prev.newApplications + 1,
            byJob: updatedByJob,
            byStatus: updatedByStatus
          };
        });
        
        // Fetch mới để cập nhật đầy đủ thông tin
        fetchNewApplicationsStats();
      });
      
      return () => {
        // Cleanup
        socketService.removeNewJobApplicationListener();
        socketService.leaveCompanyRoom(companyInfo.company_id);
      };
    }
  }, [companyInfo, hasBusinessLicense]);

  // Fetch new applications stats
  const fetchNewApplicationsStats = async () => {
    try {
      if (!companyInfo) return;

      const response = await authAPI().get(
        recruiterApis.getNewJobApplicationsStats(companyInfo.company_id, 'hour')
      );
      
      const apiData = response.data;
      
      // Ensure we maintain our state structure
      const newStats = {
        newApplications: apiData.newApplications || 0,
        byStatus: apiData.byStatus || [],
        byJob: apiData.byJob || [],
        timestamp: apiData.timestamp ? new Date(apiData.timestamp) : new Date()
      };
      
      setLastUpdateTime(newStats.timestamp);
      
      // Check if there are new applications since last check
      if (prevNewApplicationsCountRef.current < newStats.newApplications) {
        const diff = newStats.newApplications - prevNewApplicationsCountRef.current;
        
        // Only show notification if this is not the first fetch
        if (prevNewApplicationsCountRef.current > 0) {
          // Show notification
          setShowNewApplicationsNotification(true);
          toast.info(`Có ${diff} CV mới ứng tuyển trong 1 giờ qua!`);
          
          // Update job applications data
          await refreshJobApplicationsData();
        }
      }
      
      // Update previous count reference
      prevNewApplicationsCountRef.current = newStats.newApplications;
      
      // Update state
      setNewApplicationsStats(newStats);
    } catch (error) {
      console.error("Error fetching new applications stats:", error);
    }
  };

  // Refresh job applications data
  const refreshJobApplicationsData = async () => {
    try {
      if (!companyInfo) return;
      
      // Lấy danh sách công việc đang được hiển thị
      const visibleJobs = filteredJobs.length > 0 ? filteredJobs : jobs;
      
      // Tạo mảng promise để fetch dữ liệu song song
      const fetchPromises = visibleJobs.map(job => 
        authAPI().get(recruiterApis.getAllJobApplicationsByJobId(job.job_id))
          .then(response => ({
            jobId: job.job_id,
            applications: response.data.jobApplications
          }))
      );
      
      // Chờ tất cả promise hoàn thành
      const results = await Promise.all(fetchPromises);
      
      // Cập nhật state với dữ liệu mới
      const newApplicationsData = results.reduce((acc, { jobId, applications }) => {
        acc[jobId] = applications;
        return acc;
      }, {});
      
      // Merge dữ liệu mới với dữ liệu hiện tại
      setJobApplications(prev => ({
        ...prev,
        ...newApplicationsData
      }));
      
      console.log("Đã cập nhật dữ liệu ứng viên mới");
    } catch (error) {
      console.error("Error refreshing job applications data:", error);
    }
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    if (isRealTimeEnabled) {
      // Disable real-time updates
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    } else {
      // Enable real-time updates and immediately fetch latest data
      fetchNewApplicationsStats();
      pollIntervalRef.current = setInterval(() => {
        fetchNewApplicationsStats();
      }, 30000);
    }
    
    setIsRealTimeEnabled(!isRealTimeEnabled);
  };

  // Hide notification after 10 seconds
  useEffect(() => {
    if (showNewApplicationsNotification) {
      const timer = setTimeout(() => {
        setShowNewApplicationsNotification(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showNewApplicationsNotification]);

  const filteredJobs =
    activeTab === "all"
      ? jobs
      : jobs.filter((job) => job.status.toLowerCase() === activeTab);

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await authAPI().post(recruiterApis.editJobApplicationStatus, {
        job_application_id: applicationId,
        status: newStatus,
        user_id: user.id,
        recruiter_id: companyInfo.user_id,
        company_id: companyInfo.company_id,
        company_name: companyInfo.company_name,
      });
      // Cập nhật lại danh sách ứng viên sau khi thay đổi trạng thái
      const updatedApplications = jobApplications[selectedJob.job_id].map(
        (application) => {
          if (application.application_id === applicationId) {
            return { ...application, status: newStatus };
          }
          return application;
        }
      );
      setJobApplications((prev) => ({
        ...prev,
        [selectedJob.job_id]: updatedApplications,
      }));
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const handleCandidateClick = (candidateId) => {
    console.log("Clicking candidate with ID:", candidateId);
    navigate(`/recruiter/candidate-detail/${candidateId}`);
  };

  const getApplicationCountByStatus = (status) => {
    return (
      jobApplications[selectedJob?.job_id]?.filter(
        (app) => app.status === status
      ).length || 0
    );
  };

  const handleAddLicense = () => {
    navigate("/recruiter/settings", { state: { activeTab: 'license' } });
  };

  const handleExportJobApplications = async (jobId) => {
    try {
      // Get the token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Bạn cần đăng nhập để sử dụng tính năng này");
        return;
      }
      
      toast.info("Đang chuẩn bị xuất dữ liệu, vui lòng đợi...");
      
      // Create a fetch request with proper headers
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}${recruiterApis.exportJobApplications(jobId)}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Có lỗi xảy ra khi xuất dữ liệu");
      }
      
      // Get the filename from the response headers if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'job_applications.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      // Convert the response to blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger click event to start download
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Error exporting job applications:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xuất danh sách ứng viên");
    }
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
            <i className="fa-solid fa-exclamation-circle"></i>
            <h2>Bạn cần cập nhật giấy phép kinh doanh</h2>
            <p>Để sử dụng tính năng quản lý CV, vui lòng cập nhật thông tin giấy phép kinh doanh của công ty.</p>
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
    <div className={cx("wrapper")}>
      {showNewApplicationsNotification && (
        <div className={cx("new-applications-notification")}>
          <FaBell />
          <span>Có {newApplicationsStats.newApplications} CV mới ứng tuyển trong 1 giờ qua!</span>
          <button onClick={() => setShowNewApplicationsNotification(false)}>
            <FaTimes />
          </button>
        </div>
      )}
      
      <div className={cx("header-section")}>
        <div className={cx("title-section")}>
          <h1>Quản lý CV Ứng Viên</h1>
          <div className={cx("header-actions")}>
            <div className={cx("realtime-toggle")}>
              <label className={cx("switch")}>
                <input
                  type="checkbox"
                  checked={isRealTimeEnabled}
                  onChange={toggleRealTimeUpdates}
                />
                <span className={cx("slider", "round")}></span>
              </label>
              <span>Cập nhật tự động</span>
              {lastUpdateTime && (
                <span className={cx("last-update-time")}>
                  Cập nhật lúc: {lastUpdateTime.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {isCompanyActive ? (
              <button
                className={cx("create-job-btn")}
                onClick={() => navigate("/recruiter/post-job")}
              >
                <i className="fa-solid fa-plus"></i>
                Đăng tin tuyển dụng
              </button>
            ) : (
              <button
                className={cx("create-job-btn", "disabled")}
                disabled
              >
                <i className="fa-solid fa-exclamation-circle"></i>
                Tài khoản chưa được kích hoạt
              </button>
            )}
          </div>
        </div>
        
        {newApplicationsStats && (
          <div className={cx("stats-cards")}>
            <div className={cx("stats-card")}>
              <div className={cx("stats-icon")}>
                <i className="fa-solid fa-file-alt"></i>
              </div>
              <div className={cx("stats-info")}>
                <h3>{newApplicationsStats.newApplications}</h3>
                <p>CV mới (1h qua)</p>
              </div>
            </div>
            
            {newApplicationsStats.byStatus.map((status) => (
              <div className={cx("stats-card")} key={status.status}>
                <div className={cx("stats-icon")}>
                  <i className={getStatusIcon(status.status)}></i>
                </div>
                <div className={cx("stats-info")}>
                  <h3>{status.count}</h3>
                  <p>{status.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cx("content-section")}>
        <div className={cx("filter-section")}>
          <div className={cx("tabs", "job-status-tabs")}>
            <button
              className={cx("tab", { active: activeTab === "all" })}
              onClick={() => setActiveTab("all")}
            >
              Tất cả tin
            </button>
            {Object.entries(JOB_STATUS).map(([key, value]) => (
              <button
                key={key}
                className={cx("tab", {
                  active: activeTab === key.toLowerCase(),
                })}
                onClick={() => setActiveTab(key.toLowerCase())}
              >
                <i className={value.icon}></i>
                {value.label}
              </button>
            ))}
          </div>

          <div className={cx("search-section")}>
            <div className={cx("search-box")}>
              <i className="fa-solid fa-search"></i>
              <input type="text" placeholder="Tìm kiếm tin tuyển dụng..." />
            </div>
          </div>
        </div>

        <div className={cx("jobs-grid")}>
          {filteredJobs.map((job) => (
            <div key={job.job_id} className={cx("job-card")}>
              <div className={cx("job-header")}>
                <h3>{job.title}</h3>
                <span
                  className={cx("job-status")}
                  style={{
                    color: JOB_STATUS[job.status]?.color,
                    backgroundColor: `${JOB_STATUS[job.status]?.color}15`,
                  }}
                >
                  <i className={JOB_STATUS[job.status]?.icon}></i>
                  {JOB_STATUS[job.status]?.label}
                </span>
              </div>

              <div className={cx("job-info")}>
                <p>
                  <i className="fa-solid fa-building"></i>
                  {companyInfo?.company_name}
                </p>
                <p>
                  <i className="fa-solid fa-location-dot"></i>
                  {job.location || "Không có địa điểm"}
                </p>
                <p>
                  <i className="fa-solid fa-clock"></i>Hết hạn:{" "}
                  {new Date(job.deadline).toLocaleDateString("vi-VN")}
                </p>
              </div>

              <div className={cx("job-stats")}>
                <span>
                  <i className="fa-solid fa-users"></i>
                  {jobApplications[job.job_id]?.length || 0} ứng viên
                </span>
                
                {/* Hiển thị số CV mới nếu có */}
                {newApplicationsStats.byJob.find(j => j.job_id === job.job_id)?.count > 0 && (
                  <span className={cx("new-applications-badge")}>
                    <i className="fa-solid fa-bell"></i>
                    {newApplicationsStats.byJob.find(j => j.job_id === job.job_id)?.count || 0} mới
                  </span>
                )}
              </div>

              <div className={cx("job-actions")}>
                {/* button chi tiết và danh sách ứng viên */}
                <button className={cx("action-btn", "detail")}>
                  <i className="fa-solid fa-eye"></i>
                  Chi tiết
                </button>
                <button
                  className={cx("action-btn", "applicants")}
                  onClick={() => handleJobClick(job)}
                >
                  <i className="fa-solid fa-users"></i>
                  Danh sách ứng viên
                </button>
                <button
                  className={cx("action-btn", "export")}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportJobApplications(job.job_id);
                  }}
                  disabled={!jobApplications[job.job_id]?.length}
                  title={!jobApplications[job.job_id]?.length ? "Không có ứng viên để xuất" : "Xuất danh sách ứng viên"}
                >
                  <FaFileExcel />
                  Xuất Excel
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-header")}>
              <h3>Thông tin ứng viên cho {selectedJob?.title}</h3>
              <div className={cx("modal-actions")}>
                <button 
                  className={cx("export-btn")}
                  onClick={() => handleExportJobApplications(selectedJob.job_id)}
                  disabled={!jobApplications[selectedJob?.job_id]?.length}
                >
                  <FaFileExcel />
                  Xuất Excel
                </button>
              <button
                className={cx("close-btn")}
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
              </div>
            </div>
            <div className={cx("modal-content")}>
              <div className={cx("tabs", "application-status-tabs")}>
                {APPLICATION_STATUS.map((status) => (
                  <button
                    key={status}
                    className={cx("tab", { active: activeTab === status })}
                    onClick={() => setActiveTab(status)}
                  >
                    {status} ({getApplicationCountByStatus(status)})
                  </button>
                ))}
              </div>
              {jobApplications[selectedJob?.job_id]?.length > 0 ? (
                <table className={cx("candidate-table")}>
                  <thead>
                    <tr>
                      <th className={cx("name-column")}>Tên</th>
                      <th className={cx("email-column")}>Email</th>
                      <th className={cx("phone-column")}>Số điện thoại</th>
                      <th className={cx("location-column")}>Địa điểm</th>
                      {/* <th className={cx("status-column-cv")}>Trạng thái CV</th> */}
                      <th className={cx("cv-column")}>CV</th>
                      <th className={cx("about-me-column")}>Về tôi</th>
                      <th>Mục tiêu nghề nghiệp</th>
                      <th className={cx("status-column")}>
                        Thay đổi trạng thái
                      </th>
                      <th className={cx("detail-column")}>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApplications[selectedJob?.job_id]
                      .filter((application) => application.status === activeTab)
                      .map((application) => (
                        <tr key={application.application_id}>
                          <td>{application.user.name || "Không có tên"}</td>
                          <td>{application.user.email || "Không có email"}</td>
                          <td>{application.user.phone || "Không có số điện thoại"}</td>
                          <td>
                            {application.candidate.location ||
                              "Không có địa điểm"}
                          </td>
                          {/* <td>
                            $
                            {application.candidate.current_salary ||
                              "Không có thông tin"}
                          </td> */}
                          {/* <td>{application.status || "Không có thông tin"}</td> */}
                          <td>
                            <a
                              href={application.candidate.CV_link}
                              className={cx("download-btn")}
                            >
                              Tải CV
                            </a>
                          </td>
                          <td>
                            {application.candidate.about_me ||
                              "Không có thông tin"}
                          </td>
                          <td>
                            {application.candidate.career_objective ||
                              "Không có thông tin"}
                          </td>
                          <td>
                            <select
                              value={application.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  application.application_id,
                                  e.target.value
                                )
                              }
                              className={cx("status-select")}
                            >
                              {APPLICATION_STATUS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              className={cx("action-btn", "detail")}
                              onClick={() =>
                                handleCandidateClick(
                                  application.candidate.candidate_id
                                )
                              }
                            >
                              <i className="fa-solid fa-eye"></i>
                              <span> Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có ứng viên nào cho công việc này.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get status icon
function getStatusIcon(status) {
  switch (status) {
    case 'Đang xét duyệt':
      return 'fa-solid fa-clock';
    case 'Chờ phỏng vấn':
      return 'fa-solid fa-calendar-check';
    case 'Đã phỏng vấn':
      return 'fa-solid fa-user-check';
    case 'Đạt phỏng vấn':
      return 'fa-solid fa-thumbs-up';
    case 'Đã nhận':
      return 'fa-solid fa-handshake';
    case 'Đã từ chối':
      return 'fa-solid fa-thumbs-down';
    case 'Hết hạn':
      return 'fa-solid fa-calendar-times';
    case 'Đã rút đơn':
      return 'fa-solid fa-user-slash';
    default:
      return 'fa-solid fa-question-circle';
  }
}

export default RecruiterCVManagement;
