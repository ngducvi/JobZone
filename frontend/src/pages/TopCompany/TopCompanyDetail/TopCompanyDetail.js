// TopCompanyDetail page
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./TopCompanyDetail.module.scss";
import classNames from "classnames/bind";
import { authAPI, userApis } from "~/utils/api";
import { useParams } from "react-router-dom";
import images from "~/assets/images";
import { LoadingSpinner, CompanySkeleton } from "~/components/Loading/Loading";
import { useNavigate } from "react-router-dom";

const cx = classNames.bind(styles);

function TopCompanyDetail() {
  const navigate = useNavigate();
  const { company } = useParams();
  const [companyDetail, setCompanyDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [savedStatus, setSavedStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(
          userApis.getCompanyDetailByCompanyId(company)
        );
        const jobsResponse = await authAPI().get(
          userApis.getAllJobsByCompanyId(company)
        );
        setCompanyDetail(response.data.company);
        console.log(response.data.company);
        setJobs(jobsResponse.data.jobs);
      } catch (error) {
        console.error("Error fetching company detail:", error);
      }
    };
    fetchData();
  }, [company]);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const savedResponse = await authAPI().get(
          userApis.getAllSavedJobsByUser
        );
        const initialSavedStatus = {};
        savedResponse.data.savedJobs.forEach((job) => {
          initialSavedStatus[job.job_id] = true;
        });
        setSavedStatus(initialSavedStatus);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
    fetchSavedStatus();
  }, []);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!jobId) return;

    try {
      if (savedStatus[jobId]) {
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus((prev) => ({ ...prev, [jobId]: false }));
      } else {
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus((prev) => ({ ...prev, [jobId]: true }));
      }
      window.dispatchEvent(new Event("user-data-update"));
    } catch (error) {
      console.error("Error toggling job save status:", error);
      if (error.response?.data?.message === "Bạn đã lưu công việc này rồi") {
        setSavedStatus((prev) => ({ ...prev, [jobId]: true }));
      }
    }
  };

  const handleJobClick = async (jobId) => {
    try {
      await authAPI().post(userApis.addViewedJob(jobId));
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error("Error handling job click:", error);
    }
  };

  // Tính toán jobs cho trang hiện tại
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Thêm hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.querySelector(`.${cx('job-grid')}`).offsetTop - 100,
      behavior: 'smooth'
    });
  };

  if (isLoading) {
    return <CompanySkeleton />;
  }

  if (!companyDetail) {
    return <LoadingSpinner />;
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("hero-section")}>
        <div className={cx("company-card")}>
          <div className={cx("company-banner")}>
            <img src={companyDetail?.banner || images.banner} alt="Banner" />
            <div className={cx("overlay")}></div>
          </div>

          <div className={cx("company-intro")}>
            <div className={cx("logo-container")}>
              <img src={companyDetail?.logos || images.company_1} alt="Logo" />
              <div className={cx("pulse-effect")}></div>
            </div>

            <div className={cx("company-stats")}>
              <h1>{companyDetail?.company_name}</h1>
              <div className={cx("stat-badges")}>
                <div className={cx("badge", "employees")}>
                  <i className="fas fa-users-gear"></i>
                  <span>{companyDetail?.company_emp || "250+"} Nhân viên</span>
                </div>
                <div className={cx("badge", "location")}>
                  <i className="fas fa-location-crosshairs"></i>
                  <span>{companyDetail?.address}</span>
                </div>
                <div className={cx("badge", "jobs")}>
                  <i className="fas fa-briefcase-clock"></i>
                  <span>{jobs.length} Vị trí đang tuyển</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cx("content-grid")}>
        <div className={cx("main-content")}>
          <div className={cx("info-card", "about")}>
            <div className={cx("card-header")}>
              <i className="fas fa-building-circle-check"></i>
              <h2>Giới thiệu công ty</h2>
            </div>
            <div
              className={cx("card-content")}
              dangerouslySetInnerHTML={{ __html: companyDetail?.description }}
            />
          </div>
          <div className={cx("info-card", "jobs")}>
            <div className={cx("card-header")}>
              <i className="fas fa-briefcase-clock"></i>
              <h2>Vị trí đang tuyển</h2>
            </div>
            <div className={cx("job-grid")}>
              {currentJobs.map((job, index) => (
                <div
                  key={index}
                  className={cx("job-card")}
                  onClick={() => handleJobClick(job.job_id)}
                >
                  <div className={cx("job-header")}>
                    <div className={cx("company-logo")}>
                      <img
                        src={companyDetail?.logos || images.company_1}
                        alt="Logo"
                      />
                    </div>
                    <div className={cx("job-info")}>
                      <h3 className={cx("job-title")}>{job?.title}</h3>
                      <div className={cx("company-name")}>
                        {companyDetail?.company_name}
                      </div>
                    </div>
                  </div>

                  <div className={cx("job-meta")}>
                    <span>
                      <i className="fas fa-sack-dollar"></i>
                      {job?.salary}
                    </span>
                    <span>
                      <i className="fas fa-location-dot"></i>
                      {job?.location}
                    </span>
                    <span>
                      <i className="fas fa-briefcase"></i>
                      {job?.experience}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i>
                      {job?.working_time}
                    </span>
                  </div>

                  <div className={cx("job-tags")}>
                    <span className={cx("tag", "working-time")}>
                      {job?.working_time}
                    </span>
                    <span className={cx("tag", "rank")}>{job?.rank}</span>
                    {job?.status === "Pending" && (
                      <span className={cx("tag", "urgent")}>Gấp</span>
                    )}
                  </div>

                  <div className={cx("job-actions")}>
                    <button
                      className={cx("save-btn", {
                        saved: savedStatus[job.job_id],
                      })}
                      onClick={(e) => handleSaveJob(e, job.job_id)}
                    >
                      <i
                        className={`fa${savedStatus[job.job_id] ? "s" : "r"} fa-bookmark`}
                      ></i>
                      <span className={cx("default-text")}>
                        {savedStatus[job.job_id] ? "Đã Lưu" : "Lưu Tin"}
                      </span>
                      <span className={cx("hover-text")}>
                        {savedStatus[job.job_id] ? "Hủy Lưu" : "Lưu Tin"}
                      </span>
                    </button>
                    <button className={cx("apply-btn", "primary-btn")}>
                      <i className="fas fa-paper-plane"></i>
                      {job?.status === "Pending" ? "Ứng tuyển ngay" : "Đã đóng"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={cx("pagination")}>
                <button 
                  className={cx("page-btn", { disabled: currentPage === 1 })}
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    className={cx("page-btn", { active: currentPage === index + 1 })}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className={cx("page-btn", { disabled: currentPage === totalPages })}
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className={cx("sidebar")}>
          <div className={cx("info-card", "contact")}>
            <div className={cx("card-header")}>
              <i className="fas fa-address-card"></i>
              <h3>Thông tin liên hệ</h3>
            </div>
            <div className={cx("contact-list")}>
              {companyDetail?.website && (
                <a
                  href={companyDetail.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cx("contact-item", "website")}
                >
                  <i className="fas fa-globe-asia"></i>
                  <span>{companyDetail.website}</span>
                </a>
              )}
              
              <div className={cx("contact-item", "address")}>
                <i className="fas fa-map-location-dot"></i>
                <span>{companyDetail?.address || "Chưa cập nhật địa chỉ"}</span>
              </div>
              
              <div className={cx("contact-item", "size")}>
                <i className="fas fa-chart-network"></i>
                <span>{companyDetail?.company_emp || "0"} nhân viên</span>
              </div>
            </div>
          </div>

          <div className={cx("info-card", "share")}>
            <div className={cx("card-header")}>
              <i className="fas fa-share-nodes"></i>
              <h3>Chia sẻ thông tin</h3>
            </div>
            <div className={cx("share-buttons")}>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cx("share-btn", "facebook")}
              >
                <i className="fab fa-facebook"></i>
                <span>Facebook</span>
              </a>
              
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cx("share-btn", "linkedin")}
              >
                <i className="fab fa-linkedin"></i>
                <span>LinkedIn</span>
              </a>
              
              <a
                href={`https://twitter.com/intent/tweet?url=${window.location.href}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cx("share-btn", "twitter")}
              >
                <i className="fab fa-twitter"></i>
                <span>Twitter</span>
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default TopCompanyDetail;
