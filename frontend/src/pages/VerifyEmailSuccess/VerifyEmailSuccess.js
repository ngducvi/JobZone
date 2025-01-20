import React from "react";
import classNames from "classnames/bind";
import styles from "./VerifyEmailSuccess.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "~/components/Logo";

const cx = classNames.bind(styles);

const VerifyEmailSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy trạng thái từ query string
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");

  const isSuccess = status === "success";

  return (
    <div className={cx("verify-email-success")}>
    <Logo />
      <section className={cx("container")}>
        <div
          className={cx(
            "status-icon",
            { success: isSuccess },
            { failure: !isSuccess }
          )}
        >
          <i
            className={isSuccess ? "fa-solid fa-check" : "fa-solid fa-xmark"}
          ></i>
        </div>
        <h2 className={cx("title", { success: isSuccess, failure: !isSuccess })}>
          {isSuccess ? "Xác thực thành công!" : "Xác thực thất bại!"}
        </h2>
        <p className={cx("description")}>
          {isSuccess
            ? "Email của bạn đã được xác minh thành công. Đăng nhập và sử dụng ngay!"
            : "Đường dẫn xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại."}
        </p>
        <button
          className={cx("login-button")}
          onClick={() => navigate("/", { replace: true })}
        >
          Quay về trang chủ
        </button>
      </section>
    </div>
  );
};

export default VerifyEmailSuccess;
