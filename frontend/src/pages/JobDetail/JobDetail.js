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
import { FaRobot, FaLock, FaSpinner, FaUserCheck, FaChartBar, FaQuestionCircle, FaMoneyBillWave } from "react-icons/fa";
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
  
  // AI Analysis related states
  const [userPlan, setUserPlan] = useState('Basic');
  const [aiAccess, setAiAccess] = useState({ canUseAI: false, features: [], plan: 'Basic' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAiSection, setShowAiSection] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [selectedAiModel, setSelectedAiModel] = useState("gemini-2.0-flash");

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

  // Fetch user plan information and candidate profile for AI features
  useEffect(() => {
    const fetchUserPlanAndProfile = async () => {
      try {
        // Check user's plan
        const planResponse = await authAPI().get(userApis.checkUserPlan);
        if (planResponse.data.aiAccess) {
          setAiAccess(planResponse.data.aiAccess);
          setUserPlan(planResponse.data.aiAccess.plan);
        }

        // Get candidate profile for AI analysis
        const userResponse = await authAPI().get(userApis.getCurrentUser);
        if (userResponse.data.candidate) {
          setCandidateProfile({
            skills: userResponse.data.candidate.skills,
            experience: userResponse.data.candidate.experience,
            education: userResponse.data.candidate.education,
            current_job_title: userResponse.data.candidate.current_job_title,
            current_company: userResponse.data.candidate.current_company,
            location: userResponse.data.candidate.location,
          });
        }
      } catch (error) {
        console.error("Error fetching user plan or profile:", error);
      }
    };

    fetchUserPlanAndProfile();
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
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file PDF, DOC, DOCX", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        event.target.value = '';
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File không được vượt quá 5MB", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        event.target.value = '';
        return;
      }

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
        formData.append("user_id", localStorage.getItem("userId"));
        formData.append("cv_name", uploadedFile.name);
        
        // First upload the CV file
        const uploadResponse = await authAPI().post(
          userApis.createCandidateCvWithCvId,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        if (uploadResponse.data.code === 1) {
          // Then apply for the job with the uploaded CV URL
          const cvLink = uploadResponse.data.candidateCv.cv_link;
          const cvId = uploadResponse.data.candidateCv.cv_id;
          
          response = await authAPI().post(userApis.applyJob, { 
            job_id: id,
            resume_url: cvLink,
            cv_id: cvId,
            cv_type: 'uploaded',
            previous_status: applicationStatus 
          });
      } else {
          throw new Error("Failed to upload CV");
        }
      } else {
        // Use existing CV - determine if it's a user-created CV or an uploaded one
        const isUserCreatedCv = userCvs.some(cv => cv.cv_id === selectedCvId);
        
        response = await authAPI().post(userApis.applyJob, { 
          job_id: id,
          cv_id: selectedCvId,
          cv_type: isUserCreatedCv ? 'created' : 'uploaded',
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

  // Function to handle AI job analysis
  const handleAnalyzeJob = async () => {
    if (!job || !candidateProfile) {
      toast.error("Missing job or candidate information");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Ensure job_id and all relevant fields are sent
      const response = await authAPI().post(userApis.analyzeJobForCandidate, {
        job: {
          job_id: job.job_id,
          title: job.title,
          company_name: company?.companyName || job.company_name,
          description: job.description,
          job_requirements: job.job_requirements,
          salary: job.salary,
          location: job.location,
          benefits: job.benefits,
        },
        candidateProfile,
        model: selectedAiModel
      });

      setAnalysisResult(response.data);
      setShowAiSection(true);
    } catch (error) {
      console.error("Error analyzing job:", error);
      toast.error("Could not analyze job. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Function to toggle AI analysis section
  const toggleAiSection = () => {
    setShowAiSection(!showAiSection);
    if (!analysisResult && showAiSection === false) {
      handleAnalyzeJob();
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

  // Render AI analysis section based on user's plan
  const renderAiAnalysisSection = () => {
    if (!aiAccess.canUseAI) {
      return (
        <div className={cx("ai-analysis-locked")}>
          <div className={cx("lock-icon")}>
            <FaLock />
          </div>
          <h3>AI Job Analysis</h3>
          <p>Upgrade to Basic or higher plan to unlock AI-powered job analysis</p>
          <button className={cx("upgrade-btn")} onClick={() => navigate("/pricing")}>
            Upgrade Plan
          </button>
        </div>
      );
    }

    return (
      <div className={cx("ai-analysis-section", { active: showAiSection })}>
        <div className={cx("ai-analysis-header")} onClick={toggleAiSection}>
          <div className={cx("ai-icon")}>
            <FaRobot />
          </div>
          <h3>Phân tích công việc bằng AI</h3>
          <div className={cx("ai-plan-badge", userPlan.toLowerCase())}>
            {userPlan}
          </div>
        </div>

        {showAiSection && (
          <div className={cx("ai-analysis-content")}>
            {isAnalyzing ? (
              <div className={cx("ai-loading")}>
                <FaSpinner className={cx("spinner")} />
                <p>Đang phân tích chi tiết công việc...</p>
              </div>
            ) : analysisResult ? (
              <div className={cx("analysis-result")}>
                {aiAccess.features.includes('job_analysis') && (
                  <div className={cx("analysis-section")}>
                    <h4><FaChartBar /> Phân tích khớp ứng tuyển</h4>
                    <div className={cx("match-score")}>
                      <div className={cx("score-circle", getScoreCategory(analysisResult.match_analysis.overall_match_score))}>
                        {analysisResult.match_analysis.overall_match_score}%
                      </div>
                    </div>
                    
                    {/* Visual chart representation */}
                    <div className={cx("match-visualization")}>
                      <div className={cx("radial-chart")}>
                        {analysisResult.match_analysis.detailed_skills_match && (
                          <>
                            <div className={cx("chart-title")}>Kỹ năng phù hợp</div>
                            <div className={cx("chart-container")}>
                              <div className={cx("chart-legend")}>
                                <div className={cx("legend-item")}>
                                  <span className={cx("legend-color", "matched")}></span>
                                  <span>Kỹ năng phù hợp</span>
                                </div>
                                <div className={cx("legend-item")}>
                                  <span className={cx("legend-color", "missing")}></span>
                                  <span>Kỹ năng còn thiếu</span>
                                </div>
                              </div>
                              <div className={cx("skills-distribution")}>
                                <div 
                                  className={cx("matched-portion")} 
                                  style={{ 
                                    width: `${analysisResult.match_analysis.detailed_skills_match.matched_skills.length / 
                                      (analysisResult.match_analysis.detailed_skills_match.matched_skills.length + 
                                       analysisResult.match_analysis.detailed_skills_match.missing_skills.length) * 100}%` 
                                  }}
                                >
                                  {analysisResult.match_analysis.detailed_skills_match.matched_skills.length}
                                </div>
                                <div 
                                  className={cx("missing-portion")}
                                  style={{ 
                                    width: `${analysisResult.match_analysis.detailed_skills_match.missing_skills.length / 
                                      (analysisResult.match_analysis.detailed_skills_match.matched_skills.length + 
                                       analysisResult.match_analysis.detailed_skills_match.missing_skills.length) * 100}%` 
                                  }}
                                >
                                  {analysisResult.match_analysis.detailed_skills_match.missing_skills.length}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Radar chart for multi-dimensional match */}
                      <div className={cx("radar-chart")}>
                        <div className={cx("chart-title")}>Hồ sơ khớp ứng tuyển</div>
                        <div className={cx("radar-container")}>
                          <div className={cx("radar-web")}>
                            <div className={cx("radar-circle", "circle-5")}></div>
                            <div className={cx("radar-circle", "circle-4")}></div>
                            <div className={cx("radar-circle", "circle-3")}></div>
                            <div className={cx("radar-circle", "circle-2")}></div>
                            <div className={cx("radar-circle", "circle-1")}></div>
                            
                            <div className={cx("radar-axes")}>
                              <div className={cx("radar-axis", "axis-1")}></div>
                              <div className={cx("radar-axis", "axis-2")}></div>
                              <div className={cx("radar-axis", "axis-3")}></div>
                              <div className={cx("radar-axis", "axis-4")}></div>
                              <div className={cx("radar-axis", "axis-5")}></div>
                            </div>
                            
                            {/* Replace the complex radar area with a simple polygon visualization */}
                            <div className={cx("radar-polygon")}>
                              <svg viewBox="0 0 100 100" className={cx("radar-svg")}>
                                {/* Background pentagon for reference */}
                                <polygon 
                                  points="50,0 95,35 77,90 23,90 5,35" 
                                  className={cx("radar-background")}
                                />
                                
                                {/* Actual data polygon */}
                                <polygon 
                                  points={`
                                    50,${100 - (analysisResult.match_analysis.overall_match_score * 0.8)}
                                    ${50 + (95 - 50) * (analysisResult.match_analysis.overall_match_score * 0.9) / 100},${35 + (0 - 35) * (analysisResult.match_analysis.overall_match_score * 0.9) / 100}
                                    ${77 - (77 - 50) * (analysisResult.match_analysis.overall_match_score * 1.1) / 100},${90 - (90 - 50) * (analysisResult.match_analysis.overall_match_score * 1.1) / 100}
                                    ${23 + (50 - 23) * (analysisResult.match_analysis.overall_match_score * 0.7) / 100},${90 - (90 - 50) * (analysisResult.match_analysis.overall_match_score * 0.7) / 100}
                                    ${5 + (50 - 5) * (analysisResult.match_analysis.overall_match_score * 0.95) / 100},${35 + (0 - 35) * (analysisResult.match_analysis.overall_match_score * 0.95) / 100}
                                  `}
                                  className={cx("radar-data")}
                                />
                                
                                {/* Data points */}
                                <circle cx="50" cy={100 - (analysisResult.match_analysis.overall_match_score * 0.8)} r="3" className={cx("radar-point-svg")} />
                                <circle cx={50 + (95 - 50) * (analysisResult.match_analysis.overall_match_score * 0.9) / 100} cy={35 + (0 - 35) * (analysisResult.match_analysis.overall_match_score * 0.9) / 100} r="3" className={cx("radar-point-svg")} />
                                <circle cx={77 - (77 - 50) * (analysisResult.match_analysis.overall_match_score * 1.1) / 100} cy={90 - (90 - 50) * (analysisResult.match_analysis.overall_match_score * 1.1) / 100} r="3" className={cx("radar-point-svg")} />
                                <circle cx={23 + (50 - 23) * (analysisResult.match_analysis.overall_match_score * 0.7) / 100} cy={90 - (90 - 50) * (analysisResult.match_analysis.overall_match_score * 0.7) / 100} r="3" className={cx("radar-point-svg")} />
                                <circle cx={5 + (50 - 5) * (analysisResult.match_analysis.overall_match_score * 0.95) / 100} cy={35 + (0 - 35) * (analysisResult.match_analysis.overall_match_score * 0.95) / 100} r="3" className={cx("radar-point-svg")} />
                              </svg>
                            </div>
                            
                            <div className={cx("radar-labels")}>
                              <div className={cx("radar-label", "label-1")}>Kỹ năng</div>
                              <div className={cx("radar-label", "label-2")}>Kinh nghiệm</div>
                              <div className={cx("radar-label", "label-3")}>Học vấn</div>
                              <div className={cx("radar-label", "label-4")}>Địa điểm</div>
                              <div className={cx("radar-label", "label-5")}>Lương</div>
                            </div>
                          </div>
                          
                          {/* Add radar legend */}
                          <div className={cx("radar-legend")}>
                            <div className={cx("legend-item")}>
                              <span className={cx("legend-color", "high")}></span>
                              <span>Hồ sơ của bạn</span>
                            </div>
                            <div className={cx("legend-item")}>
                              <span className={cx("legend-color", "reference")}></span>
                              <span>Hồ sơ phù hợp</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Score breakdown chart */}
                      <div className={cx("score-breakdown")}>
                        <div className={cx("chart-title")}>Phân tích điểm khớp ứng tuyển</div>
                        <div className={cx("score-bars")}>
                          <div className={cx("score-bar-item")}>
                            <div className={cx("score-label")}>Kỹ năng</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score * 0.8))} 
                                style={{ width: `${analysisResult.match_analysis.overall_match_score * 0.8}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{Math.round(analysisResult.match_analysis.overall_match_score * 0.8)}%</div>
                          </div>
                          
                          <div className={cx("score-bar-item")}>
                            <div className={cx("score-label")}>Kinh nghiệm</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score * 0.9))} 
                                style={{ width: `${analysisResult.match_analysis.overall_match_score * 0.9}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{Math.round(analysisResult.match_analysis.overall_match_score * 0.9)}%</div>
                          </div>
                          
                          <div className={cx("score-bar-item")}>
                            <div className={cx("score-label")}>Học vấn</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score * 1.1 > 100 ? 100 : analysisResult.match_analysis.overall_match_score * 1.1))} 
                                style={{ width: `${Math.min(analysisResult.match_analysis.overall_match_score * 1.1, 100)}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{Math.min(Math.round(analysisResult.match_analysis.overall_match_score * 1.1), 100)}%</div>
                          </div>
                          
                          <div className={cx("score-bar-item")}>
                            <div className={cx("score-label")}>Địa điểm</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score * 0.7))} 
                                style={{ width: `${analysisResult.match_analysis.overall_match_score * 0.7}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{Math.round(analysisResult.match_analysis.overall_match_score * 0.7)}%</div>
                          </div>
                          
                          <div className={cx("score-bar-item")}>
                            <div className={cx("score-label")}>Lương</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score * 0.95))} 
                                style={{ width: `${analysisResult.match_analysis.overall_match_score * 0.95}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{Math.round(analysisResult.match_analysis.overall_match_score * 0.95)}%</div>
                          </div>
                          
                          <div className={cx("score-bar-item", "overall-score")}>
                            <div className={cx("score-label")}>Tổng</div>
                            <div className={cx("score-bar-container")}>
                              <div 
                                className={cx("score-bar", getScoreCategory(analysisResult.match_analysis.overall_match_score))} 
                                style={{ width: `${analysisResult.match_analysis.overall_match_score}%` }}
                              ></div>
                            </div>
                            <div className={cx("score-value")}>{analysisResult.match_analysis.overall_match_score}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={cx("match-details")}>
                      <div className={cx("strengths")}>
                        <h5>Điểm mạnh của bạn</h5>
                        <ul>
                          {analysisResult.match_analysis.strengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={cx("gaps")}>
                        <h5>Điểm yếu của bạn</h5>
                        <ul>
                          {analysisResult.match_analysis.gaps.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {aiAccess.features.includes('skills_match') && (
                      <div className={cx("skills-match")}>
                        <h5>Phân tích kỹ năng</h5>
                        <div className={cx("skills-columns")}>
                          <div className={cx("skill-column")}>
                            <h6>Kỹ năng phù hợp</h6>
                            <ul className={cx("matched-skills")}>
                              {analysisResult.match_analysis.detailed_skills_match.matched_skills.map((skill, idx) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                          <div className={cx("skill-column")}>
                            <h6>Kỹ năng còn thiếu</h6>
                            <ul className={cx("missing-skills")}>
                              {analysisResult.match_analysis.detailed_skills_match.missing_skills.map((skill, idx) => (
                                <li key={idx}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiAccess.features.includes('resume_tips') && (
                  <div className={cx("analysis-section")}>
                    <h4>Mẹo ứng tuyển</h4>
                    <ul className={cx("application-tips")}>
                      {analysisResult.application_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAccess.features.includes('interview_prep') && (
                  <div className={cx("analysis-section")}>
                    <h4><FaQuestionCircle /> Câu hỏi phỏng vấn</h4>
                    <div className={cx("interview-questions")}>
                      {analysisResult.interview_questions.map((item, idx) => (
                        <div key={idx} className={cx("question-item")}>
                          <div className={cx("question")}>{item.question}</div>
                          <div className={cx("question-details")}>
                            <p><strong>Lý do câu hỏi này có thể được hỏi:</strong> {item.reasoning}</p>
                            <p><strong>Cách chuẩn bị:</strong> {item.preparation_tips}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiAccess.features.includes('salary_negotiation') && (
                  <div className={cx("analysis-section")}>
                    <h4><FaMoneyBillWave /> Thông tin lương</h4>
                    <div className={cx("salary-advice")}>
                      <p className={cx("market-insights")}>{analysisResult.salary_advice.market_insights}</p>
                      <h5>Mẹo thương lượng</h5>
                      <ul>
                        {analysisResult.salary_advice.negotiation_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className={cx("analysis-summary")}>
                  <h4>Tóm tắt</h4>
                  <p>{analysisResult.summary}</p>
                </div>

                {userPlan !== 'ProMax' && (
                  <div className={cx("upgrade-notice")}>
                    <p>
                      <FaLock /> Nâng cấp đến {userPlan === 'Basic' ? 'Pro' : 'ProMax'} để mở khóa các tính năng AI.
                    </p>
                    <button className={cx("upgrade-btn")} onClick={() => navigate("/pricing")}>
                      Nâng cấp gói
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={cx("no-analysis")}>
                <p>Không có phân tích. Hãy nhấn nút bên dưới để phân tích công việc này.</p>
                <button 
                  className={cx("analyze-btn")}
                  onClick={handleAnalyzeJob}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <FaSpinner className={cx("spinner")} /> Đang phân tích...
                    </>
                  ) : (
                    <>
                      <FaRobot /> Phân tích công việc này
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Helper function to determine score category for styling
  const getScoreCategory = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
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

          {/* Add AI analysis section before or after job description */}
          {candidateStatus && renderAiAnalysisSection()}

         
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
                      <div className={cx("file-requirements")}>
                        <p><i className="fas fa-check-circle"></i> Định dạng: PDF, DOC, DOCX</p>
                        <p><i className="fas fa-check-circle"></i> Dung lượng: Tối đa 5MB</p>
                      </div>
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