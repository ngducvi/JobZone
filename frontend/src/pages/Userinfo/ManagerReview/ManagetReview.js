// page manager review
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { authAPI, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import { FaStar, FaEdit, FaTrash } from "react-icons/fa";
import styles from "./ManagetReview.module.scss";

const cx = classNames.bind(styles);

const ManagerReview = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState(null);
    const [reviewStatus, setReviewStatus] = useState({});

    useEffect(() => {
        const fetchReviews = async () => {
            const response = await authAPI().get(userApis.getAllReviewsByUserId(1));
            setReviews(response.data.reviews);
        };
        fetchReviews();
    }, []);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar
                key={index}
                className={cx('star', { 'active': index < rating })}
            />
        ));
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1 className={cx('title')}>Quản lý đánh giá</h1>
                <p className={cx('subtitle')}>Xem và quản lý các đánh giá của bạn</p>
            </div>

            <div className={cx('reviews-container')}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.review_id} className={cx('review-card')}>
                            <div className={cx('review-header')}>
                                <div className={cx('company-info')}>
                                    <h3 className={cx('company-name')}>Công ty {review.company_id}</h3>
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
                                <button className={cx('action-btn', 'edit')}>
                                    <FaEdit className={cx('icon')} />
                                    Chỉnh sửa
                                </button>
                                <button className={cx('action-btn', 'delete')}>
                                    <FaTrash className={cx('icon')} />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={cx('no-reviews')}>
                        <p>Bạn chưa có đánh giá nào</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className={cx('pagination')}>
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            className={cx('page-btn', { active: currentPage === index + 1 })}
                            onClick={() => setCurrentPage(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManagerReview;
