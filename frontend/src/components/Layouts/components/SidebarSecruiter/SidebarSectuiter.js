import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { faStar, faCrown, faGem } from "@fortawesome/free-solid-svg-icons";
import { useNotification } from '~/context/NotificationContext';
import socketService from '~/utils/socket';

import styles from "./SidebarSectuiter.module.scss";
import { DashboardIcon } from "~/components/Icons";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ModalTypeContext from "~/context/ModalTypeContext";
import SidebarContext from "~/context/SidebarContext";
import UserContext from "~/context/UserContext";
import { authAPI, userApis, recruiterApis } from "~/utils/api";
import Modal from "~/components/Modal/Modal";

const cx = classNames.bind(styles);

const planDetails = {
  Basic: { color: '#f0ad4e', icon: faStar },
  Pro: { color: '#5bc0de', icon: faCrown },
  ProMax: { color: '#d9534f', icon: faGem },
};

const sidebarIcons = [
  {
    icon: <i className="fa-solid fa-house"></i>,
    title: "Bảng tin",
    to: "/recruiter",
    minPlan: "Basic"
  },
  {
    icon: <i className="fa-solid fa-message"></i>,
    title: "Tin nhắn",
    to: "/recruiter/messages",
    minPlan: "Basic"
  },
  // đăng tin tuyển dụng
  {
    icon: <i className="fa-solid fa-bullhorn"></i>,
    title: "Đăng tin tuyển dụng",
    to: "/recruiter/post-job",
    minPlan: "Basic"
  },
  {
    icon: <i className="fa-solid fa-magnifying-glass"></i>,
    title: "Tìm kiếm ứng viên",
    to: "/recruiter/search-candidate",
    minPlan: "Basic"
  },
  {
    icon: <i className="fa-solid fa-robot"></i>,
    title: "Toppy AI - Đề xuất",
    to: "/recruiter/ai-suggest",
    minPlan: "ProMax",
    comingSoon: true,
  },
  // {
  //   icon: <i className="fa-solid fa-bullhorn"></i>,
  //   title: "Chiến dịch tuyển dụng",
  //   to: "/recruiter/campaigns",
  //   minPlan: "Pro",
  //   disabled: true,
  // },
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    title: "Tin tuyển dụng",
    to: "/recruiter/jobs",
    minPlan: "Basic"
  },
  {
    icon: <i className="fa-solid fa-folder"></i>,
    title: "Quản lý CV",
    to: "/recruiter/cv-management",
    minPlan: "Basic",
    subMenu: [
      {
        title: "Quản lý nhãn CV",
        to: "/recruiter/cv-management/labels",
        minPlan: "Basic"
      },
    ],
  },
  {
    icon: <i className="fa-solid fa-chart-line"></i>,
    title: "Báo cáo tuyển dụng",
    to: "/recruiter/reports",
    minPlan: "Pro",
    // disabled: true,
  },
  {
    icon: <i className="fa-solid fa-cart-shopping"></i>,
    title: "Mua dịch vụ",
    to: "/recruiter/pricing",
    minPlan: "Basic"
  },
  {
    icon: <i className="fa-solid fa-star"></i>,
    title: "Dịch vụ của tôi",
    to: "/recruiter/my-services",
    minPlan: "Basic"
  },
  // {
  //   icon: <i className="fa-solid fa-calendar"></i>,
  //   title: "Lịch sử hoạt động",
  //   to: "/recruiter/activity-history",
  //   minPlan: "Basic"
  // },
  {
    icon: <i className="fa-solid fa-gear"></i>,
    title: "Cài đặt tài khoản",
    to: "/recruiter/settings",
  },

  // {
  //   icon: <i className="fa-solid fa-bell"></i>,
  //   title: "Thông báo hệ thống",
  //   to: "/recruiter/notifications",
  //   badge: "New",
  // },
  // {
  //   icon: <i className="fa-solid fa-circle-question"></i>,
  //   title: "Hộp thư hỗ trợ",
  //   to: "/recruiter/support",
  // },
  {
    icon: <i className="fa-solid fa-bell"></i>,
    title: "Quản lý thông báo",
    to: "/recruiter/notifications-manager",
  },
];

