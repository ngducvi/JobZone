import React, { useEffect, useState, useContext, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./Userinfo.module.scss";
import { Link } from "react-router-dom";
import UserContext from "~/context/UserContext";
const cx = classNames.bind(styles);

const menuItems = [
  {
    to: "/tai-khoan/profile",
    icon: "fa-regular fa-user",
    title: "Thông tin cá nhân",
    description: "Quản lý thông tin cá nhân của bạn",
    bgColor: "rgba(79, 70, 229, 0.1)",
    color: "#4f46e5"
  },
  {
    to: "/user/manager-cv",
    icon: "fa-regular fa-file-lines",
    title: "Hồ sơ & CV",
    description: "Quản lý CV và thông tin nghề nghiệp",
    bgColor: "rgba(8, 145, 178, 0.1)",
    color: "#0891b2"
  },
  {
    to: "/user/applications",
    icon: "fa-solid fa-briefcase",
    title: "Việc làm đã ứng tuyển",
    description: "Xem và quản lý các công việc đã ứng tuyển",
    bgColor: "rgba(5, 150, 105, 0.1)",
    color: "#059669"
  },
  {
    to: "/user/saved-jobs",
    icon: "fa-regular fa-bookmark",
    title: "Việc làm đã lưu",
    description: "Xem danh sách việc làm đã lưu",
    bgColor: "rgba(124, 58, 237, 0.1)",
    color: "#7c3aed"
  },
  {
    to: "/user/reviews",
    icon: "fa-regular fa-star",
    title: "Đánh giá của tôi",
    description: "Quản lý đánh giá và nhận xét về công ty",
    bgColor: "rgba(245, 158, 11, 0.1)",
    color: "#f59e0b"
  },
  {
    to: "/user/change-password",
    icon: "fa-solid fa-shield-halved",
    title: "Bảo mật",
    description: "Cài đặt bảo mật và quyền riêng tư",
    bgColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444"
  },
  {
    to: "/user/notifications",
    icon: "fa-regular fa-bell",
    title: "Thông báo",
    description: "Tùy chỉnh cài đặt thông báo",
    bgColor: "rgba(234, 88, 12, 0.1)",
    color: "#ea580c"
  },
  {
    to: "/user/wallet",
    icon: "fa-solid fa-wallet",
    title: "Ví của tôi",
    description: "Quản lý giao dịch và thanh toán",
    bgColor: "rgba(16, 185, 129, 0.1)",
    color: "#10b981"
  }
];

function Userinfo() {
  const { user } = useContext(UserContext);
  
  // Lọc menuItems dựa trên role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'recruiter') {
      // Ẩn các mục không dành cho recruiter
      return ![
        '/user/manager-cv',
        '/user/applications', 
        '/user/saved-jobs'
      ].includes(item.to);
    }
    return true; // Hiện tất cả cho user thường
  });

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("header")}>
          <h1 className={cx("title")}>Quản lý tài khoản</h1>
          <p className={cx("subtitle")}>
            Quản lý thông tin cá nhân và cài đặt tài khoản của bạn
          </p>
        </div>

        <div className={cx("menu-grid")}>
          {filteredMenuItems.map((item, index) => (
            <Link to={item.to} key={index} className={cx("menu-item")}>
              <div 
                className={cx("icon-wrapper")}
                style={{
                  backgroundColor: item.bgColor,
                  color: item.color
                }}
              >
                <i className={item.icon}></i>
              </div>
              <div className={cx("content")}>
                <h3 className={cx("item-title")} style={{color: item.color}}>
                  {item.title}
                </h3>
                <p className={cx("description")}>{item.description}</p>
              </div>
              <div className={cx("arrow")}>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Userinfo;