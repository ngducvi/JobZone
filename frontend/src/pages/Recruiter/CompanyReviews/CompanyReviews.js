// page 

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../../../utils/api';
import { recruiterApis } from '../../../utils/api';
import styles from './CompanyReviews.module.scss';
import classNames from 'classnames/bind';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import SidebarSectuiter from '../../../components/Layouts/components/SidebarSecruiter';
import Header from '../../../components/Layouts/components/Header';

const cx = classNames.bind(styles);

const CompanyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRating, setSelectedRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [ratingDistribution, setRatingDistribution] = useState([]);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isMobileView, setIsMobileView] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [reviewsPerPage] = useState(5);

    // Check if screen is mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        // Initial check
        checkIfMobile();

        // Add event listener
        window.addEventListener('resize', checkIfMobile);

        // Clean up
        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // Fetch user info
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await authAPI().get(recruiterApis.getCurrentUser);
                setCurrentUser(response.data.user);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Fetch company info
    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const response = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
                if (response.data.companies && response.data.companies.length > 0) {
                    setCompanyInfo(response.data.companies[0]);
                }
            } catch (error) {
                console.error('Error fetching company info:', error);
                toast.error('Không thể lấy thông tin công ty');
            }
        };

        fetchCompanyInfo();
    }, []);

    // Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            if (!companyInfo) return;
            
            try {
                setLoading(true);
                const response = await authAPI().get(
                    recruiterApis.getCompanyReviews(companyInfo.company_id, selectedRating)
                );
                
                setReviews(response.data.reviews || []);
                setTotalReviews(response.data.totalReviews || 0);
                setAvgRating(response.data.avgRating || 0);
                setRatingDistribution(response.data.ratingDistribution || []);
                setCurrentPage(1); // Reset to first page when filtering
            } catch (error) {
                console.error('Error fetching reviews:', error);
                toast.error('Không thể lấy đánh giá công ty');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [companyInfo, selectedRating]);

    // Handle filter by rating
    const handleRatingFilter = (rating) => {
        if (selectedRating === rating) {
            setSelectedRating(0); // Clear filter if clicking the same rating
        } else {
            setSelectedRating(rating);
        }
    };

    // Calculate percentage for a rating
    const calculatePercentage = (count) => {
        if (!totalReviews) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    // Format date
    const formatDate = (dateString) => {
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: vi
            });
        } catch (error) {
            return 'Không rõ thời gian';
        }
    };

    // Get current reviews for pagination
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // Change page
    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of reviews container on mobile
        if (isMobileView) {
            const reviewsContainer = document.querySelector(`.${cx('reviews-container')}`);
            if (reviewsContainer) {
                reviewsContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            paginate(currentPage + 1);
        }
    };

    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            paginate(currentPage - 1);
        }
    };

    // Render pagination buttons more efficiently for mobile
    const renderPaginationButtons = () => {
        const buttons = [];
        
        // For mobile, show fewer page numbers
        const maxVisiblePages = isMobileView ? 3 : 5;
        
        // Calculate range of pages to show
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Always show first page
        if (startPage > 1) {
            buttons.push(
                <button
                    key={1}
                    onClick={() => paginate(1)}
                    className={cx('page-number', { active: 1 === currentPage })}
                >
                    1
                </button>
            );
            
            // Show ellipsis if needed
            if (startPage > 2) {
                buttons.push(<span key="ellipsis-start" className={cx('ellipsis')}>...</span>);
            }
        }
        
        // Add page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => paginate(i)}
                    className={cx('page-number', { active: i === currentPage })}
                >
                    {i}
                </button>
            );
        }
        
        // Always show last page
        if (endPage < totalPages) {
            // Show ellipsis if needed
            if (endPage < totalPages - 1) {
                buttons.push(<span key="ellipsis-end" className={cx('ellipsis')}>...</span>);
            }
            
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    className={cx('page-number', { active: totalPages === currentPage })}
                >
                    {totalPages}
                </button>
            );
        }
        
        return buttons;
    };

    return (
        <div className={cx('recruiter-company-reviews')}>
            <Header />
            <div className={cx('container')}>
                <SidebarSectuiter />
                <div className={cx('content')}>
                    <div className={cx('page-header')}>
            <h1>Đánh giá công ty</h1>
                        {companyInfo && <h2>{companyInfo.company_name}</h2>}
                    </div>

                    {loading && !companyInfo ? (
                        <div className={cx('loading')}>
                            <div className={cx('loading-spinner')}></div>
                            <p>Đang tải thông tin...</p>
                        </div>
                    ) : (
                        <>
                            {companyInfo ? (
                                <div className={cx('reviews-container')}>
                                    <div className={cx('reviews-summary')}>
                                        <div className={cx('rating-overview')}>
                                            <div className={cx('avg-rating')}>
                                                <span className={cx('rating-number')}>{avgRating}</span>
                                                <div className={cx('stars')}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <i
                                                            key={star}
                                                            className={`fas fa-star ${
                                                                star <= Math.round(avgRating) ? cx('active') : ''
                                                            }`}
                                                        ></i>
                                                    ))}
                                                </div>
                                                <div className={cx('review-count')}>
                                                    {totalReviews} đánh giá
                                                </div>
                                            </div>

                                            <div className={cx('rating-bars')}>
                                                {ratingDistribution.map((item) => (
                                                    <div
                                                        key={item.rating}
                                                        className={cx('rating-bar', {
                                                            selected: selectedRating === item.rating
                                                        })}
                                                        onClick={() => handleRatingFilter(item.rating)}
                                                    >
                                                        <div className={cx('stars-label')}>
                                                            <span>{item.rating}</span>
                                                            <i className="fas fa-star"></i>
                                                        </div>
                                                        <div className={cx('bar-container')}>
                                                            <div 
                                                                className={cx('progress-bar')}
                                                                style={{ width: `${calculatePercentage(item.count)}%` }}
                                                            ></div>
                                                        </div>
                                                        <div className={cx('count-label')}>
                                                            <span>{item.count}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedRating > 0 && (
                                            <div className={cx('active-filter')}>
                                                <p>
                                                    Đang lọc: <strong>{selectedRating} sao</strong>
                                                </p>
                                                <button onClick={() => setSelectedRating(0)}>
                                                    Xóa bộ lọc <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className={cx('loading')}>
                                            <div className={cx('loading-spinner')}></div>
                                            <p>Đang tải đánh giá...</p>
                                        </div>
                                    ) : reviews.length > 0 ? (
                                        <>
                                            <div className={cx('reviews-list')}>
                                                {currentReviews.map((review) => (
                                                    <div key={review.review_id} className={cx('review-card')}>
                                                        <div className={cx('review-header')}>
                                                            <div className={cx('reviewer-info')}>
                                                                <div className={cx('avatar')}>
                                                                    <span>
                                                                        {review.user?.name?.charAt(0) || 'U'}
                                                                    </span>
                                                                </div>
                                                                <div className={cx('name-date')}>
                                                                    <h3>{review.user?.name || 'Người dùng ẩn danh'}</h3>
                                                                    <p className={cx('date')}>
                                                                        {formatDate(review.review_date)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className={cx('review-rating')}>
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <i
                                                                        key={star}
                                                                        className={`fas fa-star ${
                                                                            star <= review.rating ? cx('active') : ''
                                                                        }`}
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className={cx('review-content')}>
                                                            <p>{review.comment}</p>
                                                        </div>
                                                        <div className={cx('review-footer')}>
                                                            <div className={cx('helpful')}>
                                                                <span>
                                                                    <i className="fas fa-thumbs-up"></i> Hữu ích ({review.helpful_count || 0})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className={cx('pagination')}>
                                                    <button 
                                                        onClick={prevPage} 
                                                        disabled={currentPage === 1}
                                                        className={cx('pagination-button', { disabled: currentPage === 1 })}
                                                        aria-label="Previous page"
                                                    >
                                                        <i className="fas fa-chevron-left"></i>
                                                    </button>
                                                    
                                                    <div className={cx('page-numbers')}>
                                                        {renderPaginationButtons()}
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={nextPage} 
                                                        disabled={currentPage === totalPages}
                                                        className={cx('pagination-button', { disabled: currentPage === totalPages })}
                                                        aria-label="Next page"
                                                    >
                                                        <i className="fas fa-chevron-right"></i>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className={cx('empty-reviews')}>
                                            {selectedRating > 0 ? (
                                                <>
                                                    <i className="fas fa-search"></i>
                                                    <h3>Không có đánh giá nào ở mức {selectedRating} sao</h3>
                                                    <p>Vui lòng thử chọn mức đánh giá khác hoặc xem tất cả đánh giá</p>
                                                    <button 
                                                        className={cx('clear-filter')}
                                                        onClick={() => setSelectedRating(0)}
                                                    >
                                                        Xem tất cả đánh giá
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-comment-alt"></i>
                                                    <h3>Chưa có đánh giá nào</h3>
                                                    <p>
                                                        Công ty của bạn chưa nhận được đánh giá nào từ ứng viên.
                                                        Đánh giá sẽ xuất hiện khi ứng viên đánh giá công ty của bạn.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={cx('no-company')}>
                                    <i className="fas fa-building"></i>
                                    <h3>Không tìm thấy thông tin công ty</h3>
                                    <p>
                                        Bạn cần có thông tin công ty để xem đánh giá. 
                                        Vui lòng kiểm tra hoặc cập nhật thông tin công ty của bạn.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyReviews;
