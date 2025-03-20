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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setRecruiter(response.data.user);

        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
        setCompanyInfo(responseCompany.data.companies[0]);
        setPlan(responseCompany.data.companies[0].plan);
        console.log("plan", plan);

        // Check business license
        const responseCheckLicense = await authAPI().get(
          recruiterApis.checkBusinessLicense(responseCompany.data.companies[0].company_id)
        );
        setHasBusinessLicense(responseCheckLicense.data.businessLicense);

        // get business licenses
        const responseBusinessLicenses = await authAPI().get(
          recruiterApis.getBusinessLicensesByCompanyId("7")
        );
        console.log(
          "businessLicenses",
          responseBusinessLicenses.data.businessLicenses
        );

        //
        const responseJob = await authAPI().get(
          recruiterApis.getAllJobsByCompanyId(
            responseCompany.data.companies[0].company_id
          )
        );
        setJobs(responseJob.data.jobs);
        //
        const applications = {};
        for (const job of responseJob.data.jobs) {
          const responseJobApplications = await authAPI().get(
            recruiterApis.getAllJobApplicationsByJobId(job.job_id)
          );
          applications[job.job_id] =
            responseJobApplications.data.jobApplications;
        }
        setJobApplications(applications);
        console.log("jobApplications", applications);

        // get total jobs
        const responseJobs = await authAPI().get(
          recruiterApis.getDashboardStats
        );
        setTotalJobs(responseJobs.data.totalJobs);
        setTotalApplications(responseJobs.data.totalApplications);
        setTotalActiveJobs(responseJobs.data.totalActiveJobs);
        setTotalApplications7DaysAgo(
          responseJobs.data.totalApplications7DaysAgo
        );

        // Lấy thống kê
        const statsResponse = await authAPI().get(
          recruiterApis.getDashboardStats
        );
      } catch (error) {
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        console.log(error);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token, setUser]);

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
            <div className={cx("membership-points")}>
              <div className={cx("point-row")}>
                <span>Basic</span>
                <span>Pro</span>
                <span>ProMax</span>
              </div>
              <div className={cx("point-values")}>
                <span>{recruiter?.points || 0}</span>
                <span>200</span>
                <span>800</span>
              </div>
              <div className={cx("progress-bar")}>
                <div
                  className={cx("progress")}
                  style={{ width: `${(recruiter?.points / 800) * 100}%` }}
                ></div>
              </div>
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
          <div className={cx("job-list")}>
            {Object.keys(jobApplications).map((jobId) => (
              <div key={jobId}>
                {jobApplications[jobId].map((application) => (
                  <div
                    key={application.application_id}
                    className={cx("applicant-card")}
                  >
                    <img
                      src={application.candidate.profile_picture}
                      alt={application.candidate.name}
                    />
                    <div>
                      <h3>{application.user.name || "Không có tên"}</h3>
                      <p>
                        {application.candidate.location || "Không có địa điểm"}
                      </p>
                      <p>
                        $
                        {application.candidate.current_salary ||
                          "Không có thông tin"}{" "}
                        / hour
                      </p>
                      <div className={cx("tags")}>
                        <span>App</span>
                        <span>Design</span>
                        <span>Digital</span>
                      </div>
                    </div>
                    <div className={cx("applicant-actions")}>
                      <button className={cx("action-btn")}>
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button className={cx("action-btn")}>
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button className={cx("action-btn")}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                      <button className={cx("action-btn")}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecruiterHome;
