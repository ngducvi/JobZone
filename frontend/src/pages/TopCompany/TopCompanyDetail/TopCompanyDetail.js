import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./TopCompanyDetail.module.scss";
import classNames from "classnames/bind";
import { authAPI, userApis, messagesApis } from "~/utils/api";
import { useParams } from "react-router-dom";
import images from "~/assets/images";
import { LoadingSpinner, CompanySkeleton } from "~/components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaUser, FaEllipsisV, FaArrowLeft, FaPaperclip, FaImage, FaPaperPlane, FaEdit, FaTrash, FaEnvelope } from "react-icons/fa";

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
        console.log(response.data.recruiterCompanies);
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
        const response = await authAPI().get(userApis.getAllReviewsByCompanyId(company));
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
      }
    };
    fetchReviews();
  }, [company]);

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

  if (isLoading) {
    return <CompanySkeleton />;
  }

  if (!companyDetail) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles['hero-section']}>
        <div className={styles['company-card']}>
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
              
              <div className={styles['stat-badges']}>
                <div className={styles.badge}>
                  <i className="fas fa-map-marker-alt" />
                  <span>{companyDetail?.address}</span>
                </div>
                <div className={styles.badge}>
                  <i className="fas fa-users" />
                  <span>{companyDetail?.company_emp || "250+"} employees</span>
                </div>
                <div className={styles.badge}>
                  <i className="fas fa-globe" />
                  <span>{companyDetail?.website}</span>
                </div>
                <div className={`${styles.badge} ${styles.rating}`}>
                  <i className="fas fa-star" />
                  <span>{averageRating} rating</span>
                  </div>
              </div>
              
              <div className={styles['follow-button']}>
                <button 
                  className={`${styles['button-content']} ${isFollowing ? styles.following : ''}`}
                  onClick={handleFollow}
                >
                  <i className={`fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`} />
                  {isFollowing ? 'Following' : 'Follow Company'}
                </button>
                <button 
                  className={styles['message-button']}
                  onClick={handleMessage}
                  disabled={isMessageLoading}
                >
                  <FaEnvelope />
                  <span>{isMessageLoading ? 'Đang xử lý...' : 'Message'}</span>
                </button>
                <div className={styles['follower-count']}>
                  <i className="fas fa-users" />
                  <span>2.5k followers</span>
                </div>
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
          
          <div className={styles['info-card']}>
            <div className={styles['card-header']}>
              <i className="fas fa-briefcase-clock"></i>
              <h2>Vị trí đang tuyển ({jobs.length})</h2>
            </div>
            
            {jobs.length === 0 ? (
              <div className={styles['empty-state']}>
                <i className="fas fa-briefcase-blank"></i>
                <p>Hiện tại công ty chưa có vị trí nào đang tuyển dụng</p>
              </div>
            ) : (
              <>
                <div className={styles['job-grid']}>
                  {currentJobs.map((job, index) => (
                    <div
                      key={index}
                      className={styles['job-card']}
                      onClick={() => handleJobClick(job.job_id)}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className={styles['job-header']}>
                        <div className={styles['company-logo']}>
                          <img
                            src={companyDetail?.logos || images.company_1}
                            alt="Logo"
                          />
                        </div>
                        <div className={styles['job-info']}>
                          <h3 className={styles['job-title']}>{job?.title}</h3>
                          <div className={styles['company-name']}>
                            {companyDetail?.company_name}
                          </div>
                        </div>
                      </div>

                      <div className={styles['job-meta']}>
                        <span className={styles['meta-item']}>
                          <i className="fas fa-sack-dollar"></i>
                          {job?.salary}
                        </span>
                        <span className={styles['meta-item']}>
                          <i className="fas fa-location-dot"></i>
                          {job?.location}
                        </span>
                        <span className={styles['meta-item']}>
                          <i className="fas fa-briefcase"></i>
                          {job?.experience}
                        </span>
                        <span className={styles['meta-item']}>
                          <i className="fas fa-clock"></i>
                          {job?.working_time}
                        </span>
                      </div>

                      <div className={styles['job-tags']}>
                        <span className={styles['tag']}>
                          {job?.working_time}
                        </span>
                        <span className={styles['tag']}>{job?.rank}</span>
                        {job?.status === "Pending" && (
                          <span className={styles['tag']}>Gấp</span>
                        )}
                      </div>

                      <div className={styles['job-actions']}>
                        <button
                          className={`${styles['save-btn']} ${savedStatus[job.job_id] ? styles.saved : ''}`}
                          // className={cx("save-btn", {
                          //   saved: savedStatus[job.job_id],
                          // })}
                          onClick={(e) => handleSaveJob(e, job.job_id)}
                          aria-label={savedStatus[job.job_id] ? "Hủy lưu" : "Lưu tin"}
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
                        {job?.deadline && new Date(job.deadline).getTime() < new Date().getTime() ? (
                          <button className={cx("apply-btn", "primary-btn", "disabled")} disabled>
                            <i className="fas fa-lock"></i>
                            Đã đóng
                          </button>
                        ) : (
                        <button 
                            className={cx("apply-btn", "primary-btn")}
                            onClick={() => handleJobClick(job.job_id)}
                        >
                          <i className="fas fa-paper-plane"></i>
                            Ứng tuyển ngay
                        </button>
                        )}
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
                            className={cx("page-btn", { active: currentPage === pageNum })}
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
                        return <span key={pageNum} className={cx("ellipsis")}>...</span>;
                      }
                      
                      return null;
                    })}
                    
                    <button 
                      className={cx("page-btn", { disabled: currentPage === totalPages })}
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
            <div className={cx("card-header")}>
              <div className={cx("header-title")}>
                <i className="fas fa-star"></i>
                <h3>Đánh giá công ty</h3>
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
                          src={reviewUsers[review.user_id]?.profile_picture || images.avatar} 
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
    </div>
  );
}

export default TopCompanyDetail;
