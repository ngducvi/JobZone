import React from "react";
import classNames from "classnames/bind";
import styles from "./Forbidden.module.scss";
import { useNavigate } from "react-router-dom";
import Logo from "~/components/Logo";

const cx = classNames.bind(styles);

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className={cx("forbidden")}>
      <Logo />
      <section className={cx("container")}>
        <div className={cx("status-icon")}>
          <i className="fa-solid fa-shield-exclamation"></i>
        </div>
        <h2 className={cx("title")}>403 - Truy cập bị từ chối</h2>
        <p className={cx("description")}>
          Rất tiếc, bạn không có quyền truy cập vào trang này. Vui lòng kiểm tra quyền hạn hoặc liên hệ với quản trị viên để được hỗ trợ.
        </p>
        <div className={cx("buttons")}>
          <button
            className={cx("back-button")}
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left"></i>
            Quay lại
          </button>
          <button
            className={cx("home-button")}
            onClick={() => navigate("/", { replace: true })}
          >
            <i className="fa-solid fa-home"></i>
            Trang chủ
          </button>
        </div>
      </section>
    </div>
  );
};

export default Forbidden;
