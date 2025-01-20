import React from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./PaymentReturn.module.scss";
import Logo from "~/components/Logo";

const cx = classNames.bind(styles);

function PaymentReturn() {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const data = searchParams.get("data").split("|");
  const amount = (Number(data[3])).toLocaleString(
    "vi-VN",
    { style: "currency", currency: "VND" }
  );
  const bankCode = data[6];
  const transactionNo = data[7];
  const transactionStatus = data[0] === "00" ? "Thành công": "Thất bại";
  const orderId = data[2]
  const payDate = data[7];

  const formatDate = (dateString) => {
    const date = new Date(
      dateString.slice(0, 4),
      dateString.slice(4, 6) - 1,
      dateString.slice(6, 8),
      dateString.slice(8, 10),
      dateString.slice(10, 12),
      dateString.slice(12, 14)
    );
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className={cx("wrapper")}>
      <Logo />

      <div className={cx("card")}>
        <div className={cx("icon-container")}>
          {transactionStatus === "Thành công" ? (
            <div className={cx("icon", "success-icon")}>
              <i className="fa-solid fa-check"></i>
            </div>
          ) : (
            <div className={cx("icon", "failure-icon")}>
              <i className="fa-solid fa-xmark"></i>
            </div>
          )}
        </div>
        <h1
          className={cx(
            "status",
            transactionStatus === "Thành công" ? "success" : "failure"
          )}
        >
          {transactionStatus === "Thành công"
            ? "Thanh toán thành công!"
            : "Thanh toán thất bại"}
        </h1>
        <div className={cx("details")}>
          <div className={cx("info-item")}>
            <strong>Mã giao dịch:</strong>
            <span className={cx("value")}>{transactionNo}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Mã đơn hàng:</strong>
            <span className={cx("value")}>{orderId}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Ngân hàng:</strong>
            <span className={cx("value")}>{bankCode}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Số tiền:</strong>
            <span className={cx("value")}>{amount}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Thời gian:</strong>
            <span className={cx("value")}>{formatDate(payDate)}</span>
          </div>
        </div>
        <div className={cx("actions")}>
          <Link to="/" className={cx("btn", "btn-primary")}>
            Quay về trang chủ
          </Link>
          <Link to="/user/pay" className={cx("btn", "btn-secondary")}>
            Xem lịch sử giao dịch
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentReturn;
