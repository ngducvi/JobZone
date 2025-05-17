import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "./TopCompanyDetail.module.scss";
import classNames from "classnames/bind";
import { authAPI, userApis, messagesApis } from "~/utils/api";
import { useParams } from "react-router-dom";
import images from "~/assets/images";
import { LoadingSpinner, CompanySkeleton } from "~/components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import avt from "~/assets/images/avt.png";
import { FaUser, FaEllipsisV, FaArrowLeft, FaPaperclip, FaImage, FaPaperPlane, FaEdit, FaTrash, FaEnvelope, FaCrown, FaStar, FaGem } from "react-icons/fa";
import React from "react";

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
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewUsers, setReviewUsers] = useState({});
  const [recruiterCompanies, setRecruiterCompanies] = useState([]);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 5;
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  
  // Thêm các state để quản lý trạng thái ứng tuyển
  const [appliedStatus, setAppliedStatus] = useState({});
  const [applicationStatus, setApplicationStatus] = useState({});
  const [updatedAt, setUpdatedAt] = useState({});
  const [withdrawnStatus, setWithdrawnStatus] = useState({});
  const [showCvModal, setShowCvModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [userCvs, setUserCvs] = useState([]);
  const [candidateCvs, setCandidateCvs] = useState([]);
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [introduction, setIntroduction] = useState('');
  const [candidateStatus, setCandidateStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [companyPlan, setCompanyPlan] = useState('Basic');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await authAPI().get(
          userApis.getCompanyDetailByCompanyId(company)
        );
        const jobsResponse = await authAPI().get(
          userApis.getAllJobsByCompanyId(company)
        );
        const reviewsResponse = await authAPI().get(
          userApis.getAllReviewsByCompanyId(company)
        );
        
        setCompanyDetail(response.data.company);
        console.log("companyDetail",response.data.company);
        setJobs(jobsResponse.data.jobs);
        setRecruiterCompanies(response.data.recruiterCompanies);
      } catch (error) {
        console.error("Error fetching company detail:", error);
        toast.error("Không thể tải thông tin công ty. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
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

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsReviewsLoading(true);
        const apiUrl = userApis.getAllReviewsByCompanyId(company, selectedRating);
        console.log("Fetching reviews from:", apiUrl, "with rating:", selectedRating);
        
        const response = await authAPI().get(apiUrl);
        console.log("Reviews response:", response.data.reviews.length, "reviews found");
        setReviews(response.data.reviews);
        
        // Fetch user info cho mỗi review
        const userIds = [...new Set(response.data.reviews.map(review => review.user_id))];
        const userDetails = {};
        
        for (const userId of userIds) {
          const userResponse = await authAPI().get(userApis.getCandidateProfile(userId));
          userDetails[userId] = userResponse.data.candidate;
        }
        
        setReviewUsers(userDetails);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [company, selectedRating]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const checkAppliedStatusForJobs = async () => {
      if (!jobs || jobs.length === 0) return;
      
      try {
        const newAppliedStatus = {};
        const newApplicationStatus = {};
        const newUpdatedAt = {};
        const newWithdrawnStatus = {};
        
        for (const job of jobs) {
          const response = await authAPI().get(userApis.checkApplicationStatus(job.job_id));
          newAppliedStatus[job.job_id] = response.data.applied;
          newApplicationStatus[job.job_id] = response.data.status;
          newUpdatedAt[job.job_id] = response.data.updated_at;
          newWithdrawnStatus[job.job_id] = response.data.withdrawn;
        }
        
        setAppliedStatus(newAppliedStatus);
        setApplicationStatus(newApplicationStatus);
        setUpdatedAt(newUpdatedAt);
        setWithdrawnStatus(newWithdrawnStatus);
      } catch (error) {
        console.error("Error checking application status for jobs:", error);
      }
    };

    const fetchCvs = async () => {
      try {
        const [userCvsResponse, candidateCvsResponse, candidateStatusResponse] = await Promise.all([
          authAPI().get(userApis.getAllUserCvByUserId),
          authAPI().get(userApis.getAllCandidateCvByUserId),
          authAPI().get(userApis.checkCandidateStatus)
        ]);
        
        setUserCvs(userCvsResponse.data.userCv);
        setCandidateCvs(candidateCvsResponse.data.candidateCv);
        setCandidateStatus(candidateStatusResponse.data.candidateStatus);
      } catch (error) {
        console.error("Error fetching CVs:", error);
      }
    };

    checkAppliedStatusForJobs();
    fetchCvs();
  }, [jobs]);

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        const response = await authAPI().get(userApis.checkPlan, {
          params: { companyId: company }
        });
        if (response.data.code === 1) {
          setCompanyPlan(response.data.plan);
        }
      } catch (error) {
        console.error("Error fetching company plan:", error);
      }
    };
    fetchCompanyPlan();
  }, [company]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Đã hủy theo dõi công ty" : "Đã theo dõi công ty thành công");
  };

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!jobId) return;

    try {
      if (savedStatus[jobId]) {
        await authAPI().delete(userApis.unsaveJob(jobId));
        setSavedStatus((prev) => ({ ...prev, [jobId]: false }));
        toast.success("Đã hủy lưu công việc");
      } else {
        await authAPI().post(userApis.saveJob(jobId));
        setSavedStatus((prev) => ({ ...prev, [jobId]: true }));
        toast.success("Đã lưu công việc thành công");
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá!");
      return;
    }

    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      const response = await authAPI().post(userApis.createReviewCompany, {
        company_id: company,
        // user_id: currentUser.id,
        rating: rating,
        comment: comment,
        user_name: currentUser.name,
        candidate_id: currentUser.id
      });

      // Tạo review mới với thông tin user hiện tại
      const newReview = {
        ...response.data.review,
        user: currentUser
      };

      // Thêm review mới vào đầu danh sách
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      // Cập nhật reviewUsers với thông tin user hiện tại
      setReviewUsers(prevUsers => ({
        ...prevUsers,
        [currentUser.id]: {
          name: currentUser.name,
          profile_picture: currentUser.avatar
        }
      }));
      
      // Reset form
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      
      toast.success("Đánh giá của bạn đã được gửi thành công!");
    } catch (error) {
      console.error("Error submitting review:", {
        message: error.message,
        response: error.response?.data
      });
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá!");
    }
  };

  // Tính toán reviews cho trang hiện tại
  console.log("Computing current reviews with:", {
    reviews: reviews.length,
    currentReviewPage,
    reviewsPerPage,
    selectedRating
  });
  const indexOfLastReview = currentReviewPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);

  // Thêm hàm xử lý chuyển trang reviews
  const handleReviewPageChange = (pageNumber) => {
    setCurrentReviewPage(pageNumber);
    // Scroll đến phần reviews
    document.querySelector(`.${cx('reviews-list')}`).scrollIntoView({ behavior: 'smooth' });
  };

  // Tính trung bình rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) 
    : 0;
  
  // Tính phân phối số sao đánh giá
  const ratingDistribution = React.useMemo(() => {
    const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    if (reviews.length > 0) {
      reviews.forEach(review => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });
    }
    
    return distribution;
  }, [reviews]);
  
  // Tính phần trăm của mỗi loại đánh giá
  const calculatePercentage = (count) => {
    if (reviews.length === 0) return 0;
    return Math.round((count / reviews.length) * 100);
  };

  const handleMessage = async () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để gửi tin nhắn!");
      return;
    }

    if (!companyDetail || !companyDetail.company_id) {
      toast.error("Không thể tìm thấy thông tin công ty!");
      return;
    }

    setIsMessageLoading(true);
    try {
      console.log("recruiterCompanies:", recruiterCompanies);
      const recruiterUserId = Array.isArray(recruiterCompanies) && recruiterCompanies.length > 0
        ? (recruiterCompanies[0].user_id || recruiterCompanies[0].recruiter_id)
        : null;

      console.log("recruiterUserId:", recruiterUserId);

      if (!recruiterUserId) {
        toast.error("Không tìm thấy recruiter của công ty!");
        setIsMessageLoading(false);
        return;
      }

      const response = await authAPI().post(messagesApis.createConversation, {
        user1_id: parseInt(currentUser.id),
        user2_id: parseInt(recruiterUserId)
      });

      if (response.data.success) {
        toast.success("Đã tạo cuộc trò chuyện thành công!");
        navigate('/messages');
      } else {
        toast.error(response.data.message || "Không thể tạo cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể tạo cuộc trò chuyện. Vui lòng thử lại sau.");
      }
    } finally {
      setIsMessageLoading(false);
    }
  };

  // Thêm hàm tính số ngày còn lại trước khi có thể ứng tuyển lại
  const getRemainingDays = (jobId) => {
    if (!updatedAt[jobId]) return 0;
    
    const updatedDate = new Date(updatedAt[jobId]);
    const now = new Date();
    
    // Reset time part to 00:00:00 to compare only dates
    updatedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
    const requiredDays = applicationStatus[jobId] === "Đã rút đơn" ? 7 : 30;
    const remainingDays = requiredDays - daysSinceUpdate;
    
    return remainingDays > 0 ? remainingDays : 0;
  };

  // Thêm hàm để kiểm tra xem có thể ứng tuyển lại không
  const canApplyAgain = (jobId) => {
    if (!updatedAt[jobId]) return false;
    
    const updatedDate = new Date(updatedAt[jobId]);
    const now = new Date();
    
    // Reset time part to 00:00:00 to compare only dates
    updatedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const daysSinceUpdate = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
    const requiredDays = applicationStatus[jobId] === "Đã rút đơn" ? 7 : 30;
    
    return daysSinceUpdate >= requiredDays;
  };

  // Thêm hàm xử lý khi nhấn nút ứng tuyển
  const handleApplyClick = (jobId) => {
    setSelectedJobId(jobId);
    setShowCvModal(true);
  };

  // Thêm hàm xử lý tải lên CV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file PDF, DOC, DOCX");
        event.target.value = '';
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File không được vượt quá 5MB");
        event.target.value = '';
        return;
      }

      setUploadedFile(file);
      setSelectedCvId(null);
    }
  };

  // Thêm hàm xử lý ứng tuyển công việc
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
        formData.append("job_id", selectedJobId);
        
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
          job_id: selectedJobId,
          cv_id: selectedCvId,
          previous_status: applicationStatus[selectedJobId] 
        });
      }

      if (response.data.code === 1) {
        toast.success("Nộp đơn thành công!");
        setShowCvModal(false);
        
        // Cập nhật trạng thái ứng tuyển cho công việc đã chọn
        setAppliedStatus(prev => ({
          ...prev,
          [selectedJobId]: true
        }));
        
        setApplicationStatus(prev => ({
          ...prev,
          [selectedJobId]: "Đang xét duyệt"
        }));
        
        setUpdatedAt(prev => ({
          ...prev,
          [selectedJobId]: new Date()
        }));
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi nộp đơn.");
    }
  };

  // Thêm hàm xử lý hủy đơn ứng tuyển
  const handleWithdrawApplication = async (jobId) => {
    try {
      const response = await authAPI().post(userApis.withdrawApplication, { job_id: jobId });
      if (response.data.code === 1) {
        toast.success("Đơn ứng tuyển đã được hủy thành công!");
        
        // Cập nhật trạng thái ứng tuyển
        setAppliedStatus(prev => ({
          ...prev,
          [jobId]: false
        }));
        
        setApplicationStatus(prev => ({
          ...prev,
          [jobId]: "Đã rút đơn"
        }));
        
        setUpdatedAt(prev => ({
          ...prev,
          [jobId]: new Date()
        }));
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra khi hủy đơn ứng tuyển.");
      }
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn ứng tuyển.");
    }
  };

  // Thêm hàm render button ứng tuyển dựa trên trạng thái
  const renderApplyButton = (job) => {
    const jobId = job.job_id;
    const isJobExpired = job?.deadline ? new Date(job.deadline).getTime() < new Date().getTime() : false;
    
    if (candidateStatus !== 'Active') {
      return (
        <button 
          className={`${styles["apply-btn"]} ${styles["primary-btn"]} ${styles["disabled"]}`} 
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-lock"></i>
          Tài khoản chưa được kích hoạt
        </button>
      );
    }

    if (isJobExpired) {
      return (
        <button 
          className={`${styles["apply-btn"]} ${styles["primary-btn"]} ${styles["disabled"]}`} 
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-lock"></i>
          Đã đóng
        </button>
      );
    }

    if ((applicationStatus[jobId] === "Đã rút đơn" || applicationStatus[jobId] === "Đã từ chối") && !canApplyAgain(jobId)) {
      return (
        <button 
          className={`${styles["apply-btn"]} ${styles["primary-btn"]} ${styles["disabled"]}`} 
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-clock"></i>
          {`Có thể ứng tuyển lại sau ${getRemainingDays(jobId)} ngày`}
        </button>
      );
    }

    if ((applicationStatus[jobId] === "Đã rút đơn" || applicationStatus[jobId] === "Đã từ chối") && canApplyAgain(jobId)) {
      return (
        <button 
          className={`${styles["apply-btn"]} ${styles["primary-btn"]}`} 
          onClick={(e) => {
            e.stopPropagation();
            handleApplyClick(jobId);
          }}
        >
          <i className="fas fa-redo"></i>
          Ứng tuyển lại
        </button>
      );
    }

    if (appliedStatus[jobId]) {
      return (
        <div className={styles["applied-status"]}>
          <button 
            className={`${styles["apply-btn"]} ${styles["primary-btn"]}`} 
            disabled
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-check"></i>
            Đã ứng tuyển
          </button>
          <button 
            className={styles["withdraw-btn"]} 
            onClick={(e) => {
              e.stopPropagation();
              if(window.confirm('Bạn có chắc chắn muốn rút đơn ứng tuyển?')) {
                handleWithdrawApplication(jobId);
              }
            }}
          >
            <i className="fas fa-times"></i>
            Rút đơn
          </button>
        </div>
      );
    }

    return (
      <button 
        className={`${styles["apply-btn"]} ${styles["primary-btn"]}`} 
        onClick={(e) => {
          e.stopPropagation();
          handleApplyClick(jobId);
        }}
      >
        <i className="fas fa-paper-plane"></i>
        Ứng tuyển ngay
      </button>
    );
  };

  // Handle filter by rating
  const handleRatingFilter = (starCount) => {
    setCurrentReviewPage(1);
    
    if (selectedRating === starCount) {
      // If clicking the same star again, clear the filter
      console.log("Clearing rating filter, was:", selectedRating);
      setSelectedRating(0);
    } else {
      console.log("Setting rating filter to:", starCount);
      setSelectedRating(starCount);
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'ProMax':
        return <FaCrown className={cx('plan-icon', 'promax')} />;
      case 'Pro':
        return <FaGem className={cx('plan-icon', 'pro')} />;
      default:
        return <FaStar className={cx('plan-icon', 'basic')} />;
    }
  };

  const getPlanLabel = (plan) => {
    switch (plan) {
      case 'ProMax':
        return 'Pro Max';
      case 'Pro':
        return 'Pro';
      default:
        return 'Basic';
    }
  };

  if (isLoading) {
    return <CompanySkeleton />;
  }

  if (!companyDetail) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles['hero-section']}>
        <div className={`${styles['company-card']} ${companyPlan === 'Pro' ? styles['pro-border'] : ''}`}>
          <div className={styles['company-banner']}>
            <img src={companyDetail?.banner || images.banner} alt={companyDetail?.company_name} />
            <div className={styles.overlay} />
          </div>

          <div className={styles['company-intro']}>
            <div className={styles['logo-container']}>
              <img src={companyDetail?.logo} alt={`${companyDetail?.company_name} logo`} />
              <div className={styles['pulse-effect']} />
            </div>

            <div className={styles['company-stats']}>
              <h1>{companyDetail?.company_name}</h1>
              <div className={cx('plan-badge', companyDetail.plan && companyDetail.plan.toLowerCase())}>
                {getPlanIcon(companyDetail.plan)}
                <span>{getPlanLabel(companyDetail.plan)}</span>
              </div>

              {/* Info Row Start */}
              <div className={styles['info-row']}>
                <div className={styles['info-chip']}>
                  <i className="fas fa-users" />
                  <span>{companyDetail?.company_emp || '250+'} employees</span>
                </div>
                <a
                  className={styles['info-chip']}
                  href={companyDetail?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-globe" />
                  <span>{companyDetail?.website}</span>
                </a>
                <div className={styles['info-chip']}>
                  <i className="fas fa-star" />
                  <span>{averageRating} rating</span>
                </div>
                <div className={styles['info-chip']}>
                  <i className="fas fa-map-marker-alt" />
                  <span>{companyDetail?.address}</span>
                </div>
                <button
                  className={styles['message-chip']}
                  onClick={handleMessage}
                  disabled={isMessageLoading}
                >
                  <FaEnvelope />
                  <span>{isMessageLoading ? 'Đang xử lý...' : 'Message'}</span>
                </button>
              </div>
              {/* Info Row End */}

              
              <div className={styles['follow-button']}>
                <button 
                  className={styles['message-button']}
                  onClick={handleMessage}
                  disabled={isMessageLoading}
                >
                  <FaEnvelope />
                  <span>{isMessageLoading ? 'Đang xử lý...' : 'Message'}</span>
                </button>
                
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['content-grid']}>
        <div className={styles['main-content']}>
          <div className={styles['info-card']}>
            <div className={styles['card-header']}>
              <i className="fas fa-building-circle-check"></i>
              <h2>Giới thiệu công ty</h2>
            </div>
            <div
              className={styles['card-content']}
              dangerouslySetInnerHTML={{ __html: companyDetail?.description }}
            />
          </div>
          
          <div className={`${styles['info-card']} ${styles['jobs']}`}>
            <div className={styles['card-header']}>
              <i className="fas fa-briefcase-clock"></i>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <h2>Vị trí đang tuyển</h2>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(45deg, #013a74, #02a346)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(1, 58, 116, 0.2)'
                }}>
                  {jobs.length}
                </span>
              </div>
            </div>
            
            {jobs.length === 0 ? (
              <div className={cx("empty-state")} style={{
                padding: '60px 0',
                background: 'linear-gradient(to bottom, rgba(1, 58, 116, 0.02), rgba(2, 163, 70, 0.05))',
                borderRadius: '16px',
                margin: '20px 0'
              }}>
                <i className="fas fa-briefcase-blank" style={{fontSize: '64px'}}></i>
                <p style={{fontSize: '18px', maxWidth: '70%', fontWeight: '500'}}>Hiện tại công ty chưa có vị trí nào đang tuyển dụng</p>
              </div>
            ) : (
              <>
                <div className={styles["job-grid"]}>
                  {currentJobs.map((job, index) => (
                    <div
                      key={index}
                      className={styles["job-card"]}
                      onClick={() => handleJobClick(job.job_id)}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className={styles["job-header"]}>
                        <div className={styles["company-logo"]}>
                          <img
                            src={companyDetail?.logo || images.company_1}
                            alt="Logo"
                          />
                        </div>
                        <div className={styles["job-info"]}>
                          <h3 className={styles["job-title"]}>{job?.title}</h3>
                          <div className={styles["company-name"]}>
                            {companyDetail?.company_name}
                          </div>
                        </div>
                        {new Date(job.deadline) > new Date() ? (
                          <span className={`${styles['status-badge']} ${styles['active']}`}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#02a346',
                              marginRight: '6px',
                              display: 'inline-block'
                            }}></span>
                            Đang tuyển
                          </span>
                        ) : (
                          <span className={`${styles['status-badge']} ${styles['expired']}`}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#dc2626',
                              marginRight: '6px',
                              display: 'inline-block'
                            }}></span>
                            Hết hạn
                          </span>
                        )}
                      </div>

                      <div className={styles["job-meta"]}>
                        <span className={styles["meta-item"]}>
                          <i className="fas fa-sack-dollar"></i>
                          {job?.salary}
                        </span>
                        <span className={styles["meta-item"]}>
                          <i className="fas fa-location-dot"></i>
                          {job?.location}
                        </span>
                        <span className={styles["meta-item"]}>
                          <i className="fas fa-briefcase"></i>
                          {job?.experience}
                        </span>
                        <span className={styles["meta-item"]}>
                          <i className="fas fa-clock"></i>
                          {job?.working_time}
                        </span>
                      </div>

                      <div className={styles["job-tags"]}>
                        <span className={styles["tag"]}>
                          {job?.working_time}
                        </span>
                        <span className={styles["tag"]}>{job?.rank}</span>
                        {job?.status === "Pending" && (
                          <span className={styles["tag"]}>Gấp</span>
                        )}
                      </div>

                      <div className={styles["job-actions"]}>
                        <button
                          className={`${styles["save-btn"]} ${savedStatus[job.job_id] ? styles["saved"] : ""}`}
                          onClick={(e) => handleSaveJob(e, job.job_id)}
                          aria-label={savedStatus[job.job_id] ? "Hủy lưu" : "Lưu tin"}
                        >
                          <i
                            className={`fa${savedStatus[job.job_id] ? "s" : "r"} fa-bookmark`}
                          ></i>
                          <span className={styles["default-text"]}>
                            {savedStatus[job.job_id] ? "Đã Lưu" : "Lưu Tin"}
                          </span>
                          <span className={styles["hover-text"]}>
                            {savedStatus[job.job_id] ? "Hủy Lưu" : "Lưu Tin"}
                          </span>
                        </button>
                        {renderApplyButton(job)}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles["pagination"]}>
                    <button 
                      className={`${styles["page-btn"]} ${currentPage === 1 ? styles["disabled"] : ""}`}
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Trang trước"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            className={`${styles["page-btn"]} ${currentPage === pageNum ? styles["active"] : ""}`}
                            onClick={() => handlePageChange(pageNum)}
                            aria-label={`Trang ${pageNum}`}
                            aria-current={currentPage === pageNum ? "page" : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      // Hiển thị dấu ... nếu có khoảng cách
                      if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return <span key={pageNum} className={styles["ellipsis"]}>...</span>;
                      }
                      
                      return null;
                    })}
                    
                    <button 
                      className={`${styles["page-btn"]} ${currentPage === totalPages ? styles["disabled"] : ""}`}
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Trang sau"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={cx("info-card", "reviews")}>
            <div className={cx("reviews-header")}>
              <div className={cx("reviews-title")}>
                <h2>Đánh giá từ cộng đồng</h2>
                {reviews.length > 0 && (
                  <div className={cx("rating-summary")}>
                    <div className={cx("average-rating")}>
                      <span>{averageRating}</span>
                      <div className={cx("stars")}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i 
                            key={star} 
                            className={`fas fa-star ${star <= Math.round(averageRating) ? cx('active') : ''}`}
                          ></i>
                        ))}
                      </div>
                    </div>
                    <span className={cx("review-count")}>
                      {reviews.length} đánh giá
                    </span>
                  </div>
                )}
              </div>
              
              {reviews.length > 0 && (
                <>
                  {/* Rating distribution */}
                  <div className={cx("rating-distribution")}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className={cx("rating-bar-container")}>
                        <div className={cx("rating-bar-label")}>
                          <span>{star}</span>
                          <i className="fas fa-star"></i>
                        </div>
                        <div className={cx("rating-bar-wrapper")}>
                          <div 
                            className={cx("rating-bar")} 
                            style={{width: `${calculatePercentage(ratingDistribution[star])}%`}}
                          ></div>
                        </div>
                        <div className={cx("rating-count")}>
                          {ratingDistribution[star]} ({calculatePercentage(ratingDistribution[star])}%)
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Rating filter */}
                  <div className={cx("rating-filter")}>
                    <span className={cx("filter-label")}>Lọc theo: </span>
                    <div className={cx("star-filters")}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <button 
                          key={star}
                          className={cx("star-filter-btn", { active: selectedRating === star })}
                          onClick={() => handleRatingFilter(star)}
                          aria-label={`Lọc đánh giá ${star} sao`}
                        >
                          <span className={cx("star-count")}>{star}</span>
                          <i className="fas fa-star"></i>
                          {selectedRating === star && (
                            <span className={cx("clear-filter")}>
                              <i className="fas fa-times"></i>
                            </span>
                          )}
                        </button>
                      ))}
                      {selectedRating > 0 && (
                        <button 
                          className={cx("clear-all-btn")}
                          onClick={() => setSelectedRating(0)}
                          aria-label="Xóa bộ lọc"
                        >
                          <i className="fas fa-undo-alt"></i>
                          Xem tất cả
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              <button 
                className={cx("write-review-btn")}
                onClick={() => {
                  if (!currentUser) {
                    toast.error("Vui lòng đăng nhập để đánh giá!");
                    return;
                  }
                  setShowReviewForm(true);
                }}
              >
                <i className="fas fa-pen"></i>
                Viết đánh giá
              </button>
            </div>

            {showReviewForm && (
              <div className={cx("review-form")}>
                <div className={cx("form-header")}>
                  <h4>Chia sẻ trải nghiệm của bạn</h4>
                  <button 
                    className={cx("close-btn")}
                    onClick={() => setShowReviewForm(false)}
                    aria-label="Đóng form"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <div className={cx("rating-input")}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${
                        star <= (hoverRating || rating) ? cx('active') : ''
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                  <span className={cx("rating-text")}>
                    {rating ? `${rating} sao` : "Chọn đánh giá"}
                  </span>
                </div>
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về công ty..."
                  className={cx("review-textarea")}
                />
                
                <div className={cx("form-actions")}>
                  <button 
                    className={cx("cancel-btn")}
                    onClick={() => setShowReviewForm(false)}
                  >
                    Hủy
                  </button>
                  <button 
                    className={cx("submit-btn")}
                    onClick={handleSubmitReview}
                    disabled={!rating || !comment.trim()}
                  >
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className={cx("empty-reviews")}>
                <i className="fas fa-comment-alt-lines"></i>
                <p>Chưa có đánh giá nào cho công ty này</p>
                <button 
                  className={cx("be-first-btn")}
                  onClick={() => {
                    if (!currentUser) {
                      toast.error("Vui lòng đăng nhập để đánh giá!");
                      return;
                    }
                    setShowReviewForm(true);
                  }}
                >
                  Hãy là người đầu tiên đánh giá
                </button>
              </div>
            ) : isReviewsLoading ? (
              <div className={cx("reviews-loading")}>
                <div className={cx("loading-spinner")}>
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <p>Đang tải đánh giá...</p>
              </div>
            ) : currentReviews.length === 0 && selectedRating > 0 ? (
              <div className={cx("empty-filtered-reviews")}>
                <i className="fas fa-filter"></i>
                <p>Không có đánh giá nào có {selectedRating} sao</p>
                <button 
                  className={cx("clear-filter-btn")}
                  onClick={() => setSelectedRating(0)}
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className={cx("reviews-list")}>
                {currentReviews.map((review, index) => (
                  <div 
                    key={review.review_id} 
                    className={cx("review-item")}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={cx("review-header")}>
                      <div className={cx("user-info")}>
                        <img 
                          src={images.avt} 
                          alt="User avatar" 
                          className={cx("user-avatar")}
                        />
                        <div className={cx("user-details")}>
                          <span className={cx("user-name")}>
                            {reviewUsers[review.user_id]?.name || "Ẩn danh"}
                          </span>
                          <div className={cx("rating")}>
                            {[...Array(5)].map((_, index) => (
                              <i
                                key={index}
                                className={`fas fa-star ${index < review.rating ? cx('active') : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className={cx("review-meta")}>
                        <span className={cx("review-date")}>
                          {new Date(review.review_date).toLocaleDateString('vi-VN')}
                        </span>
                        {review.last_modified_at && (
                          <span className={cx("edited-mark")}>
                            (đã chỉnh sửa)
                          </span>
                        )}
                      </div>
                    </div>
                    <p className={cx("review-comment")}>{review.comment}</p>
                    <div className={cx("review-stats")}>
                      <span className={cx("version")}>
                        <i className="fas fa-code-branch"></i>
                        Phiên bản: {review.version || "1.0"}
                      </span>
                      
                      <div className={cx("review-actions")}>
                        <button className={cx("helpful-btn")}>
                          <i className="fas fa-thumbs-up"></i>
                          <span>Hữu ích</span>
                        </button>
                        <button className={cx("report-btn")}>
                          <i className="fas fa-flag"></i>
                          <span>Báo cáo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {totalReviewPages > 1 && (
                  <div className={cx("reviews-pagination")}>
                    <button 
                      className={cx("page-btn", { disabled: currentReviewPage === 1 })}
                      onClick={() => currentReviewPage > 1 && handleReviewPageChange(currentReviewPage - 1)}
                      disabled={currentReviewPage === 1}
                      aria-label="Trang trước"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((pageNum) => {
                      // Hiển thị trang đầu, trang cuối và các trang xung quanh trang hiện tại
                      if (
                        pageNum === 1 ||
                        pageNum === totalReviewPages ||
                        (pageNum >= currentReviewPage - 1 && pageNum <= currentReviewPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            className={cx("page-btn", { active: currentReviewPage === pageNum })}
                            onClick={() => handleReviewPageChange(pageNum)}
                            aria-label={`Trang ${pageNum}`}
                            aria-current={currentReviewPage === pageNum ? "page" : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      
                      // Hiển thị dấu ... nếu có khoảng cách
                      if (
                        (pageNum === 2 && currentReviewPage > 3) ||
                        (pageNum === totalReviewPages - 1 && currentReviewPage < totalReviewPages - 2)
                      ) {
                        return <span key={pageNum} className={cx("ellipsis")}>...</span>;
                      }
                      
                      return null;
                    })}
                    
                    <button 
                      className={cx("page-btn", { disabled: currentReviewPage === totalReviewPages })}
                      onClick={() => currentReviewPage < totalReviewPages && handleReviewPageChange(currentReviewPage + 1)}
                      disabled={currentReviewPage === totalReviewPages}
                      aria-label="Trang sau"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
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
              
              <div className={cx("contact-item", "industry")}>
                <i className="fas fa-building"></i>
                <span>{companyDetail?.industry || "Công nghệ thông tin"}</span>
              </div>
              
              <div className={cx("contact-item", "founded")}>
                <i className="fas fa-calendar-star"></i>
                <span>Thành lập: {companyDetail?.founded_year || "Chưa cập nhật"}</span>
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
          
          <div className={cx("info-card", "similar-companies")}>
            <div className={cx("card-header")}>
              <i className="fas fa-buildings"></i>
              <h3>Công ty tương tự</h3>
            </div>
            <div className={cx("similar-list")}>
              <a href="#" className={cx("similar-item")}>
                <img src={images.company_1 || "/placeholder.svg"} alt="Company logo" />
                <div className={cx("similar-info")}>
                  <h4>FPT Software</h4>
                  <span>Công nghệ thông tin</span>
                </div>
              </a>
              <a href="#" className={cx("similar-item")}>
                <img src={images.company_1 || "/placeholder.svg"} alt="Company logo" />
                <div className={cx("similar-info")}>
                  <h4>Viettel</h4>
                  <span>Viễn thông</span>
                </div>
              </a>
              <a href="#" className={cx("similar-item")}>
                <img src={images.company_1 || "/placeholder.svg"} alt="Company logo" />
                <div className={cx("similar-info")}>
                  <h4>VNG Corporation</h4>
                  <span>Công nghệ thông tin</span>
                </div>
              </a>
            </div>
          </div>
        </aside>
      </div>
      
      {/* CV Selection Modal */}
      {showCvModal && (
        <div className={styles['modal-overlay']} onClick={() => setShowCvModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2>Chọn CV ứng tuyển</h2>
              <button className={styles['close-btn']} onClick={() => setShowCvModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className={styles['modal-body']}>
              {/* Introduction Section */}
              <div className={styles['introduction-section']}>
                <h3>Thư giới thiệu</h3>
                <div className={styles['introduction-content']}>
                  <p className={styles['intro-tip']}>
                    <i className="fas fa-lightbulb"></i>
                    Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với nhà tuyển dụng.
                  </p>
                  <textarea
                    className={styles['intro-textarea']}
                    placeholder="Viết giới thiệu ngắn gọn về bản thân (điểm mạnh, điểm yếu) và nêu rõ mong muốn, lý do bạn muốn ứng tuyển cho vị trí này."
                    rows={4}
                    onChange={(e) => setIntroduction(e.target.value)}
                  />
                </div>
              </div>

              {/* Notice Section */}
              <div className={styles['notice-section']}>
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
                <div className={styles['cv-section']}>
                  <h3>CV đã tạo</h3>
                  <div className={styles['cv-list']}>
                    {userCvs.map((cv) => (
                      <div
                        key={cv.cv_id}
                        className={`${styles['cv-item']} ${selectedCvId === cv.cv_id ? styles['selected'] : ''}`}
                        onClick={() => {
                          setSelectedCvId(cv.cv_id);
                          setUploadedFile(null);
                        }}
                      >
                        <div className={styles['cv-info']}>
                          <i className="fas fa-file-alt"></i>
                          <div>
                            <h4>{cv.cv_name || "CV không có tiêu đề"}</h4>
                            <p>Cập nhật: {new Date(cv.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={styles['cv-actions']}>
                          {selectedCvId === cv.cv_id && (
                            <i className="fas fa-check-circle"></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded CVs Section */}
              {candidateCvs.length > 0 && (
                <div className={styles['cv-section']}>
                  <h3>CV đã tải lên</h3>
                  <div className={styles['cv-list']}>
                    {candidateCvs.map((cv) => (
                      <div
                        key={cv.cv_id}
                        className={`${styles['cv-item']} ${selectedCvId === cv.cv_id ? styles['selected'] : ''}`}
                        onClick={() => {
                          setSelectedCvId(cv.cv_id);
                          setUploadedFile(null);
                        }}
                      >
                        <div className={styles['cv-info']}>
                          <i className="fas fa-file-pdf"></i>
                          <div>
                            <h4>{cv.cv_name || "CV không có tiêu đề"}</h4>
                            <p>Cập nhật: {new Date(cv.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className={styles['cv-actions']}>
                          {selectedCvId === cv.cv_id && (
                            <i className="fas fa-check-circle"></i>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New CV Section */}
              <div className={styles['cv-section']}>
                <h3>Tải lên CV mới</h3>
                <div className={`${styles['upload-area']} ${uploadedFile ? styles['active'] : ''}`}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx"
                    style={{ display: "none" }}
                  />
                  {uploadedFile ? (
                    <div className={styles['uploaded-file']}>
                      <div className={styles['file-info']}>
                        <i className="fas fa-file-pdf"></i>
                        <div>
                          <h4>{uploadedFile.name}</h4>
                          <p>{Math.round(uploadedFile.size / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        className={styles['remove-file']}
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
                      className={styles['upload-placeholder']}
                      onClick={() => fileInputRef.current.click()}
                    >
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Nhấp để tải lên CV của bạn</p>
                      <span>Hỗ trợ: PDF, DOC, DOCX (Tối đa 5MB)</span>
                      <div className={styles['file-requirements']}>
                        <p><i className="fas fa-check-circle"></i> Định dạng: PDF, DOC, DOCX</p>
                        <p><i className="fas fa-check-circle"></i> Dung lượng: Tối đa 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles['modal-footer']}>
              <button
                className={styles['cancel-btn']}
                onClick={() => setShowCvModal(false)}
              >
                Hủy
              </button>
              <button
                className={styles['apply-btn']}
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
}

export default TopCompanyDetail;