import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Candidate.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaCalendarAlt } from "react-icons/fa";

const cx = classNames.bind(styles);

function Candidate() {
    const [activePage, setActivePage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [candidateData, setCandidateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});

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

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

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
                {candidateData.map((candidate) => (
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
                      <div className={cx('status', candidate.status?.toLowerCase())}>
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
                ))}
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
    </div>
  );
}

export default Candidate;
