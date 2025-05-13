import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

import styles from "./SidebarAdmin.module.scss";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import ModalTypeContext from "~/context/ModalTypeContext";
import SidebarContext from "~/context/SidebarContext";
import UserContext from "~/context/UserContext";
import { authAPI, userApis } from "~/utils/api";
import Modal from "~/components/Modal/Modal";

const cx = classNames.bind(styles);

// Di chuyển sidebarIcons ra ngoài component
const sidebarIcons = [
  {
    id: "dashboard",
    icon: <i className="fa-solid fa-chart-line"></i>,
    title: "Dashboard",
    to: "/admin",
    subMenu: [
      {
        title: "Thống kê tổng thể",
        to: "/admin",
      },
      {
        title: "Thông kê ứng viên",
        to: "/admin/dashboarda",
      },
      {
        title: "Thông kê công ty",
        to: "/admin/dashboardb",
      },
    ],
  },
  {
    id: "users",
    icon: <i className="fa-solid fa-users"></i>,
    title: "Quản lý người dùng",
    to: "/admin/users",
    subMenu: [
      {
        title: "Danh sách người dùng",
        to: "/admin/users",
      },
      {
        title: "Nhà tuyển dụng",
        to: "/admin/recruiter",
      },
      {
        title: "Ứng viên",
        to: "/admin/candidate",
      },
      // {
      //   title: "Phân quyền",
      //   to: "/admin/users/roles",
      // },
    ],
  },
  // quản lý công ty
  {
    id: "company",
    icon: <i className="fa-solid fa-building"></i>,
    title: "Quản lý công ty",
    to: "/admin/company",
  },
  // quản lý việc làm
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    title: "Quản lý việc làm",
    to: "/admin/job",
  },
  {
    id: "category",
    icon: <i className="fa-solid fa-list"></i>,
    title: "Quản lý danh mục",
    to: "/admin/category",
  },
  // quản lý thanh toán
  {
    icon: <i className="fa-solid fa-credit-card"></i>,
    title: "Quản lý thanh toán",
    to: "/admin/payments",
  },
  // quản lý bài viết
  {
    icon: <i className="fa-solid fa-newspaper"></i>,
    title: "Quản lý bài viết",
    to: "/admin/career-handbook",
  },

];

// Thêm overlay component
const MobileOverlay = ({ isOpen, onClose }) => (
  <div 
    className={cx('mobile-overlay', { active: isOpen })} 
    onClick={onClose}
  />
);

const SidebarAdmin = () => {
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [openSubmenuId, setOpenSubmenuId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeModal = () => {
    setModalType(null);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
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
    if (window.innerWidth > 768) {
      // Desktop: toggle collapse sidebar
      setIsOpenSidebar(!isOpenSidebar);
    } else {
      // Mobile: toggle mobile menu
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  // Thêm useEffect để lắng nghe thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = (item) => {
    if (item.subMenu) {
      setOpenSubmenuId(openSubmenuId === item.id ? null : item.id);
    } else {
      navigate(item.to);
    }
  };

  return (
    <>
      <button 
        className={cx('mobile-menu-toggle', { active: isMobileMenuOpen })}
        onClick={handleToggleSidebar}
      >
        <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      <div className={cx('wrapper', { 
        collapsed: !isOpenSidebar,
        'mobile-open': isMobileMenuOpen 
      })}>
        <div className={cx("header")}>
          <Link to="/" className={cx("logo-link")}>
            <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
            <h1 className={cx("logo-title")}>JobZone Admin</h1>
          </Link>
          {window.innerWidth > 768 && (
            <button className={cx("toggle-btn")} onClick={handleToggleSidebar}>
              <i className={`fa-solid ${isOpenSidebar ? "fa-chevron-left" : "fa-chevron-right"}`} />
            </button>
          )}
        </div>

        <div className={cx("menu-container")}>
          <ul className={cx("menu-list")}>
            {sidebarIcons.map((item) => (
              <li key={item.id || item.to}>
                {item.subMenu ? (
                  <div
                    className={cx("menu-item", {
                      active:
                        item.to === location.pathname ||
                        (item.subMenu &&
                          item.subMenu.some(
                            (sub) => sub.to === location.pathname
                          )),
                      "has-submenu": true,
                      "submenu-open": openSubmenuId === item.id,
                    })}
                    onClick={() => handleMenuClick(item)}
                  >
                    {item.icon}
                    <span className={cx("item-title")}>{item.title}</span>
                    <i
                      className={cx("submenu-arrow", "fa-solid", {
                        "fa-chevron-down": openSubmenuId === item.id,
                        "fa-chevron-right": openSubmenuId !== item.id,
                      })}
                    ></i>
                  </div>
                ) : (
                  <Link
                    to={item.to}
                    className={cx("menu-item", {
                      active: item.to === location.pathname,
                    })}
                  >
                    {item.icon}
                    <span className={cx("item-title")}>{item.title}</span>
                  </Link>
                )}

                {item.subMenu && (
                  <ul
                    className={cx("submenu", { open: openSubmenuId === item.id })}
                  >
                    {item.subMenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.to}
                          className={cx("submenu-item", {
                            active: subItem.to === location.pathname,
                          })}
                          onClick={() => setOpenSubmenuId(null)}
                        >
                          <span>{subItem.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={cx("user-section")}>
          {token ? (
            <div className={cx("user-info")}>
              <div className={cx("avatar-container")}>
                <Avatar src={images.avatar} fontsize={"5px"} alt={"Avatar"} />
                <div className={cx("online-status")}></div>
              </div>
              <div className={cx("user-details")}>
                <span className={cx("user-name")}>{user?.name || "Admin"}</span>
                <span className={cx("user-role")}>Administrator</span>
              </div>
              <Tippy content="Đăng xuất">
                <button className={cx("logout-btn")} onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </Tippy>
            </div>
          ) : (
            <div className={cx("login-section")}>
              <button
                className={cx("login-btn")}
                onClick={() => setModalType("loginEmail")}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>

      <div 
        className={cx('mobile-overlay', { active: isMobileMenuOpen })} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {modalType && <Modal onClose={closeModal} />}
    </>
  );
};

export default SidebarAdmin;
