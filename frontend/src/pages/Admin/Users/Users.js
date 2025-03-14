import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Users.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaUser, FaEnvelope, FaCalendarAlt, FaUserCircle } from "react-icons/fa";

const cx = classNames.bind(styles);

function Users() {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await authAPI().get(adminApis.getAllUsers, {
          params: { page: activePage },
        });
        console.log(result.data.users);
        setUserData(result.data.users);
        setTotalPages(result.data.totalPages);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activePage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('header')}>
        <div className={cx('header-content')}>
          <h1>
            <FaUser className={cx('header-icon')} />
            Quản lý người dùng
          </h1>
          <p>Quản lý thông tin người dùng trên hệ thống</p>
        </div>
      </div>

      <div className={cx('main-content')}>
        {loading ? (
          <div className={cx('loading')}>Đang tải dữ liệu...</div>
        ) : (
          <div className={cx('table-wrapper')}>
            <table className={cx('user-table')}>
              <thead>
                <tr>
                  <th>Thông tin người dùng</th>
                  <th>Tên đăng nhập</th>
                  <th>Thông tin liên hệ</th>
                  <th>Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {userData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={cx('no-results')}>
                      Không có dữ liệu người dùng
                    </td>
                  </tr>
                ) : (
                  userData.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={cx('user-info')}>
                          <FaUserCircle className={cx('avatar')} />
                          <div className={cx('info')}>
                            <h3>{user.name || "Chưa cập nhật"}</h3>
                            <span className={cx('role')}>{user.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={cx('username')}>
                          {user.username}
                        </div>
                      </td>
                      <td>
                        <div className={cx('contact-info')}>
                          <div className={cx('info-item')}>
                            <FaEnvelope className={cx('icon')} />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={cx('date-info')}>
                          <FaCalendarAlt className={cx('icon')} />
                          <span>{formatDate(user.created_at)}</span>
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
    </div>
  );
}

export default Users;
