import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./RecruiterHome.module.scss";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { navigate } from "react-router-dom";
import {
  faStar,
  faCrown,
  faGem,
  faEye,
  faCheck,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

// Define plan details
const planDetails = {
  Basic: { color: "#f0ad4e", icon: faStar },
  Pro: { color: "#5bc0de", icon: faCrown },
  ProMax: { color: "#d9534f", icon: faGem },
};

function RecruiterHome() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [recruiter, setRecruiter] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalActiveJobs, setTotalActiveJobs] = useState(0);
  const [totalApplications7DaysAgo, setTotalApplications7DaysAgo] = useState(0);
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalViews: 0,
    totalSaved: 0,
    totalCVs: 0,
  });
  const [plan, setPlan] = useState("Basic");
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState({});
  const token = localStorage.getItem("token");
  const [hasBusinessLicense, setHasBusinessLicense] = useState(false);

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

      // Cập nhật state jobApplications sau khi thay đổi trạng thái
      setJobApplications(prevState => {
        const newState = { ...prevState };
        // Tìm và cập nhật application trong tất cả các job
        Object.keys(newState).forEach(jobId => {
          newState[jobId] = newState[jobId].map(application => 
            application.application_id === applicationId 
              ? { ...application, status: newStatus }
              : application
          );
        });
        return newState;
      });

      toast.success(`Đã cập nhật trạng thái ứng viên thành ${newStatus}`);
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setRecruiter(response.data.user);

        // Get recruiter company info
        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
        
        // Check if company exists, if not create one
        if (!responseCompany.data.companies || responseCompany.data.companies.length === 0) {
          console.log("No company found, creating one...");
          try {
            // Create default company for recruiter
            await authAPI().post(recruiterApis.createRecruiterCompany, {
              name: response.data.user.name ? `Công ty của ${response.data.user.name}` : "Công ty của bạn",
              address: "",
              website: "",
              description: "",
              logo: null,
              banner: null,
              size: "Nhỏ hơn 20",
              company_emp: 10
            });
            
            // Fetch updated company info
            const updatedCompanyResponse = await authAPI().get(
              recruiterApis.getAllRecruiterCompanies
            );
            
            if (updatedCompanyResponse.data.companies && updatedCompanyResponse.data.companies.length > 0) {
              setCompanyInfo(updatedCompanyResponse.data.companies[0]);
              setPlan(updatedCompanyResponse.data.companies[0].plan);
            }
          } catch (error) {
            console.error("Error creating company:", error);
          }
        } else {
          setCompanyInfo(responseCompany.data.companies[0]);
          setPlan(responseCompany.data.companies[0].plan);
        }
      } catch (error) {
        console.error("Error fetching recruiter data:", error);
      }
    };
    
    if (token) {
      fetchData();
    }
  }, [token, setUser]);

  // Separate useEffect to fetch company-related data when companyInfo changes
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyInfo) return;
      
      try {
        // Check business license
        const responseCheckLicense = await authAPI().get(
          recruiterApis.checkBusinessLicense(companyInfo.company_id)
        );
        setHasBusinessLicense(responseCheckLicense.data.businessLicense);

        // get jobs for this company
        const responseJob = await authAPI().get(
          recruiterApis.getAllJobsByCompanyId(companyInfo.company_id)
        );
        setJobs(responseJob.data.jobs);
        
        // get applications for each job
        const applications = {};
        for (const job of responseJob.data.jobs) {
          const responseJobApplications = await authAPI().get(
            recruiterApis.getAllJobApplicationsByJobId(job.job_id)
          );
          applications[job.job_id] =
            responseJobApplications.data.jobApplications;
        }
        setJobApplications(applications);
        
        // get dashboard stats
        const responseJobs = await authAPI().get(
          recruiterApis.getDashboardStats
        );
        setTotalJobs(responseJobs.data.totalJobs);
        setTotalApplications(responseJobs.data.totalApplications);
        setTotalActiveJobs(responseJobs.data.totalActiveJobs);
        setTotalApplications7DaysAgo(
          responseJobs.data.totalApplications7DaysAgo
        );
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchCompanyData();
  }, [companyInfo]);

  return (
    <div className={cx("wrapper")}>
      {!hasBusinessLicense && (
        <div className={cx("license-warning")}>
          <div className={cx("warning-content")}>
            <i className="fa-solid fa-exclamation-triangle"></i>
            <div className={cx("warning-text")}>
              <h3>Cập nhật giấy phép kinh doanh</h3>
              <p>Vui lòng cập nhật thông tin giấy phép kinh doanh để sử dụng đầy đủ tính năng</p>
            </div>
            <button 
              className={cx("update-btn")}
              onClick={() => navigate("/recruiter/settings", { state: { activeTab: 'license' } })}
            >
              Cập nhật ngay
            </button>
          </div>
        </div>
      )}
      
      <div className={cx("user-info")}>
        <div className={cx("user-header")}>
          <Avatar src={recruiter?.avatar || images.avatar} alt="Avatar" />
          <div className={cx("user-details")}>
            <h2>{recruiter?.name || "Chưa cập nhật"}</h2>
            <p className={cx("user-id")}>Mã NTD: {recruiter?.id || "N/A"}</p>
            <div className={cx("user-contact")}>
              <span>
                <i className="fa-regular fa-envelope"></i> {recruiter?.email}
              </span>
              <span>
                <i className="fa-solid fa-phone"></i>{" "}
                {recruiter?.phone || "Chưa cập nhật"}
              </span>
            </div>
          </div>
          <div className={cx("membership-info")}>
            <div className={cx("membership-level")}>
              <span style={{ color: planDetails[plan]?.color }}>
                <FontAwesomeIcon icon={planDetails[plan]?.icon} /> Gói:{" "}
                {plan || "Chưa có gói nào"}
              </span>
              <span className={cx("level")}>Hạng Công ty</span>
            </div>
          </div>
        </div>

        <div className={cx("stats-section")}>
          <div className={cx("stats-grid")}>
            <div className={cx("stat-card")}>
              <i className="fa-solid fa-file-lines"></i>
              <div className={cx("stat-info")}>
                <span className={cx("stat-value")}>{totalJobs}</span>
                <span className={cx("stat-label")}>Tin tuyển dụng</span>
              </div>
            </div>
            <div className={cx("stat-card")}>
              <i className="fa-solid fa-users"></i>
              <div className={cx("stat-info")}>
                <span className={cx("stat-value")}>{totalApplications}</span>
                <span className={cx("stat-label")}>CV tiếp nhận</span>
              </div>
            </div>
            <div className={cx("stat-card")}>
              <i className="fa-solid fa-briefcase"></i>
              <div className={cx("stat-info")}>
                <span className={cx("stat-value")}>{totalActiveJobs}</span>
                <span className={cx("stat-label")}>Tin đang hiển thị</span>
              </div>
            </div>
            <div className={cx("stat-card")}>
              <i className="fa-solid fa-eye"></i>
              <div className={cx("stat-info")}>
                <span className={cx("stat-value")}>
                  {totalApplications7DaysAgo}
                </span>
                <span className={cx("stat-label")}>CV mới (7 ngày)</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cx("toppy-ai-section")}>
          <div className={cx("ai-card")}>
            <h3>Đề xuất từ Toppy AI</h3>
            <p>Tự động phân tích bằng công nghệ trí tuệ nhân tạo</p>
            <button className={cx("ai-btn")}>
              <i className="fa-solid fa-robot"></i>
              Tôi ưu thiết lập
            </button>
            <button className={cx("view-all-btn")}>XEM TẤT CẢ ĐỀ XUẤT</button>
          </div>

          <div className={cx("service-card")}>
            <h3>Dịch vụ sắp hết hạn</h3>
            <p>Hiện không có dịch vụ nào sắp hết hạn</p>
            <button className={cx("manage-btn")}>QUẢN LÝ DỊCH VỤ</button>
          </div>
        </div>

        <div className={cx("company-info")}>
          <div className={cx("company-header")}>
            <div className={cx("company-logo")}>
              <img
                src={companyInfo?.logo || images.company_info}
                alt="Company Logo"
              />
            </div>
            <div className={cx("company-main-info")}>
              <h3>
                {companyInfo?.company_name || "Chưa cập nhật tên công ty"}
              </h3>
              <div className={cx("company-meta")}>
                <span>
                  <i className="fa-solid fa-users"></i>
                  {companyInfo?.company_emp || 0} nhân viên
                </span>
                <span>
                  <i className="fa-solid fa-building"></i>
                  Mã công ty: {companyInfo?.company_id || "N/A"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowCompanyInfo(!showCompanyInfo)}
              className={cx("view-company-btn")}
            >
              {showCompanyInfo ? (
                <>
                  <i className="fa-solid fa-chevron-up"></i>
                  Thu gọn
                </>
              ) : (
                <>
                  <i className="fa-solid fa-chevron-down"></i>
                  Xem chi tiết
                </>
              )}
            </button>
          </div>

          {showCompanyInfo && (
            <div className={cx("company-details")}>
              <div className={cx("detail-section")}>
                <h4>Giới thiệu công ty</h4>
                <p>{companyInfo?.description || "Chưa có mô tả"}</p>
              </div>

              <div className={cx("detail-grid")}>
                <div className={cx("detail-item")}>
                  <i className="fa-solid fa-location-dot"></i>
                  <div>
                    <label>Địa chỉ</label>
                    <p>{companyInfo?.address || "Chưa cập nhật địa chỉ"}</p>
                  </div>
                </div>

                <div className={cx("detail-item")}>
                  <i className="fa-solid fa-globe"></i>
                  <div>
                    <label>Website</label>
                    <a
                      href={companyInfo?.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {companyInfo?.website || "Chưa có website"}
                    </a>
                  </div>
                </div>

                <div className={cx("detail-item")}>
                  <i className="fa-regular fa-calendar"></i>
                  <div>
                    <label>Ngày thành lập</label>
                    <p>
                      {new Date(companyInfo?.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>

                <div className={cx("detail-item")}>
                  <i className="fa-solid fa-arrows-rotate"></i>
                  <div>
                    <label>Cập nhật lần cuối</label>
                    <p>
                      {new Date(
                        companyInfo?.last_modified_at
                      ).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* recent job_applications */}
        <div className={cx("recent-job-applications")}>
          <h3>Tin tuyển dụng mới nhất</h3>
          <div className={cx("jobs-container")}>
            {jobs.slice(0, 5).map((job) => (
              <div key={job.job_id} className={cx("job-section")}>
                <div className={cx("job-header")}>
                  <h4>{job.title}</h4>
                  <div className={cx("job-meta")}>
                    <span>
                      <i className="fa-solid fa-users"></i>
                      {jobApplications[job.job_id]?.length || 0} ứng viên
                    </span>
                    <span>
                      <i className="fa-solid fa-clock"></i>
                      Hết hạn: {new Date(job.deadline).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
                
                <div className={cx("applicants-list")}>
                  {jobApplications[job.job_id]?.length > 0 ? (
                    jobApplications[job.job_id].slice(0, 3).map((application) => (
                      <div
                        key={application.application_id}
                        className={cx("applicant-card")}
                      >
                        <img
                          src={application.candidate.profile_picture || images.avatar}
                          alt={application.user.name}
                          className={cx("applicant-avatar")}
                        />
                        <div className={cx("applicant-info")}>
                          <h5>{application.user.name || "Không có tên"}</h5>
                          <p className={cx("location")}>
                            <i className="fa-solid fa-location-dot"></i>
                            {application.candidate.location || "Không có địa điểm"}
                          </p>
                          <p className={cx("salary")}>
                            <i className="fa-solid fa-money-bill"></i>
                            {application.candidate.current_salary || "Chưa cập nhật"} / giờ
                          </p>
                          <div className={cx("tags")}>
                            {Array.isArray(application.candidate.skills) ? (
                              application.candidate.skills.slice(0, 3).map((skill, index) => (
                                <span key={index}>{skill}</span>
                              ))
                            ) : (
                              <>
                                <span>App</span>
                                <span>Design</span>
                                <span>Digital</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={cx("applicant-actions")}>
                          <button 
                            className={cx("action-btn", "view")}
                            onClick={() => navigate(`/recruiter/candidate-detail/${application.candidate.candidate_id}`)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button 
                            className={cx("action-btn", "approve")}
                            onClick={() => handleStatusChange(application.application_id, "Đạt phỏng vấn")}
                          >
                            <FontAwesomeIcon icon={faCheck} />
                          </button>
                          <button 
                            className={cx("action-btn", "reject")}
                            onClick={() => handleStatusChange(application.application_id, "Đã từ chối")}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={cx("no-applicants")}>
                      <i className="fa-solid fa-user-slash"></i>
                      <p>Chưa có ứng viên nào</p>
                    </div>
                  )}
                  {jobApplications[job.job_id]?.length > 3 && (
                    <button 
                      className={cx("view-all-btn")}
                      onClick={() => navigate("/recruiter/cv-management")}
                    >
                      Xem tất cả {jobApplications[job.job_id].length} ứng viên
                    </button>
                  )}
                </div>
              </div>
            ))}
            {jobs.length > 5 && (
              <button 
                className={cx("view-more-jobs")}
                onClick={() => navigate("/recruiter/jobs")}
              >
                Xem thêm {jobs.length - 5} tin tuyển dụng khác
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterHome;
