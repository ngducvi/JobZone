import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Company.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaUsers, FaCalendarAlt, FaCheckCircle, FaClock, FaBan, FaChartLine, FaStar, FaFileContract, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
import { toast } from 'react-hot-toast';
// import useScrollTop from '~/hooks/useScrollTop';
const cx = classNames.bind(styles);

function Company() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [recruiterData, setRecruiterData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecruiter, setSelectedRecruiter] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [selectedLicense, setSelectedLicense] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [licenseId, setLicenseId] = useState(null);


    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await authAPI().get(adminApis.getAllRecruiterCompanies, {
                params: { page: activePage },
            });
            const reviews = await authAPI().get(adminApis.getAllReviewsByCompanyId());
            console.log("reviews", reviews.data);
            setRecruiterData(result.data.recruiterCompanies);
            console.log("recruiterCompanies", result.data.recruiterCompanies);
            console.log("businessLicense", result.data.recruiterCompanies[0].company.businessLicense);
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
            // Kiểm tra trạng thái giấy phép của công ty
            const recruiter = recruiterData.find(item => item.recruiter_id === recruiterId);
            const licenseStatus = recruiter?.company?.businessLicense?.business_license_status;

            // Kiểm tra điều kiện cập nhật trạng thái
            if (newStatus === 'active' && licenseStatus !== 'verified') {
                toast.error('Không thể kích hoạt công ty khi giấy phép chưa được xác thực!', {
                    duration: 3000,
                    position: 'top-right',
                    icon: '❌',
                    style: {
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
                return;
            }

            await authAPI().patch(adminApis.updateStatusRecruiterCompany(recruiterId), {
                status: newStatus
            });

            // Thông báo chi tiết dựa trên trạng thái
            let message = '';
            let icon = '✅';

            switch (newStatus) {
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
        const licenseStatus = recruiter?.company?.businessLicense?.business_license_status;
        
        return (
            <div className={cx('modal-overlay')} onClick={onClose}>
                <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
                    <h3>Cập nhật trạng thái</h3>
                    <p>Nhà tuyển dụng: {recruiter?.company?.company_name}</p>
                    
                    {licenseStatus !== 'verified' && (
                        <div className={cx('license-warning')}>
                            <FaBan className={cx('warning-icon')} />
                            <p>Giấy phép kinh doanh chưa được xác thực. Không thể kích hoạt tài khoản.</p>
                        </div>
                    )}

                    <div className={cx('status-options')}>
                        <button
                            className={cx('status-btn', 'active')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'active')}
                            disabled={licenseStatus !== 'verified'}
                        >
                            <FaCheckCircle /> Hoạt động
                        </button>
                        <button
                            className={cx('status-btn', 'pending')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'pending')}
                        >
                            <FaClock /> Chờ duyệt
                        </button>
                        <button
                            className={cx('status-btn', 'rejected')}
                            onClick={() => handleUpdateStatus(recruiter.recruiter_id, 'rejected')}
                        >
                            <FaBan /> Từ chối
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
        switch (activeTab) {
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

    const handleViewLicense = (license) => {
        setSelectedLicense(license);
        setLicenseId(license.license_id);
        setShowLicenseModal(true);
    };

    const handleUpdateLicenseStatus = async (status) => {
        try {
            await authAPI().patch(adminApis.updateBusinessLicenseStatus(licenseId), {
                business_license_status: status
            });

            // Show success message based on status
            let message = '';
            switch (status) {
                case 'verified':
                    message = 'Đã xác thực giấy phép kinh doanh';
                    break;
                case 'pending':
                    message = 'Đã chuyển trạng thái về chờ xác thực';
                    break;
                case 'rejected':
                    message = 'Đã từ chối giấy phép kinh doanh';
                    break;
                default:
                    message = 'Đã cập nhật trạng thái giấy phép';
            }

            toast.success(message, {
                duration: 3000,
                position: 'top-right',
                icon: '✅',
                style: {
                    background: '#4caf50',
                    color: '#fff',
                    fontWeight: 'bold'
                }
            });

            // Refresh data and close modal
            await fetchData();
            setShowLicenseModal(false);
            setLicenseId(null);
        } catch (error) {
            console.error("Error updating license status:", error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái giấy phép', {
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

    const LicenseModal = ({ license, onClose }) => {
        const getLicenseStatusBadge = (status) => {
            switch (status) {
                case 'verified':
                    return <span className={cx('badge', 'verified')}>
                        <FaCheckCircle /> Đã xác thực
                    </span>;
                case 'pending':
                    return <span className={cx('badge', 'pending')}>
                        <FaClock /> Chờ xác thực
                    </span>;
                case 'rejected':
                    return <span className={cx('badge', 'rejected')}>
                        <FaBan /> Đã từ chối
                    </span>;
                default:
                    return null;
            }
        };

        // Kiểm tra tính hợp lệ của giấy phép
        const checkLicenseValidity = () => {
            const currentDate = new Date();
            const expiryDate = new Date(license.license_expiry_date);
            const issueDate = new Date(license.license_issue_date);
            
            const validityChecks = [
                {
                    condition: license.tax_id && license.tax_id.length >= 10,
                    message: 'Mã số thuế hợp lệ',
                    error: 'Mã số thuế không hợp lệ (cần ít nhất 10 ký tự)'
                },
                {
                    condition: license.registration_number && license.registration_number.length >= 5,
                    message: 'Số đăng ký kinh doanh hợp lệ',
                    error: 'Số đăng ký kinh doanh không hợp lệ'
                },
                {
                    condition: issueDate < currentDate,
                    message: 'Ngày cấp hợp lệ',
                    error: 'Ngày cấp không hợp lệ'
                },
                {
                    condition: expiryDate > currentDate,
                    message: 'Giấy phép còn hiệu lực',
                    error: 'Giấy phép đã hết hạn'
                },
                {
                    condition: license.business_license_file,
                    message: 'Đã tải lên file giấy phép',
                    error: 'Chưa tải lên file giấy phép'
                },
                {
                    condition: license.contact_email && license.contact_email.includes('@'),
                    message: 'Email liên hệ hợp lệ',
                    error: 'Email liên hệ không hợp lệ'
                },
                {
                    condition: license.contact_phone && license.contact_phone.length >= 10,
                    message: 'Số điện thoại hợp lệ',
                    error: 'Số điện thoại không hợp lệ'
                }
            ];

            return validityChecks;
        };

        const validityResults = checkLicenseValidity();

        return (
            <div className={cx('modal-overlay')} onClick={onClose}>
                <div className={cx('license-modal-content')} onClick={e => e.stopPropagation()}>
                    <h3>Thông tin giấy phép kinh doanh</h3>
                    <p className={cx('company-name')}>Công ty: {license.company_name}</p>

                    <div className={cx('license-status')}>
                        {getLicenseStatusBadge(license.business_license_status)}
                        {license.business_license_verified_at && (
                            <p className={cx('verified-info')}>
                                Xác thực bởi: {license.business_license_verified_by}<br />
                                Ngày xác thực: {new Date(license.business_license_verified_at).toLocaleDateString('vi-VN')}
                            </p>
                        )}
                    </div>

                    <div className={cx('validation-section')}>
                        <h4>Kiểm tra tính hợp lệ:</h4>
                        <div className={cx('validation-checks')}>
                            {validityResults.map((check, index) => (
                                <div key={index} className={cx('validation-item', { valid: check.condition })}>
                                    {check.condition ? (
                                        <FaCheckCircle className={cx('icon-valid')} />
                                    ) : (
                                        <FaBan className={cx('icon-invalid')} />
                                    )}
                                    <span>{check.condition ? check.message : check.error}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('license-details')}>
                        <div className={cx('license-row')}>
                            <div className={cx('license-field')}>
                                <label>Mã số thuế:</label>
                                <span>{license.tax_id}</span>
                            </div>
                            <div className={cx('license-field')}>
                                <label>Số đăng ký kinh doanh:</label>
                                <span>{license.registration_number}</span>
                            </div>
                        </div>

                        <div className={cx('license-row')}>
                            <div className={cx('license-field')}>
                                <label>Ngày cấp:</label>
                                <span>{new Date(license.license_issue_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className={cx('license-field')}>
                                <label>Ngày hết hạn:</label>
                                <span>{new Date(license.license_expiry_date).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>

                        <div className={cx('license-row')}>
                            <div className={cx('license-field')}>
                                <label>Email liên hệ:</label>
                                <span>{license.contact_email}</span>
                            </div>
                            <div className={cx('license-field')}>
                                <label>Số điện thoại:</label>
                                <span>{license.contact_phone}</span>
                            </div>
                        </div>

                        <div className={cx('license-row')}>
                            <div className={cx('license-field')}>
                                <label>Ngành nghề:</label>
                                <span>{license.industry}</span>
                            </div>
                            <div className={cx('license-field')}>
                                <label>Năm thành lập:</label>
                                <span>{license.founded_year}</span>
                            </div>
                        </div>
                    </div>

                    <div className={cx('license-file')}>
                        <label>File giấy phép:</label>
                        <img
                            src={license.business_license_file}
                            alt="Business License"
                            onClick={() => {
                                setSelectedImage(license.business_license_file);
                                setShowImageModal(true);
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                        <div className={cx('license-actions')}>
                            <button
                                className={cx('action-btn', 'verify')}
                                onClick={() => handleUpdateLicenseStatus('verified')}
                                disabled={license.business_license_status === 'verified' || !validityResults.every(check => check.condition)}
                            >
                                <FaCheckCircle /> Xác thực
                            </button>
                            <button
                                className={cx('action-btn', 'pending')}
                                onClick={() => handleUpdateLicenseStatus('pending')}
                                disabled={license.business_license_status === 'pending'}
                            >
                                <FaClock /> Chờ xác thực
                            </button>
                            <button
                                className={cx('action-btn', 'reject')}
                                onClick={() => handleUpdateLicenseStatus('rejected')}
                                disabled={license.business_license_status === 'rejected'}
                            >
                                <FaBan /> Từ chối
                            </button>
                        </div>
                    </div>

                    <button className={cx('close-btn')} onClick={() => {
                        onClose();
                        setLicenseId(null);
                    }}>
                        Đóng
                    </button>
                </div>
            </div>
        );
    };

    const ImageModal = ({ image, onClose }) => {
        const [isZoomed, setIsZoomed] = useState(false);
        const [scale, setScale] = useState(1);

        const handleZoomIn = () => {
            if (scale < 2) {
                setScale(prev => prev + 0.25);
            }
        };

        const handleZoomOut = () => {
            if (scale > 0.5) {
                setScale(prev => prev - 0.25);
            }
        };

        const toggleZoom = () => {
            setIsZoomed(!isZoomed);
            setScale(1); // Reset scale when toggling full zoom
        };

        return (
            <div className={styles['modal-overlay']} onClick={onClose}>
                <div className={styles['image-modal-content']} onClick={e => e.stopPropagation()}>
                    <div className={styles['image-container']}>
                        <img
                            src={image}
                            alt="Business License"
                            className={`${styles['full-size-image']} ${isZoomed ? styles['zoomed'] : ''}`}
                            style={{ transform: `scale(${scale})` }}
                            onClick={toggleZoom}
                        />
                    </div>

                    <div className={styles['zoom-controls']}>
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.5}
                            title="Thu nhỏ"
                        >
                            <FaSearchMinus />
                        </button>
                        <button
                            onClick={handleZoomIn}
                            disabled={scale >= 2}
                            title="Phóng to"
                        >
                            <FaSearchPlus />
                        </button>
                    </div>

                    <button className={styles['close-btn']} onClick={onClose}>
                        Đóng
                    </button>
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
                                <div className={cx('header-cell')}>Trạng thái giấy phép</div>
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
                                                        src={item.company.logo}
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
                                            <div className={cx('status-cell')}>
                                                <div className={cx('status', item.company.businessLicense.business_license_status)}>
                                                    {item.company.businessLicense.business_license_status === 'verified' && 'Đã xác thực'}
                                                    {item.company.businessLicense.business_license_status === 'pending' && 'Chờ xác thực'}
                                                    {item.company.businessLicense.business_license_status === 'rejected' && 'Đã từ chối'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('table-cell')}>
                                            <div className={cx('actions-cell')}>
                                                <div className={cx('actions')}>
                                                    <button
                                                        className={cx('action-btn', 'view-license')}
                                                        onClick={() => handleViewLicense(item.company.businessLicense)}
                                                        
                                                    >
                                                        <FaFileContract /> Xem giấy phép
                                                    </button>
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

            {showLicenseModal && selectedLicense && (
                <LicenseModal
                    license={selectedLicense}
                    onClose={() => {
                        setShowLicenseModal(false);
                        setSelectedLicense(null);
                    }}
                />
            )}

            {showImageModal && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setShowImageModal(false)}
                />
            )}
        </div>
    );
}

export default Company;