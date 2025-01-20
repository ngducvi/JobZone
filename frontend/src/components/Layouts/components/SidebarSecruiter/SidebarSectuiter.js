import React, { useContext, useEffect } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./SidebarSectuiter.module.scss";
import { DashboardIcon } from "~/components/Icons";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ModalTypeContext from "~/context/ModalTypeContext";
import SidebarContext from "~/context/SidebarContext";
import UserContext from "~/context/UserContext";
import { authAPI, userApis } from "~/utils/api";
import Modal from "~/components/Modal";

const cx = classNames.bind(styles);

const sidebarIcons = [
  {
    icon: <i className="fa-solid fa-house"></i>,
    title: "Bảng tin",
    to: "/recruiter",
  },
  {
    icon: <i className="fa-solid fa-location-crosshairs"></i>,
    title: "TopCV Insights",
    to: "/recruiter/insights",
  },
  {
    icon: <i className="fa-solid fa-gift"></i>,
    title: "TopCV Rewards",
    to: "/recruiter/rewards",
  },
  {
    icon: <i className="fa-solid fa-arrows-rotate"></i>,
    title: "Đổi quà",
    to: "/recruiter/exchange",
  },
  {
    icon: <i className="fa-solid fa-robot"></i>,
    title: "Toppy AI - Đề xuất",
    to: "/recruiter/ai-suggest",
  },
  {
    icon: <i className="fa-solid fa-file-lines"></i>,
    title: "CV đề xuất",
    to: "/recruiter/suggested-cvs",
  },
  {
    icon: <i className="fa-solid fa-bullhorn"></i>,
    title: "Chiến dịch tuyển dụng",
    to: "/recruiter/campaigns",
  },
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    title: "Tin tuyển dụng",
    to: "/recruiter/jobs",
  },
  {
    icon: <i className="fa-solid fa-folder"></i>,
    title: "Quản lý CV",
    to: "/recruiter/cv-management",
    subMenu: [
      {
        title: "Quản lý nhãn CV",
        to: "/recruiter/cv-management/labels",
      },
    ],
  },
  {
    icon: <i className="fa-solid fa-chart-line"></i>,
    title: "Báo cáo tuyển dụng",
    to: "/recruiter/reports",
  },
  {
    icon: <i className="fa-solid fa-cart-shopping"></i>,
    title: "Mua dịch vụ",
    to: "/recruiter/services",
  },
  {
    icon: <i className="fa-solid fa-star"></i>,
    title: "Dịch vụ của tôi",
    to: "/recruiter/my-services",
  },
  {
    icon: <i className="fa-solid fa-qrcode"></i>,
    title: "Mã ưu đãi",
    to: "/recruiter/promo-codes",
  },
  {
    icon: <i className="fa-solid fa-clock-rotate-left"></i>,
    title: "Theo dõi đơn hàng",
    to: "/recruiter/orders",
  },
  {
    icon: <i className="fa-solid fa-calendar"></i>,
    title: "Lịch sử hoạt động",
    to: "/recruiter/activity-history",
  },
  {
    icon: <i className="fa-solid fa-gear"></i>,
    title: "Cài đặt tài khoản",
    to: "/recruiter/settings",
  },
  {
    icon: <i className="fa-solid fa-bell"></i>,
    title: "Thông báo hệ thống",
    to: "/recruiter/notifications",
    badge: "New",
  },
  {
    icon: <i className="fa-solid fa-circle-question"></i>,
    title: "Hộp thư hỗ trợ",
    to: "/recruiter/support",
  },
];

const SidebarSectuiter = () => {
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
        console.log("user-data ", response.data);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Xử lý lỗi ở đây
        console.log(error);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token, setUser]);

  const handleLogout = () => {
    // Xóa token khỏi localStorage hoặc cookie
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleToggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar); // Toggle trạng thái sidebar
  };

  return (
    <div className={cx("wrapper", { collapsed: !isOpenSidebar })}>
      <div className={cx("header")}>
        <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
        <div className={cx("toggle-buttons")}>
          <i
            className={isOpenSidebar ? "fa-solid fa-bars" : "fa-solid fa-bars"}
            onClick={handleToggleSidebar}
          ></i>
        </div>
      </div>
      <ul className={cx("list")}>
        {sidebarIcons.map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              className={cx("item-btn", {
                actived: item.to === location.pathname,
              })}
              // onClick={() => handleItemClick(item.to)}
            >
              {item.icon}
              <span className={cx("item-title")}>{item.title}</span>
              {item.badge && <span className={cx("badge")}>{item.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>
      <div className={cx("info-user")}>
        {token ? (
          <>
            <Link to="/user" className={cx("avatar")}>
              <Avatar src={images.avatar} fontsize={"5px"} alt={"Avatar"} />
            </Link>
            <div>
              <Link to="/user" className={cx("username")}>
                {user?.name}
              </Link>
              <br />
              <span className={cx("account")}>Tài khoản</span>
            </div>
            <Tippy content="Đăng xuất">
              <i
                className="fa-solid fa-arrow-right-to-bracket"
                onClick={handleLogout}
              ></i>
            </Tippy>
          </>
        ) : (
          <div className={cx("actions")}>
            <button
              className={cx("register-btn")}
              onClick={() => setModalType("registerEmail")}
            >
              Đăng ký
            </button>
            <button
              className={cx("login-btn")}
              onClick={() => setModalType("loginEmail")}
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>
      {modalType && <Modal onClose={closeModal} />}
      <div className={cx("version")}>
        Version 2.25.20
        <br />© 2021 TOPCV. All rights reserved.
      </div>
      <Outlet />
    </div>
  );
};

export default SidebarSectuiter;
