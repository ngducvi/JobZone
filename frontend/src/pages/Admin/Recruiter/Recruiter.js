import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Recruiter.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBuilding, FaUser, FaGlobe, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaBan, FaChartLine } from "react-icons/fa";
import { toast } from 'react-hot-toast';

const cx = classNames.bind(styles);

function Recruiter() {
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
            setRecruiterData(result.data.recruiterCompanies);
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

                    <button className={cx('add-btn')}>
                        <FaUser /> Thêm nhà tuyển dụng
                    </button>
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
                        {loading ? (
                            <div className={cx('loading')}>Loading...</div>
                        ) : (
                            filteredData.map((item) => (
                                <div key={item.recruiter_id} className={cx('recruiter-card')}>
                                    <div className={cx('company-banner')} 
                                         style={{backgroundImage: `url(${process.env.REACT_APP_API_URL}/uploads/company/${item.company.banner || 'default-banner.jpg'})`}}>
                                        <div className={cx('company-logo')}>
                                            <img src={`${process.env.REACT_APP_API_URL}/uploads/company/${item.company.logo}`} 
                                                 alt={item.company.company_name} />
                                        </div>
                                    </div>
                                    
                                    <div className={cx('card-content')}>
                                        <div className={cx('company-info')}>
                                            <h3>{item.company.company_name}</h3>
                                            
                                            <div className={cx('representative-info')}>
                                                <div className={cx('info-label')}>
                                                    <FaUser />
                                                    <span>Người đại diện:</span>
                                                </div>
                                                <div className={cx('info-item')}>
                                                    <span className={cx('name')}>{item.user.name}</span>
                                                    <span className={cx('role')}>Nhà tuyển dụng</span>
                                                </div>
                                                <div className={cx('contact-info')}>
                                                    <div className={cx('info-item')}>
                                                        <i className="fas fa-envelope"></i>
                                                        <span>{item.user.email}</span>
                                                    </div>
                                                    <div className={cx('info-item')}>
                                                        <i className="fas fa-phone"></i>
                                                        <span>{item.user.phone}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={cx('divider')}></div>

                                            <div className={cx('info-item')}>
                                                <FaMapMarkerAlt />
                                                <span>{item.company.address}</span>
                                            </div>
                                            <div className={cx('info-item')}>
                                                <FaUsers />
                                                <span>{item.company.company_emp} nhân viên</span>
                                            </div>
                                            <div className={cx('info-item')}>
                                                <FaGlobe />
                                                <a href={item.company.website} target="_blank" rel="noopener noreferrer">
                                                    {item.company.website}
                                                </a>
                                            </div>
                                        </div>

                                        <div className={cx('card-footer')}>
                                            <div 
                                                className={cx('status', {
                                                    'active': item.status === 'active',
                                                    'pending': item.status === 'pending',
                                                    'rejected': item.status === 'rejected'
                                                })}
                                                onClick={() => {
                                                    setSelectedRecruiter(item);
                                                    setShowStatusModal(true);
                                                }}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {item.status === 'active' && 'Hoạt động'}
                                                {item.status === 'pending' && 'Chờ duyệt'}
                                                {item.status === 'rejected' && 'Từ chối'}
                                            </div>
                                            <div className={cx('actions')}>
                                                <button className={cx('action-btn', 'edit')}>
                                                    Chỉnh sửa
                                                </button>
                                                <button className={cx('action-btn', 'delete')}>
                                                    Xóa
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
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

export default Recruiter;
