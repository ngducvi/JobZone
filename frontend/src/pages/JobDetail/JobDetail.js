import React, { useEffect, useState, useRef } from "react";
import { authAPI, userApis } from "~/utils/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./JobDetail.module.scss";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";
import PopularKeywords from '~/components/PopularKeywords/PopularKeywords';
import useScrollTop from '~/hooks/useScrollTop';
import { toast } from "react-toastify";
const cx = classNames.bind(styles);

const JobDetail = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const { id } = useParams();
  console.log(id);
  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [withdrawnStatus, setWithdrawnStatus] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [userCvs, setUserCvs] = useState([]);
  const [candidateCvs, setCandidateCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [defaultCvId, setDefaultCvId] = useState(null);
  const [introduction, setIntroduction] = useState('');
  const [candidateStatus, setCandidateStatus] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await authAPI().get(userApis.getJobDetailByJobId(id));
      setJob(response.data.job);
      setCompany(response.data);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const savedResponse = await authAPI().get(userApis.getAllSavedJobsByUser);
        const candidateStatusResponse = await authAPI().get(userApis.checkCandidateStatus);
        setCandidateStatus(candidateStatusResponse.data.candidateStatus);
        const isJobSaved = savedResponse.data.savedJobs.some(
          savedJob => savedJob.job_id === id
        );
        setSavedStatus(isJobSaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    if (id) {
      checkSavedStatus();
    }
  }, [id]);

  useEffect(() => {
    const checkAppliedStatus = async () => {
      try {
        const response = await authAPI().get(userApis.checkApplicationStatus(id));
        setAppliedStatus(response.data.applied);
        setApplicationStatus(response.data.status);
        setUpdatedAt(response.data.updated_at);
        console.log("updated_at",response.data);
        setWithdrawnStatus(response.data.withdrawn);
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };

    checkAppliedStatus();
  }, [id]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); 

  // Fetch user's CVs
  useEffect(() => {
    const fetchCvs = async () => {
      try {
        const [userCvsResponse, candidateCvsResponse] = await Promise.all([
          authAPI().get(userApis.getAllUserCvByUserId),
          authAPI().get(userApis.getAllCandidateCvByUserId)
        ]);
        setUserCvs(userCvsResponse.data.userCv);
        setCandidateCvs(candidateCvsResponse.data.candidateCv);
      } catch (error) {
        console.error("Error fetching CVs:", error);
      }
    };
    fetchCvs();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/company-detail/${companyId}`);
  };

  const handleSaveJob = async () => {
    try {
      if (savedStatus) {
        await authAPI().delete(userApis.unsaveJob(id));
        setSavedStatus(false);
        toast.success("Đã hủy lưu công việc!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        await authAPI().post(userApis.saveJob(id));
        setSavedStatus(true);
        toast.success("Đã lưu công việc thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      window.dispatchEvent(new Event('user-data-update'));
    } catch (error) {
      console.error("Error toggling save status:", error);
      if (error.response?.data?.message === 'Bạn đã lưu công việc này rồi') {
        setSavedStatus(true);
      }
    }
  };

  const getRemainingDays = () => {
    if (!updatedAt) return 0;
    
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    
    // Reset time part to 00:00:00 to compare only dates
    updatedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    const requiredDays = applicationStatus === "Đã rút đơn" ? 7 : 30;
    const remainingDays = requiredDays - daysSinceUpdate;
    
    console.log('Debug remaining days:', {
      updatedAt,
      updatedDate: updatedDate.toISOString(),
      now: now.toISOString(),
      daysSinceUpdate,
      requiredDays,
      remainingDays,
      status: applicationStatus
    });
    
    return remainingDays > 0 ? remainingDays : 0;
  };

  const canApplyAgain = () => {
    if (!updatedAt) return false;
    
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    
    // Reset time part to 00:00:00 to compare only dates
    updatedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    const requiredDays = applicationStatus === "Đã rút đơn" ? 7 : 30;
    
    console.log('Debug can apply:', {
      updatedAt,
      updatedDate: updatedDate.toISOString(),
      now: now.toISOString(),
      daysSinceUpdate,
      requiredDays,
      status: applicationStatus
    });
    
    return daysSinceUpdate >= requiredDays;
  };

  const handleApplyClick = () => {
    setShowCvModal(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setSelectedCvId(null);
    }
  };

  const handleApplyJob = async () => {
    try {
      if (!selectedCvId && !uploadedFile) {
        toast.error("Vui lòng chọn CV hoặc tải lên CV mới");
          return;
        }

      let response;
      if (uploadedFile) {
        // Upload new CV
        const formData = new FormData();
        formData.append("cv_file", uploadedFile);
        formData.append("job_id", id);
        
        response = await authAPI().post(
          userApis.createCandidateCvWithCvId,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Use existing CV
        response = await authAPI().post(userApis.applyJob, { 
        job_id: id,
          cv_id: selectedCvId,
          previous_status: applicationStatus 
      });
      }

      if (response.data.code === 1) {
        toast.success("Nộp đơn thành công!");
        setShowCvModal(false);
        setAppliedStatus(true);
        setApplicationStatus("Đang xét duyệt");
        setUpdatedAt(new Date());
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi nộp đơn.");
    }
  };

  const handleWithdrawApplication = async () => {
    try {
      const response = await authAPI().post(userApis.withdrawApplication, { job_id: id });
      if (response.data.code === 1) {
        toast.success("Đơn ứng tuyển đã được hủy thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setAppliedStatus(false);
        setApplicationStatus("Đã rút đơn");
        setUpdatedAt(new Date());
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi hủy đơn ứng tuyển.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn ứng tuyển.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const isJobExpired = job?.deadline ? new Date(job.deadline).getTime() < new Date().getTime() : false;

  // Add function to handle setting default CV
  const handleSetDefaultCv = async (cvId, isUserCv) => {
    try {
      const response = await authAPI().put(
        isUserCv ? userApis.toggleUserCvTemplate(cvId) : userApis.toggleCvTemplate(cvId)
      );
      
      if (response.data.code === 1) {
        // Update the CV lists to reflect the new default status
        const [userCvsResponse, candidateCvsResponse] = await Promise.all([
          authAPI().get(userApis.getAllUserCvByUserId),
          authAPI().get(userApis.getAllCandidateCvByUserId)
        ]);
        setUserCvs(userCvsResponse.data.userCv);
        setCandidateCvs(candidateCvsResponse.data.candidateCv);
        setDefaultCvId(cvId);
        toast.success("Đã đặt làm CV mặc định thành công!");
      }
    } catch (error) {
      console.error("Error setting default CV:", error);
      toast.error("Có lỗi xảy ra khi đặt CV mặc định");
    }
  };

  const renderActionButton = () => {
    if (candidateStatus !== 'Active') {
      return (
        <button className={cx("apply-btn", "expired-btn", "account-inactive")} disabled>
          <i className="fas fa-lock"></i>
          Tài khoản chưa được kích hoạt
        </button>
      );
    }

    if (isJobExpired) {
      return (
        <button className={cx("apply-btn", "expired-btn")} disabled>
          <i className="fas fa-lock"></i>
          Đã đóng
        </button>
      );
    }

    if ((applicationStatus === "Đã rút đơn" || applicationStatus === "Đã từ chối") && !canApplyAgain()) {
      return (
        <button className={cx("apply-btn", "expired-btn")} disabled>
          <i className="fas fa-clock"></i>
          {`Có thể ứng tuyển lại sau ${getRemainingDays()} ngày`}
        </button>
      );
    }

    if ((applicationStatus === "Đã rút đơn" || applicationStatus === "Đã từ chối") && canApplyAgain()) {
      return (
        <button className={cx("apply-btn", "primary-btn")} onClick={handleApplyClick}>
          <i className="fas fa-redo"></i>
          Ứng tuyển lại
        </button>
      );
    }

    if (appliedStatus) {
      return (
        <div className={cx("applied-status")}>
          <button className={cx("apply-btn", "primary-btn")} disabled>
            <i className="fas fa-check"></i>
            Đã ứng tuyển
          </button>
          <button className={cx("withdraw-btn", "secondary-btn")} onClick={handleWithdrawApplication}>
            <i className="fas fa-times"></i>
            Rút đơn ứng tuyển
          </button>
        </div>
      );
    }

    return (
      <button className={cx("apply-btn", "primary-btn")} onClick={handleApplyClick}>
        <i className="fas fa-paper-plane"></i>
        Ứng tuyển ngay
      </button>
    );
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        {/* Left Column - Job Details */}
        <div className={cx("job-content")}>
          <div className={cx("job-header")}>
            <div className={cx("company-info")}>
              <img
                src={company?.companyLogo || images.company_1}
                alt=""
                className={cx("company-logo")}
              />
              <div className={cx("info")}>
                <h1 className={cx("job-title")}>{job?.title}</h1>
                <button
                  className={cx("company-name")}
                  onClick={() => handleCompanyClick(company?.company_id)}
                >
                  <i className="fas fa-building"></i>
                  {company?.companyName || "Công ty ABC"}
                </button>
                <div className={cx("deadline")}>
                  <i className="far fa-clock"></i>
                  Hạn nộp hồ sơ: {job?.deadline || "Không thời hạn"}
                </div>
              </div>
            </div>
            <div className={cx("action-buttons")}>
              {renderActionButton()}
              <button 
                className={cx("save-btn", "secondary-btn", { saved: savedStatus })}
                onClick={handleSaveJob}
              >
                <i className={`fa${savedStatus ? 's' : 'r'} fa-bookmark`}></i>
                {savedStatus ? 'Đã Lưu' : 'Lưu Tin'}
              </button>
            </div>
          </div>

          <div className={cx("job-overview")}>
            <div className={cx("overview-item")}>
              <i className="fas fa-sack-dollar"></i>
              <div className={cx("overview-content")}>
                <label>Mức lương</label>
                <span>{job?.salary || "Thỏa thuận"}</span>
              </div>
            </div>
            <div className={cx("overview-item")}>
              <i className="fas fa-map-marker-alt"></i>
              <div className={cx("overview-content")}>
                <label>Địa điểm</label>
                <span>{job?.location}</span>
              </div>
            </div>
            <div className={cx("overview-item")}>
              <i className="fas fa-briefcase"></i>
              <div className={cx("overview-content")}>
                <label>Kinh nghiệm</label>
                <span>{job?.experience || "Không yêu cầu"}</span>
              </div>
            </div>
          </div>

          <div className={cx("job-description")}>
            <h2>Chi tiết tuyển dụng</h2>
            <div className={cx("section")}>
              <h3>Mô tả công việc</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.description }} />
            </div>

            <div className={cx("section")}>
              <h3>Yêu cầu ứng viên</h3>
              <div
                dangerouslySetInnerHTML={{ __html: job?.job_requirements }}
              />
            </div>
            {/* thu nhập */}
            <div className={cx("section")}>
              <h3>Thu nhập</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.salary }} />
            </div>

            <div className={cx("section")}>
              <h3>Quyền lợi</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.benefits }} />
            </div>
            {/* địa điểm làm việc */}
            <div className={cx("section")}>
              <h3>Địa điểm làm việc</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.location }} />
            </div>
            {/* cách thức ứng tuyển  */}
            <div className={cx("section")}>
              <h3>Cách thức ứng tuyển</h3>
              Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới
              đây.
              {/* hạn nộp */}
              <div className={cx("deadline")}>
                Hạn nộp: {job?.deadline || "Không thời hạn"}
              </div>
            </div>
            <div className={cx("report-btn")}>
              <i className="fas fa-exclamation-triangle"></i>
              <span>Báo cáo tin tuyển dụng: Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo, hãy phản ánh với chúng tôi.</span>
            </div>
          </div>

          <div className={cx("job-analysis")}>
            <div className={cx("analysis-card")}>
              <div className={cx("card-header")}>
                <i className="fas fa-chart-line"></i>
                <h3>Phân tích mức độ phù hợp</h3>
                <span className={cx("match-rate")}>
                  <i className="fas fa-star"></i>
                  80% phù hợp
                </span>
              </div>

              <div className={cx("analysis-content")}>
                <div className={cx("analysis-item")}>
                  <div className={cx("question")}>
                    <i className="fas fa-check-circle"></i>
                    <span>Bạn phù hợp bao nhiêu % với việc làm này?</span>
                  </div>
                  <div className={cx("progress-bar")}>
                    <div 
                      className={cx("progress")} 
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                  <span className={cx("percentage")}>80%</span>
                </div>

                <div className={cx("analysis-item")}>
                  <div className={cx("question")}>
                    <i className="fas fa-exclamation-circle"></i>
                    <span>Đâu là điểm ít phù hợp nhất trong CV của bạn?</span>
                  </div>
                  <div className={cx("weakness-points")}>
                    <div className={cx("point")}>
                      <i className="fas fa-times"></i>
                      <span>Thiếu kinh nghiệm về Docker</span>
                    </div>
                    <div className={cx("point")}>
                      <i className="fas fa-times"></i>
                      <span>Chưa có chứng chỉ AWS</span>
                    </div>
                  </div>
                </div>

                <div className={cx("analysis-item")}>
                  <div className={cx("question")}>
                    <i className="fas fa-lightbulb"></i>
                    <span>Kỹ năng nào của bạn phù hợp, kỹ năng nào cần thiếu so với yêu cầu của NTD?</span>
                  </div>
                  <div className={cx("skills-analysis")}>
                    <div className={cx("matching-skills")}>
                      <h4>Kỹ năng phù hợp</h4>
                      <div className={cx("skill-tags")}>
                        <span className={cx("tag", "match")}>
                          <i className="fas fa-check"></i>
                          ReactJS
                        </span>
                        <span className={cx("tag", "match")}>
                          <i className="fas fa-check"></i>
                          JavaScript
                        </span>
                        <span className={cx("tag", "match")}>
                          <i className="fas fa-check"></i>
                          HTML/CSS
                        </span>
                      </div>
                    </div>
                    <div className={cx("missing-skills")}>
                      <h4>Kỹ năng còn thiếu</h4>
                      <div className={cx("skill-tags")}>
                        <span className={cx("tag", "missing")}>
                          <i className="fas fa-times"></i>
                          Docker
                        </span>
                        <span className={cx("tag", "missing")}>
                          <i className="fas fa-times"></i>
                          AWS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cx("upgrade-cta")}>
                  <button className={cx("upgrade-btn")}>
                    <i className="fas fa-crown"></i>
                    Xem ngay phân tích chi tiết
                  </button>
                  <span className={cx("price")}>
                    <span className={cx("original")}>20.000 VND</span>
                    <span className={cx("discount")}>10.000 VND</span>
                    <span className={cx("discount-tag")}>-50%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Company Info */}
        <div className={cx("company-profile")}>
          <div className={cx("company-card")}>
            <img src={company?.companyLogo || images.company_1} alt="" />
            <h3>{company?.companyName}</h3>
            <div className={cx("company-meta")}>
              <div>
                <i className="fas fa-user-friends"></i>
                <span>{company?.companySize || "100-499 nhân viên"}</span>
              </div>
              <div>
                <i className="fas fa-briefcase"></i>
                <span>{company?.companyIndustry || "Bán lẻ - Hàng tiêu dùng - FMCG"} </span>
              </div>
              <div>
                <i className="fas fa-map-marker-alt"></i>
                <span>{company?.companyAddress || "Hà Nội"}</span>
              </div>
            </div>
            <button
              className={cx("view-company")}
              onClick={() => handleCompanyClick(company?.companyId)}
            >
              Xem trang công ty <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          <div className={cx("job-overview-card")}>
            <h3>Thông tin chung</h3>
            <div className={cx("overview-items")}>
              <div className={cx("item")}>
                <i className="fas fa-chart-line"></i>
                <div>
                  <label>Cấp bậc</label>
                  <span>{job?.rank || "Nhân viên"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-graduation-cap"></i>
                <div>
                  <label>Học vấn</label>
                  <span>{job?.education || "Trung học phổ thông (Cấp 3) trở lên"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-users"></i>
                <div>
                  <label>Số lượng tuyển</label>
                  <span>{job?.quantity || "2 người"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-clock"></i>
                <div>
                  <label>Hình thức làm việc</label>
                  <span>{job?.working_time|| "Toàn thời gian"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={cx("related-categories")}>
            <h3>Danh mục Nghề liên quan</h3>
            <div className={cx("category-list")}>
              <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              <Link to="/jobs/ban-le">Bán lẻ/Bán sỉ</Link>
              <Link to="/jobs/ban-hang">Bán hàng/Dịch vụ khách hàng</Link>
              <Link to="/jobs/ban-le">Bán lẻ</Link>
            </div>
            {/* Kỹ năng cần có */}
            <div className={cx("required-skills")}>
              <h3>Kỹ năng cần có</h3>
              <div className={cx("category-list")}>
                <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              </div>
            </div>
            {/* Khu vực làm việc */}
            <div className={cx("work-location")}>
              <h3>Khu vực làm việc</h3>
              <div className={cx("category-list")}>
                <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('social-buttons')}>
        <button 
          className={cx('social-btn', 'facebook')} 
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-facebook-f"></i>
        </button>
        <button 
          className={cx('social-btn', 'twitter')}
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-twitter"></i>
        </button>
        <button 
          className={cx('social-btn', 'linkedin')}
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-linkedin-in"></i>
        </button>
        <button 
          className={cx('social-btn', 'copy-link', { copied })}
          onClick={handleCopyLink}
          title={copied ? 'Đã sao chép' : 'Sao chép liên kết'}
        >
          <i className={copied ? "fas fa-check" : "fas fa-link"}></i>
        </button>
      </div>
      <PopularKeywords />

      {/* CV Selection Modal */}
      {showCvModal && (
        <div className={cx("modal-overlay")} onClick={() => setShowCvModal(false)}>
          <div className={cx("modal-content")} onClick={(e) => e.stopPropagation()}>
            <div className={cx("modal-header")}>
              <h2>Chọn CV ứng tuyển</h2>
              <button className={cx("close-btn")} onClick={() => setShowCvModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={cx("modal-body")}>
              {/* Introduction Section */}
              <div className={cx("introduction-section")}>
                <h3>Thư giới thiệu</h3>
                <div className={cx("introduction-content")}>
                  <p className={cx("intro-tip")}>
                    <i className="fas fa-lightbulb"></i>
                    Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với nhà tuyển dụng.
                  </p>
                  <textarea
                    className={cx("intro-textarea")}
                    placeholder="Viết giới thiệu ngắn gọn về bản thân (điểm mạnh, điểm yếu) và nêu rõ mong muốn, lý do bạn muốn ứng tuyển cho vị trí này."
                    rows={4}
                    onChange={(e) => setIntroduction(e.target.value)}
                  />
                </div>
              </div>

              {/* Notice Section */}
              <div className={cx("notice-section")}>
                <h3>
                  <i className="fas fa-exclamation-circle"></i>
                  Lưu ý:
                </h3>
                <ul>
                  <li>
                    JobZone khuyến tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.
                  </li>
                  <li>
                    Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhận được liên lạc đáng ngờ của nhà tuyển dụng, hãy báo cáo ngay cho JobZone để được hỗ trợ kịp thời.
                  </li>
                </ul>
              </div>

              {/* Created CVs Section */}
              {userCvs.length > 0 && (
                <div className={cx("cv-section")}>
                  <h3>CV đã tạo</h3>
                  <div className={cx("cv-list")}>
                    {userCvs.map((cv) => (
                      <div
                        key={cv.cv_id}
                        className={cx("cv-item", { selected: selectedCvId === cv.cv_id })}
                        onClick={() => {
                          setSelectedCvId(cv.cv_id);
                          setUploadedFile(null);
                        }}
                      >
                        <div className={cx("cv-info")}>
                          <i className="fas fa-file-alt"></i>
                          <div>
                            <h4>{cv.cv_name || "CV không có tiêu đề"}</h4>
                            <p>Cập nhật: {new Date(cv.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={cx("cv-actions")}>
                          {selectedCvId === cv.cv_id && (
                            <i className="fas fa-check-circle"></i>
                          )}
                          <button
                            className={cx("default-btn", { active: cv.is_template })}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultCv(cv.cv_id, true);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            {cv.is_template ? "Mặc định" : "Đặt làm mặc định"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded CVs Section */}
              {candidateCvs.length > 0 && (
                <div className={cx("cv-section")}>
                  <h3>CV đã tải lên</h3>
                  <div className={cx("cv-list")}>
                    {candidateCvs.map((cv) => (
                      <div
                        key={cv.cv_id}
                        className={cx("cv-item", { selected: selectedCvId === cv.cv_id })}
                        onClick={() => {
                          setSelectedCvId(cv.cv_id);
                          setUploadedFile(null);
                        }}
                      >
                        <div className={cx("cv-info")}>
                          <i className="fas fa-file-pdf"></i>
                          <div>
                            <h4>{cv.cv_name || "CV không có tiêu đề"}</h4>
                            <p>Cập nhật: {new Date(cv.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={cx("cv-actions")}>
                          {selectedCvId === cv.cv_id && (
                            <i className="fas fa-check-circle"></i>
                          )}
                          <button
                            className={cx("default-btn", { active: cv.is_template })}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefaultCv(cv.cv_id, false);
                            }}
                          >
                            <i className="fas fa-star"></i>
                            {cv.is_template ? "Mặc định" : "Đặt làm mặc định"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New CV Section */}
              <div className={cx("cv-section")}>
                <h3>Tải lên CV mới</h3>
                <div className={cx("upload-area", { active: uploadedFile })}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                  />
                  {uploadedFile ? (
                    <div className={cx("uploaded-file")}>
                      <div className={cx("file-info")}>
                        <i className="fas fa-file-pdf"></i>
                        <div>
                          <h4>{uploadedFile.name}</h4>
                          <p>{Math.round(uploadedFile.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        className={cx("remove-file")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                          fileInputRef.current.value = "";
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      className={cx("upload-placeholder")}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Nhấp để tải lên CV của bạn</p>
                      <span>Hỗ trợ: PDF, DOC, DOCX (Tối đa 5MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={cx("modal-footer")}>
              <button
                className={cx("cancel-btn", "secondary-btn")}
                onClick={() => setShowCvModal(false)}
              >
                Hủy
              </button>
              <button
                className={cx("apply-btn", "primary-btn")}
                onClick={handleApplyJob}
                disabled={!selectedCvId && !uploadedFile}
              >
                <i className="fas fa-paper-plane"></i>
                Nộp đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;