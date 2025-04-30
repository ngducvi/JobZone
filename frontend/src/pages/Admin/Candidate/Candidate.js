import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Candidate.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaClock, FaLock, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";

const cx = classNames.bind(styles);

function Candidate() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [candidateData, setCandidateData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState({});
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [filteredCandidates, setFilteredCandidates] = useState([]);

    // Fetch user details for each candidate
    const fetchUserDetails = async (userId) => {
        try {
            const response = await authAPI().get(adminApis.getUserDetail(userId));
            setUserDetails(prev => ({
                ...prev,
                [userId]: response.data.user
            }));
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    // Fetch candidates
    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await authAPI().get(adminApis.getAllCandidates, {
                params: { page: activePage },
            });
            setCandidateData(result.data.candidates);
            console.log(result.data.candidates);
            setTotalPages(result.data.totalPages);

            // Fetch user details for each candidate
            result.data.candidates.forEach(candidate => {
                if (!userDetails[candidate.user_id]) {
                    fetchUserDetails(candidate.user_id);
                }
            });
        } catch (error) {
            console.error("Error fetching candidates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activePage]);

    useEffect(() => {
        if (activeTab === 'All') {
            setFilteredCandidates(candidateData);
            return;
        }
        const filtered = candidateData.filter(candidate => 
            candidate.status === activeTab
        );
        setFilteredCandidates(filtered);
    }, [activeTab, candidateData]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setActivePage(newPage);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    // Thêm hàm xử lý cập nhật status
    const handleUpdateStatus = async (candidateId, newStatus) => {
        try {
            await authAPI().patch(adminApis.updateStatusCandidate(candidateId), {
                status: newStatus
            });
            
            let message = '';
            let icon = '';
            
            switch(newStatus) {
                case 'Active':
                    message = 'Đã kích hoạt tài khoản ứng viên';
                    icon = '🚀';
                    break;
                case 'Pending':
                    message = 'Đã chuyển về trạng thái chờ duyệt';
                    icon = '⏳';
                    break;
                case 'Closed':
                    message = 'Đã khóa tài khoản ứng viên';
                    icon = '🔒';
                    break;
                default:
                    message = 'Cập nhật trạng thái thành công';
            }
            
            toast.success(`${icon} ${message}`, {
                position: "top-right",
                autoClose: 3000
            });

            await fetchData();
            setShowStatusModal(false);
            setSelectedCandidate(null);
            
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error('❌ Có lỗi xảy ra khi cập nhật trạng thái', {
                position: "top-right", 
                autoClose: 3000
            });
        }
    };

    // Thêm component StatusModal 
    const StatusModal = ({ candidate, onClose }) => {
        return (
            <div className={cx('modal-overlay')} onClick={onClose}>
                <div className={cx('modal-content')} onClick={e => e.stopPropagation()}>
                    <h3>Cập nhật trạng thái</h3>
                    <p>Ứng viên: {userDetails[candidate.user_id]?.name}</p>
                    
                    <div className={cx('status-options')}>
                        <button 
                            className={cx('status-btn', 'active')}
                            onClick={() => handleUpdateStatus(candidate.candidate_id, 'Active')}
                        >
                            <FaCheckCircle /> Hoạt động
                        </button>
                        <button 
                            className={cx('status-btn', 'pending')}
                            onClick={() => handleUpdateStatus(candidate.candidate_id, 'Pending')}
                        >
                            <FaClock /> Chờ duyệt
                        </button>
                        <button 
                            className={cx('status-btn', 'closed')}
                            onClick={() => handleUpdateStatus(candidate.candidate_id, 'Closed')}
                        >
                            <FaLock /> Khóa
                        </button>
                    </div>

                    <button className={cx('close-btn')} onClick={onClose}>
                        <FaTimes /> Đóng
                    </button>
                </div>
            </div>
        );
    };

    // Thêm component TabsFilter vào trước table
    const TabsFilter = () => (
        <div className={cx('tabs-filter')}>
            <button 
                className={cx('tab-btn', { active: activeTab === 'All' })}
                onClick={() => setActiveTab('All')}
            >
                Tất cả ({candidateData.length})
            </button>
            <button 
                className={cx('tab-btn', { active: activeTab === 'Active' })}
                onClick={() => setActiveTab('Active')}
            >
                <FaCheckCircle /> Hoạt động ({candidateData.filter(c => c.status === 'Active').length})
            </button>
            <button 
                className={cx('tab-btn', { active: activeTab === 'Pending' })}
                onClick={() => setActiveTab('Pending')}
            >
                <FaClock /> Chờ duyệt ({candidateData.filter(c => c.status === 'Pending').length})
            </button>
            <button 
                className={cx('tab-btn', { active: activeTab === 'Closed' })}
                onClick={() => setActiveTab('Closed')}
            >
                <FaLock /> Đã khóa ({candidateData.filter(c => c.status === 'Closed').length})
            </button>
        </div>
    );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <div className={cx('header-content')}>
                    <h1>
                        <FaUser className={cx('header-icon')} />
                        Quản lý ứng viên
                    </h1>
                    <p>Quản lý thông tin ứng viên trên hệ thống</p>
                </div>
            </div>

            <div className={cx('main-content')}>
                <TabsFilter />
                
                {loading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : (
                    <div className={cx('table-wrapper')}>
                        <table className={cx('candidate-table')}>
                            <thead>
                                <tr>
                                    <th>Thông tin ứng viên</th>
                                    <th>Học vấn & Kinh nghiệm</th>
                                    <th>Thông tin liên hệ</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className={cx('no-results')}>
                                            Không có ứng viên nào {activeTab !== 'All' ? `trong trạng thái ${activeTab}` : ''}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCandidates.map((candidate) => (
                                        <tr key={candidate.candidate_id}>
                                            <td>
                                                <div className={cx('candidate-info')}>
                                                    <h3>{userDetails[candidate.user_id]?.name || "Đang tải..."}</h3>
                                                    <div className={cx('basic-info')}>
                                                        <div className={cx('info-item')}>
                                                            <FaCalendarAlt className={cx('icon')} />
                                                            <span>Ngày tham gia: {formatDate(userDetails[candidate.user_id]?.created_at)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={cx('education-exp')}>
                                                    <div className={cx('info-item')}>
                                                        <FaGraduationCap className={cx('icon')} />
                                                        <span>{candidate.education || "Chưa cập nhật"}</span>
                                                    </div>
                                                    <div className={cx('info-item')}>
                                                        <FaBriefcase className={cx('icon')} />
                                                        <span>{candidate.experience || "Chưa cập nhật"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={cx('contact-info')}>
                                                    <div className={cx('info-item')}>
                                                        <FaEnvelope className={cx('icon')} />
                                                        <span>{userDetails[candidate.user_id]?.email || "Đang tải..."}</span>
                                                    </div>
                                                    <div className={cx('info-item')}>
                                                        <FaPhone className={cx('icon')} />
                                                        <span>{userDetails[candidate.user_id]?.phone || "Chưa cập nhật"}</span>
                                                    </div>
                                                    <div className={cx('info-item')}>
                                                        <FaMapMarkerAlt className={cx('icon')} />
                                                        <span>{candidate.location || "Chưa cập nhật"}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div 
                                                    className={cx('status', candidate.status?.toLowerCase())}
                                                    onClick={() => {
                                                        setSelectedCandidate(candidate);
                                                        setShowStatusModal(true);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {candidate.status || "Chưa cập nhật"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={cx('actions')}>
                                                    <button className={cx('action-btn', 'view')}>
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

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

            {showStatusModal && selectedCandidate && (
                <StatusModal 
                    candidate={selectedCandidate}
                    onClose={() => {
                        setShowStatusModal(false);
                        setSelectedCandidate(null);
                    }}
                />
            )}
        </div>
    );
}

export default Candidate;
