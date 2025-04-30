import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./RecruiterCVManagement.module.scss";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import images from "~/assets/images";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsCheckingLicense(true);
        // Fetch company info
        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
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
          console.log("jobApplications", applications);
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
      <div className={cx("header-section")}>
        <div className={cx("title-section")}>
          <h1>Quản lý CV Ứng Viên</h1>
          <button
            className={cx("create-job-btn")}
            onClick={() => navigate("/recruiter/post-job")}
          >
            <i className="fa-solid fa-plus"></i>
            Đăng tin tuyển dụng
          </button>
        </div>
      </div>

      <div className={cx("content-section")}>
        <div className={cx("filter-section")}>
          <div className={cx("tabs")}>
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
                  <i className="fa-solid fa-eye"></i>
                  {job.views || 0} lượt xem
                </span>
                <span>
                  <i className="fa-solid fa-users"></i>
                  {jobApplications[job.job_id]?.length || 0} ứng viên
                </span>
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
              <button
                className={cx("close-btn")}
                onClick={() => setShowModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className={cx("modal-content")}>
              <div className={cx("tabs")}>
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
                      <th className={cx("location-column")}>Địa điểm</th>
                      <th className={cx("salary-column")}>Lương</th>
                      <th className={cx("status-column-cv")}>Trạng thái CV</th>
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
                          <td>
                            {application.candidate.location ||
                              "Không có địa điểm"}
                          </td>
                          <td>
                            $
                            {application.candidate.current_salary ||
                              "Không có thông tin"}
                          </td>
                          <td>{application.status || "Không có thông tin"}</td>
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

export default RecruiterCVManagement;
