import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Company.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBuilding, FaUser, FaGlobe, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaBan, FaChartLine, FaStar } from "react-icons/fa";
import { toast } from 'react-hot-toast';
import useScrollTop from '~/hooks/useScrollTop';
const cx = classNames.bind(styles);

function Company() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recruiterData, setRecruiterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active');


    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await authAPI().get(adminApis.getAllRecruiterCompanies, {
                params: { page: activePage },
            });
            const reviews = await authAPI().get(adminApis.getAllReviewsByCompanyId());
            console.log("reviews",reviews.data);
            setRecruiterData(result.data.recruiterCompanies);
            console.log("recruiterCompanies",result.data.recruiterCompanies);
            setTotalPages(result.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchData();
    }, [activePage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setActivePage(newPage);
        }
    };
  // Thêm useEffect để scroll lên đầu trang
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
    const handleUpdateStatus = async (recruiterId, newStatus) => {
        try {
            await authAPI().patch(adminApis.updateStatusRecruiterCompany(recruiterId), {
                status: newStatus
            });
            
            // Thông báo chi tiết dựa trên trạng thái
            let message = '';
            let icon = '✅';
            
            switch(newStatus) {
                case 'active':
                    message = 'Đã kích hoạt tài khoản nhà tuyển dụng thành công';
                    icon = '🚀';
                    break;
                case 'pending':
                    message = 'Đã chuyển về trạng thái chờ duyệt';
                    icon = '⏳';
                    break;
                case 'rejected':
                    message = 'Đã từ chối tài khoản nhà tuyển dụng';
                    icon = '❌';
                    break;
                default:
                    message = 'Cập nhật trạng thái thành công';
            }
            
            toast.success(message, {
                duration: 3000,
                position: 'top-right',
                icon: icon,
                style: {
                    background: '#4caf50',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

            // Refresh data và đóng modal
            await fetchData();
            setShowStatusModal(false);
            setSelectedRecruiter(null);
            
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái', {
                duration: 3000,
                position: 'top-right',
                icon: '❌',
                style: {
                    background: '#f44336',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });
        }
    };

    const StatusModal = ({ recruiter, onClose }) => {
        return (
            <div className={cx('modal-overlay')} onClick={onClose}>
                <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
                    <h3>Cập nhật trạng thái</h3>
                    <p>Nhà tuyển dụng: {recruiter?.company?.company_name}</p>
                    
                    <div className={cx('status-options')}>
                        <button 
                            className={cx('status-btn', 'active')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'active')}
                        >
                            Hoạt động
                        </button>
                        <button 
                            className={cx('status-btn', 'pending')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'pending')}
                        >
                            Chờ duyệt
                        </button>
                        <button 
                            className={cx('status-btn', 'rejected')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'rejected')}
                        >
                            Từ chối
                        </button>
                    </div>

                    <button className={cx('close-btn')} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        );
    };

    // Lọc data theo tab
    const filteredData = recruiterData.filter(item => {
        switch(activeTab) {
            case 'active':
                return item.status === 'active';
            case 'pending':
                return item.status === 'pending';
            case 'rejected':
                return item.status === 'rejected';
            default:
                return true;
        }
    });

    // Đếm số lượng cho mỗi trạng thái
    const counts = {
        total: recruiterData.length,
        active: recruiterData.filter(item => item.status === 'active').length,
        pending: recruiterData.filter(item => item.status === 'pending').length,
        rejected: recruiterData.filter(item => item.status === 'rejected').length
    };

    const getAverageRating = (reviews) => {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const renderReviewStats = (item) => {
        const averageRating = getAverageRating(item.company.reviews);
        return (
            <div className={cx('review-stats')}>
                <div className={cx('review-count')}>
                    <FaStar className={cx('icon')} />
                    <span>{averageRating}/5</span>
                    <span className={cx('review-total')}>
                        ({item.company.reviews?.length || 0} đánh giá)
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('header-content')}>
                    <h1>
                        <FaBuilding className={cx('header-icon')} />
                        Quản lý nhà tuyển dụng
                    </h1>
                    <p>Quản lý và giám sát các công ty đăng ký tuyển dụng trên hệ thống</p>
                </div>

                <div className={cx('stats-banner')}>
                    <div className={cx('stats-item')}>
                        <FaBuilding className={cx('stats-icon')} />
                        <div className={cx('stats-info')}>
                            <span className={cx('stats-label')}>Tổng số</span>
                            <span className={cx('stats-value')}>{counts.total}</span>
                        </div>
                    </div>

                    <div className={cx('stats-divider')} />

                    <div className={cx('stats-item')}>
                        <FaCheckCircle className={cx('stats-icon', 'active')} />
                        <div className={cx('stats-info')}>
                            <span className={cx('stats-label')}>Hoạt động</span>
                            <span className={cx('stats-value', 'active')}>{counts.active}</span>
                        </div>
                    </div>

                    <div className={cx('stats-divider')} />

                    <div className={cx('stats-item')}>
                        <FaClock className={cx('stats-icon', 'pending')} />
                        <div className={cx('stats-info')}>
                            <span className={cx('stats-label')}>Chờ duyệt</span>
                            <span className={cx('stats-value', 'pending')}>{counts.pending}</span>
                        </div>
                    </div>

                    <div className={cx('stats-divider')} />

                    <div className={cx('stats-item')}>
                        <FaBan className={cx('stats-icon', 'rejected')} />
                        <div className={cx('stats-info')}>
                            <span className={cx('stats-label')}>Từ chối</span>
                            <span className={cx('stats-value', 'rejected')}>{counts.rejected}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('main-content')}>
                <div className={cx('tabs-wrapper')}>
                    <div className={cx('tabs')}>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'all' })}
                            onClick={() => setActiveTab('all')}
                            data-count={counts.total}
                        >
                            <FaChartLine className={cx('tab-icon')} />
                            Tất cả
                        </button>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'active' })}
                            onClick={() => setActiveTab('active')}
                            data-count={counts.active}
                        >
                            <FaCheckCircle className={cx('tab-icon')} />
                            Đang hoạt động
                        </button>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'pending' })}
                            onClick={() => setActiveTab('pending')}
                            data-count={counts.pending}
                        >
                            <FaClock className={cx('tab-icon')} />
                            Chờ duyệt
                        </button>
                        <button 
                            className={cx('tab-btn', { active: activeTab === 'rejected' })}
                            onClick={() => setActiveTab('rejected')}
                            data-count={counts.rejected}
                        >
                            <FaBan className={cx('tab-icon')} />
                            Đã từ chối
                        </button>
                    </div>

                    {/* <button className={cx('add-btn')}>
                        <FaUser /> Thêm nhà tuyển dụng
                    </button> */}
                </div>

                <div className={cx('content')}>
                    <div className={cx('content-header')}>
                        <div className={cx('content-title')}>
                            {activeTab === 'active' && `${counts.active} công ty đang hoạt động`}
                            {activeTab === 'pending' && `${counts.pending} công ty đang chờ duyệt`}
                            {activeTab === 'rejected' && `${counts.rejected} công ty đã từ chối`}
                        </div>
                    </div>
                    <div className={cx('recruiter-grid')}>
                        <div className={cx('table-header')}>
                            <div className={cx('header-row')}>
                                <div className={cx('header-cell')}>Công ty</div>
                                <div className={cx('header-cell')}>Quy mô</div>
                                <div className={cx('header-cell')}>Website</div>
                                <div className={cx('header-cell')}>Người đại diện</div>
                                <div className={cx('header-cell')}>Ngày tạo</div>
                                <div className={cx('header-cell')}>Trạng thái</div>
                                <div className={cx('header-cell')}>Thao tác</div>
                            </div>
                        </div>
                        <div className={cx('table-body')}>
                            {loading ? (
                                <div className={cx('loading')}>Loading...</div>
                            ) : (
                                filteredData.map((item) => (
                                    <div key={item.recruiter_id} className={cx('recruiter-card')}>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('company-info-cell')}>
                                                <div className={cx('company-logo')}>
                                                    <img 
                                                        src={`${process.env.REACT_APP_API_URL}/uploads/company/${item.company.logo}`}
                                                        alt={item.company.company_name} 
                                                    />
                                                </div>
                                                <div className={cx('company-details')}>
                                                    <h3>{item.company.company_name}</h3>
                                                    <div className={cx('company-location')}>
                                                        <FaMapMarkerAlt />
                                                        <span>{item.company.address}</span>
                                                    </div>
                                                    {renderReviewStats(item)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('company-size')}>
                                                <FaUsers className={cx('icon')} />
                                                <span>{item.company.company_emp} nhân viên</span>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <a 
                                                href={item.company.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={cx('website-link')}
                                            >
                                                <FaGlobe className={cx('icon')} />
                                                <span>{item.company.website}</span>
                                            </a>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('representative-cell')}>
                                                <div className={cx('rep-info')}>
                                                    <span className={cx('name')}>{item.user.name}</span>
                                                    <span className={cx('email')}>{item.user.email}</span>
                                                    <span className={cx('phone')}>{item.user.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('date-info')}>
                                                <FaCalendarAlt className={cx('icon')} />
                                                <span>{new Date(item.company.created_at).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('status-cell')}>
                                                <div 
                                                    className={cx('status', item.status)}
                                                    onClick={() => {
                                                        setSelectedRecruiter(item);
                                                        setShowStatusModal(true);
                                                    }}
                                                >
                                                    {item.status === 'active' && 'Hoạt động'}
                                                    {item.status === 'pending' && 'Chờ duyệt'}
                                                    {item.status === 'rejected' && 'Từ chối'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('actions-cell')}>
                                                <div className={cx('actions')}>
                                                    <button className={cx('action-btn', 'edit')}>
                                                        Chỉnh sửa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={cx('pagination')}>
                        <button 
                            className={cx('page-btn')} 
                            onClick={() => handlePageChange(activePage - 1)}
                            disabled={activePage === 1}
                        >
                            <PrevPageIcon />
                        </button>
                        <span className={cx('page-info')}>
                            Trang {activePage} / {totalPages}
                        </span>
                        <button 
                            className={cx('page-btn')}
                            onClick={() => handlePageChange(activePage + 1)}
                            disabled={activePage === totalPages}
                        >
                            <NextPageIcon />
                        </button>
                    </div>
                </div>
            </div>

            {showStatusModal && selectedRecruiter && (
                <StatusModal 
                    recruiter={selectedRecruiter}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedRecruiter(null);
                    }}
                />
            )}
        </div>
    );
}

export default Company;