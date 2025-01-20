import React from "react";
import classNames from "classnames/bind";
import styles from "./NotFound.module.scss";
import { useNavigate } from "react-router-dom";
import Logo from "~/components/Logo";

const cx = classNames.bind(styles);

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={cx("not-found")}>
      <Logo />
      <section className={cx("container")}>
        <div className={cx("status-icon", "failure")}>
          <i className="fa-solid fa-exclamation"></i>
        </div>
        <h2 className={cx("title", "failure")}>Trang không tồn tại!</h2>
        <p className={cx("description")}>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.</p>
        <button
          className={cx("home-button")}
          onClick={() => navigate("/", { replace: true })}
        >
          Quay về trang chủ
        </button>
      </section>
    </div>
  );
};

export default NotFound;