const SidebarSectuiter = () => {
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);
  const { user, setUser } = useContext(UserContext);
  const { unreadCount, updateUnreadCount } = useNotification();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('Basic');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const token = localStorage.getItem("token");

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
        // console.log("user-data ", response.data);
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

  useEffect(() => {
    const fetchCompanyPlan = async () => {
      try {
        const responseCompany = await authAPI().get(recruiterApis.getAllRecruiterCompanies);
        setCurrentPlan(responseCompany.data.companies[0].plan);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCompanyPlan();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpenSidebar(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpenSidebar]);

  useEffect(() => {
    const setupSocket = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!socketService.socket) {
          socketService.connect(token);
        }
        socketService.joinUserRoom(user?.id);
        
        // Lắng nghe thông báo mới và cập nhật số lượng
        socketService.onNewNotification(() => {
          // Gọi API để lấy số lượng thông báo chưa đọc mới nhất
          const fetchUnreadCount = async () => {
            try {
              const response = await authAPI().get(recruiterApis.getUnreadNotificationsCount);
              if (response.data.success) {
                updateUnreadCount(response.data.count);
              }
            } catch (error) {
              console.error('Error fetching unread notifications count:', error);
            }
          };
          fetchUnreadCount();
        });
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    if (token && user?.id) {
      setupSocket();
    }

    return () => {
      if (socketService.socket) {
        socketService.socket.off('new_notification');
      }
    };
  }, [token, user?.id, updateUnreadCount]);

  const canAccessFeature = (minPlan) => {
    if (!minPlan) return true; // Nếu không có minPlan thì cho phép truy cập
    
    const planLevels = {
      'Basic': 1,
      'Pro': 2,
      'ProMax': 3
    };
    return planLevels[currentPlan] >= planLevels[minPlan];
  };

  const handleLogout = () => {
    // Xóa token khỏi localStorage hoặc cookie
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsOpenSidebar(true);
    } else {
    setIsOpenSidebar(!isOpenSidebar);
    localStorage.setItem("sidebarOpen", !isOpenSidebar);
    }
  };

  // Thêm useEffect để lấy trạng thái sidebar từ localStorage khi component mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    if (savedState !== null) {
      setIsOpenSidebar(savedState === "true");
    }
  }, []);

  const closeMobileMenu = () => {
    if (isMobile) setIsOpenSidebar(false);
  };

  return (
    <>
      <div className={cx("wrapper", { 
        collapsed: !isOpenSidebar && !isMobile,
        show: isOpenSidebar && isMobile
      })}>
        <div className={cx("header")}>
          <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
          {/* nhà tuyển dụng */}
          <div className={cx("toggle-buttons")}>
            <i
              className={`fa-solid ${isOpenSidebar ? 'fa-xmark' : 'fa-bars'}`}
              style={{
                color: isOpenSidebar && isMobile ? '#fff' : '#013a74'
              }}
              onClick={handleToggleSidebar}
            ></i>
          </div>
        </div>
        <ul className={cx("list")}>
          {sidebarIcons.map((item, index) => (
            <li key={index}>
              <Link
                to={(!canAccessFeature(item.minPlan) || item.disabled) ? "#" : item.to}
                className={cx("item-btn", {
                  actived: item.to === location.pathname,
                  disabled: !canAccessFeature(item.minPlan) || item.disabled,
                  [`plan-${item.minPlan?.toLowerCase()}`]: item.minPlan
                })}
                onClick={(e) => {
                  if (!canAccessFeature(item.minPlan) || item.disabled) {
                    e.preventDefault();
                    toast(
                      !canAccessFeature(item.minPlan)
                        ? `Tính năng này chỉ khả dụng cho gói ${item.minPlan} trở lên`
                        : item.comingSoon
                        ? "Tính năng sẽ sớm ra mắt!"
                        : "Tính năng đang được phát triển!",
                      {
                        icon: '🔒',
                        duration: 3000,
                      }
                    );
                  }
                }}
              >
                {item.icon}
                <span className={cx("item-title")}>
                  {item.title}
                  {item.comingSoon && <small className={cx("coming-soon")}> (Sắp ra mắt)</small>}
                </span>
                {item.title === "Quản lý thông báo" && unreadCount > 0 && (
                  <span className={cx("notification-badge")}>{unreadCount}</span>
                )}
                {item.minPlan && !canAccessFeature(item.minPlan) && (
                  <span className={cx("plan-badge", `plan-${item.minPlan.toLowerCase()}`)}>{item.minPlan}</span>
                )}
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
                onClick={() => setModalType("LoginRecruiter")}
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

      {/* Overlay cho mobile */}
      <div 
        className={cx("sidebar-overlay", { show: isOpenSidebar && isMobile })}
        onClick={closeMobileMenu}
      />
    </>
  );
};

export default SidebarSectuiter;
