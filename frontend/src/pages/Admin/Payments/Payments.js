import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./Payments.module.scss";
import { adminApis, authAPI } from "~/utils/api";
import { NextPageIcon, PrevPageIcon } from "~/components/Icons";
import { FaCreditCard, FaSearch } from "react-icons/fa";

const cx = classNames.bind(styles);

function Payments() {
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paymentData, setPaymentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await authAPI().get(adminApis.getAllPayments, {
        params: {
          page: activePage,
          search: searchTerm,
        },
      });
    
      setPaymentData(result.data.payments);
      setTotalPages(result.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activePage, searchTerm]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setActivePage(newPage);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <div className={cx("header-content")}>
          <h1>
            <FaCreditCard className={cx("header-icon")} />
            Quản lý thanh toán
          </h1>
          <p>Quản lý các giao dịch thanh toán trên hệ thống</p>
        </div>
      </div>

      <div className={cx("main-content")}>
        <div className={cx("actions-bar")}>
          <div className={cx("search-box")}>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc ID..."
              className={cx("search-input")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className={cx("search-icon")} />
          </div>
        </div>

        <div className={cx("table-wrapper")}>
          <table className={cx("payment-table")}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên người dùng</th>
                <th>ID người dùng</th>
                <th>ID hoá đơn</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={cx("loading")}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paymentData.length > 0 ? (
                paymentData.map((data, index) => (
                  <tr key={data?.payment.id}>
                    <td className={cx("center")}>{index + 1}</td>
                    <td>{data?.user?.name}</td>
                    <td>{data?.user?.id}</td>
                    <td>{data?.payment?.id}</td>
                    <td className={cx("amount")}>
                      {formatCurrency(data?.payment?.amount)}
                    </td>
                    <td className={cx("center")}>
                      <span
                        className={cx(
                          "status-badge",
                          data?.payment?.status === "success"
                            ? "status-success"
                            : "status-failed"
                        )}
                      >
                        {data?.payment?.status === "success"
                          ? "Thành công"
                          : "Thất bại"}
                      </span>
                    </td>
                    <td>{formatDate(data?.payment?.transaction_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className={cx("no-data")}>
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={cx("pagination")}>
          <button
            className={cx("page-btn")}
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1}
          >
            <PrevPageIcon />
          </button>
          <span className={cx("page-info")}>
            Trang {activePage} / {totalPages}
          </span>
          <button
            className={cx("page-btn")}
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

export default Payments;
