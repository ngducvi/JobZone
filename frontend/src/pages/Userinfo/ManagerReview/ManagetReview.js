import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { authAPI, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import { FaStar, FaEdit, FaTrash, FaCommentAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./ManagetReview.module.scss";
import { toast } from "react-hot-toast";

const cx = classNames.bind(styles);
const ITEMS_PER_PAGE = 6;

const ManagerReview = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editFormData, setEditFormData] = useState({
        rating: 0,
        comment: ""
    });
    const [currentPage, setCurrentPage] = useState(1);

    // Tính toán tổng số trang
    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);

    // Lấy reviews cho trang hiện tại
    const getCurrentPageReviews = () => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return reviews.slice(startIndex, endIndex);
    };

    // Tạo mảng số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user) {
                    toast.error("Vui lòng đăng nhập để xem đánh giá");
                    navigate('/login');
                    return;
                }
                const response = await authAPI().get(userApis.getAllReviewsByUserId);
                if (response.data.code === 1) {
                    setReviews(response.data.reviews);
                } else {
                    setError("Không thể tải đánh giá. Vui lòng thử lại sau.");
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setError("Có lỗi xảy ra khi tải đánh giá. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [navigate]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={cx('star', { 'active': index < rating })}
                onClick={() => editingReview && setEditFormData(prev => ({ ...prev, rating: index + 1 }))}
            />
        ));
    };

    const handleEditClick = (review) => {
        setEditingReview(review);
        setEditFormData({
            rating: review.rating,
            comment: review.comment
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authAPI().put(
                userApis.editReviewByUserId,
                {
                    review_id: editingReview.review_id,
                    rating: editFormData.rating,
                    comment: editFormData.comment
                }
            );

            if (response.data.code === 1) {
                setReviews(reviews.map(review =>
                    review.review_id === editingReview.review_id
                        ? { ...review, rating: editFormData.rating, comment: editFormData.comment }
                        : review
                ));
                toast.success("Cập nhật đánh giá thành công!");
                setIsEditModalOpen(false);
            } else {
                toast.error("Không thể cập nhật đánh giá. Vui lòng thử lại sau.");
            }
        } catch (error) {
            console.error("Error updating review:", error);
            toast.error("Có lỗi xảy ra khi cập nhật đánh giá.");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
            try {
                const response = await authAPI().delete(userApis.deleteReviewByReviewId(reviewId));
                if (response.data.code === 1) {
                    setReviews(reviews.filter(review => review.review_id !== reviewId));
                    toast.success("Xóa đánh giá thành công!");
                } else {
                    toast.error("Không thể xóa đánh giá. Vui lòng thử lại sau.");
                }
            } catch (error) {
                console.error("Error deleting review:", error);
                toast.error("Có lỗi xảy ra khi xóa đánh giá.");
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Quản lý đánh giá</h1>
                <p className={cx('subtitle')}>Xem và quản lý các đánh giá của bạn về nhà tuyển dụng</p>
            </div>

            <div className={cx('reviews-container')}>
                {loading ? (
                    <div className={cx('no-reviews')}>
                        <FaCommentAlt size={24} color="#666" />
                        <p>Đang tải đánh giá...</p>
                    </div>
                ) : error ? (
                    <div className={cx('no-reviews')}>
                        <FaCommentAlt size={24} color="#dc2626" />
                        <p>{error}</p>
                    </div>
                ) : reviews.length > 0 ? (
                    <>
                        {getCurrentPageReviews().map((review) => (
                            <div key={review.review_id} className={cx('review-card')}>
                                <div className={cx('review-header')}>
                                    <div className={cx('company-info')}>
                                        <h3 className={cx('company-name')}>
                                            {review.company_name || `Công ty ${review.company_id}`}
                                        </h3>
                                        <div className={cx('rating')}>
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                    <div className={cx('review-date')}>
                                        {formatDate(review.review_date)}
                                    </div>
                                </div>

                                <div className={cx('review-content')}>
                                    <p className={cx('comment')}>{review.comment}</p>
                                </div>

                                <div className={cx('review-actions')}>
                                    <button 
                                        className={cx('action-btn', 'edit')}
                                        onClick={() => handleEditClick(review)}
                                    >
                                        <FaEdit className={cx('icon')} />
                                        Chỉnh sửa
                                    </button>
                                    <button 
                                        className={cx('action-btn', 'delete')}
                                        onClick={() => handleDeleteReview(review.review_id)}
                                    >
                                        <FaTrash className={cx('icon')} />
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {totalPages > 1 && (
                            <div className={cx('pagination')}>
                                <button
                                    className={cx('page-btn', 'nav')}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <FaChevronLeft className={cx('icon')} />
                                    Trước
                                </button>

                                {getPageNumbers().map(pageNum => (
                                    <button
                                        key={pageNum}
                                        className={cx('page-btn', { active: currentPage === pageNum })}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                <button
                                    className={cx('page-btn', 'nav')}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Sau
                                    <FaChevronRight className={cx('icon')} />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={cx('no-reviews')}>
                        <FaCommentAlt size={24} color="#666" />
                        <p>Bạn chưa có đánh giá nào</p>
                    </div>
                )}
            </div>

            {isEditModalOpen && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal')}>
                        <h2>Chỉnh sửa đánh giá</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className={cx('rating-input')}>
                                <label>Đánh giá:</label>
                                <div className={cx('stars-input')}>
                                    {renderStars(editFormData.rating)}
                                </div>
                            </div>
                            <div className={cx('comment-input')}>
                                <label>Nhận xét:</label>
                                <textarea
                                    value={editFormData.comment}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, comment: e.target.value }))}
                                    placeholder="Nhập nhận xét của bạn về nhà tuyển dụng..."
                                    required
                                />
                            </div>
                            <div className={cx('modal-actions')}>
                                <button 
                                    type="button" 
                                    className={cx('modal-btn', 'cancel')}
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className={cx('modal-btn', 'save')}
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerReview;