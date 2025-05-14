import React, { useContext, useEffect, useState, useRef } from "react";
import classNames from "classnames/bind";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import Avatar from "~/components/Avatar";
import images from "~/assets/images";
import "tippy.js/dist/tippy.css";
import ModalTypeContext from "~/context/ModalTypeContext";
import SidebarContext from "~/context/SidebarContext";
import UserContext from "~/context/UserContext";
import { authAPI, userApis } from "~/utils/api";
import Modal from "~/components/Modal/Modal";
import { FaBell, FaEnvelope, FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import socketService from "~/utils/socket";
import { useNotification } from '~/context/NotificationContext';
import { FaFacebookMessenger } from "react-icons/fa";
const cx = classNames.bind(styles);

const sidebarIcons = [
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    title: "Job",
    to: "/",
    subMenu: [
      {
        title: "Tìm việc làm",
        to: "/user/job-search",
        authRequired: false
      },
      {
        title: "Việc làm đã ứng tuyển",
        to: "/user/jobs-applying",
        authRequired: false
      },
      {
        title: "Việc làm đã lưu",
        to: "/user/save-job",
        authRequired: true
      },
      {
        title: "Việc làm đã xem",
        to: "/user/jobs-viewed",
        authRequired: true
      },
      // Việc làm IT
      {
        title: "Việc làm IT",
        to: "/user/job-it",
        authRequired: false
      },
    
      // top cong ty
      {
        title: "Danh sách  Top công ty",
        to: "/user/top-company",
        authRequired: false
      },
    ]
  },
  {
    icon: <i className="fa-solid fa-briefcase"></i>,
    title: "Resume",
    to: "/user/manager-cv",
    subMenu: [
      {
        title: "Tạo CV",
        to: "/user/create-cv",
        authRequired: false
      },
      {
        title: "Tải CV lên",
        to: "/user/up-cv",
        authRequired: false
      },
      // {
      //   title: "Tạo Cover Letter",
      //   to: "/jobs/cover-letter",
      //   authRequired: false
      // },
      {
        title: "Quản lý CV",
        to: "/user/manager-cv",
        authRequired: true
      },
      // {
      //   title: "Quản lý Cover Letter",
      //   to: "/jobs/manage-cover-letter",
      //   authRequired: true
      // },
      {
        title: "Dịch vụ tư vấn CV",
        to: "/user/cv-consulting",
        authRequired: false
      },
      // {
      //   title: "Thư viện CV theo ngành nghề",
      //   badge: "MỚI",
      //   to: "/user/cv-library",
      //   authRequired: false
      // },
      {
        title: "TopCV Profile",
        to: "/user/job-zone-profile",
        authRequired: true
      },
    ]
  },
  // career handbook
  {
    icon: <i className="fa-solid fa-book"></i>,
    title: "Career Handbook",
    to: "/user/career-handbook",
    subMenu: [
      {
        icon: <i className="fa-solid fa-compass"></i>,
        title: "Định hướng nghề nghiệp",
        to: "/career-handbook/career-orientation"
      },
      {
        icon: <i className="fa-solid fa-magnifying-glass"></i>,
        title: "Bí kíp tìm việc",
        to: "/career-handbook/job-hunting"
      },
      {
        icon: <i className="fa-solid fa-sack-dollar"></i>,
        title: "Chế độ lương thưởng",
        to: "/career-handbook/compensation"
      },
      {
        icon: <i className="fa-solid fa-graduation-cap"></i>,
        title: "Kiến thức chuyên ngành",
        to: "/career-handbook/industry-knowledge"
      },
      {
        icon: <i className="fa-solid fa-briefcase"></i>,
        title: "Hành trang nghề nghiệp",
        to: "/career-handbook/career-preparation"
      },
      {
        icon: <i className="fa-solid fa-chart-line"></i>,
        title: "Thị trường và xu hướng tuyển dụng",
        to: "/career-handbook/recruitment-trends"
      },
    ]
  },
  {
    icon: <i className="fa-solid fa-toolbox"></i>,
    title: "Tools",
    to: "/tools",
    subMenu: [
      {
        // Tinh luong
        icon: <i className="fa-solid fa-calculator"></i>,
        title: "Tính lương",
        to: "/tools/salary-calculator",
      },
      // Test DISC
      {
        icon: <i className="fa-solid fa-chart-simple"></i>,
        title: "Test DISC",
        to: "/tools/test-disc",
      },
      // Cong cu tinh lai kep
      {
        icon: <i className="fa-solid fa-calculator"></i>,
        title: "Tính lãi kép",
        to: "/tools/compound-interest-calculator",
      },
      // tinh tien tiet kiem
      {
        icon: <i className="fa-solid fa-calculator"></i>,
        title: "Tính tiền tiết kiệm",
        to: "/tools/saving-calculator",
      },
      {
        // tool ai
        icon: <i className="fa-solid fa-robot"></i>,
        title: "Tool AI",
        to: "/tools/ai",
      }
      
    ]
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modalType, setModalType } = useContext(ModalTypeContext);
  const { setIsOpenSidebar } = useContext(SidebarContext);
  const { user, setUser } = useContext(UserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [candidate, setCandidate] = useState(null);
  const { unreadCount, updateUnreadCount } = useNotification();
  const [isMobile, setIsMobile] = useState(false);
  const navContainerRef = useRef(null);
  
  const userSidebarIcons =
    user?.role === "admin"
      ? [
          ...sidebarIcons,
          {
            icon: <i className="fa-solid fa-user-shield"></i>,
            title: "Admin",
            to: "/admin",
          },
        ]
      : user?.role === "recruiter"
      ? [
          ...sidebarIcons,
          {
            icon: <i className="fa-solid fa-building"></i>,
            title: "Recruiter",
            to: "/recruiter",
          },
        ]
      : sidebarIcons;

  const token = localStorage.getItem("token");
  
  const closeModal = () => {
    setModalType(null);
  };

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 908);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && navContainerRef.current && !navContainerRef.current.contains(event.target) && !event.target.closest(`.${cx('menu-toggle')}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Reset expanded items when route changes
    setExpandedItems({});
  }, [location.pathname]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
        setCandidate(response.data.candidate);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log(error);
      }
    };
    if (token) {
      fetchUserData();
    }
  }, [token, setUser]);

  useEffect(() => {
    const setupSocket = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        const token = localStorage.getItem("token");
        if (!socketService.socket) {
          socketService.connect(token);
        }
        socketService.joinUserRoom(response.data.user.id);
        
        // Lắng nghe thông báo mới và cập nhật số lượng
        socketService.onNewNotification(() => {
          // Gọi API để lấy số lượng thông báo chưa đọc mới nhất
          const fetchUnreadCount = async () => {
            try {
              const response = await authAPI().get(userApis.getUnreadNotificationsCount);
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

    if (token) {
      setupSocket();
    }

    return () => {
      // Don't disconnect socket here as it might be used by other features
      // Just remove the notification listener
      if (socketService.socket) {
        socketService.socket.off('new_notification');
      }
    };
  }, [token, updateUnreadCount]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle submenu visibility on mobile
  const toggleSubmenu = (index) => {
    if (isMobile) {
      setExpandedItems(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    }
  };

  // Check if submenu is expanded
  const isSubmenuExpanded = (index) => {
    return expandedItems[index] || false;
  };

  // Check if current route is in submenu
  const isRouteInSubmenu = (item) => {
    if (!item.subMenu) return false;
    return item.subMenu.some(sub => sub.to === location.pathname);
  };

  return (
    <>
      <div className={cx("wrapper")}>
        <div className={cx("header")}>
          <Link to="/" className={cx("logo-container")}>
            <Avatar src={images.logo} fontsize={"5px"} alt={"Logo"} />
            <h1 className={cx("title")}>JobZone</h1>
          </Link>

          <div 
            className={cx("menu-toggle", { active: isMobileMenuOpen })}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <FaTimes className={cx("menu-toggle__icon")} />
            ) : (
              <FaBars className={cx("menu-toggle__icon")} />
            )}
          </div>

          <div className={cx("search-container")}>
            <input 
              type="text"
              placeholder="Search..."
              className={cx("search-input")}
            />
            <i className="fa-solid fa-search"></i>
          </div>

          <div 
            ref={navContainerRef}
            className={cx("nav-container", { active: isMobileMenuOpen })}
          >
            <ul className={cx("nav-list")}>
              {userSidebarIcons.map((item, index) => (
                (!item.authRequired || (item.authRequired && user?.role === 'user')) && (
                  <li key={index}>
                    {isMobile && item.subMenu ? (
                      <div className={cx("nav-item-wrapper")}>
                        <div 
                          className={cx("nav-item", {
                            active: item.to === location.pathname || isRouteInSubmenu(item),
                          })}
                          onClick={() => toggleSubmenu(index)}
                        >
                          <span className={cx("item-title")}>{item.title}</span>
                          {isSubmenuExpanded(index) ? (
                            <FaChevronUp className={cx("submenu-toggle")} />
                          ) : (
                            <FaChevronDown className={cx("submenu-toggle")} />
                          )}
                        </div>
                        {(isSubmenuExpanded(index) || isRouteInSubmenu(item)) && (
                          <div className={cx("submenu", "mobile-submenu")}>
                            {item.subMenu
                              .filter(subItem => !subItem.authRequired || token)
                              .map((subItem, subIndex) => (
                                <Link
                                  key={subIndex}
                                  to={subItem.to}
                                  className={cx("submenu-item", {
                                    active: subItem.to === location.pathname
                                  })}
                                >
                                  <span>{subItem.title}</span>
                                  {subItem.badge && <span className={cx("submenu-badge")}>{subItem.badge}</span>}
                                  {subItem.icon && <span className={cx("submenu-icon")}>{subItem.icon}</span>}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.to}
                        className={cx("nav-item", {
                          active: item.to === location.pathname || isRouteInSubmenu(item),
                        })}
                      >
                        <span className={cx("item-title")}>{item.title}</span>
                        {item.subMenu && (
                          <div className={cx("submenu")}>
                            {item.subMenu
                              .filter(subItem => !subItem.authRequired || token)
                              .map((subItem, subIndex) => (
                                <Link
                                  key={subIndex}
                                  to={subItem.to}
                                  className={cx("submenu-item", {
                                    active: subItem.to === location.pathname
                                  })}
                                >
                                  <span>{subItem.title}</span>
                                  {subItem.badge && <span className={cx("submenu-badge")}>{subItem.badge}</span>}
                                  {subItem.icon && <span className={cx("submenu-icon")}>{subItem.icon}</span>}
                                </Link>
                              ))}
                          </div>
                        )}
                      </Link>
                    )}
                  </li>
                )
              ))}
            </ul>

            <div className={cx("user-section")}>
              {token ? (
                <>
                  <div className={cx("notification-icon")}>
                    <Link to="/tai-khoan/notifications" className={cx("bell-icon")}>
                      <FaBell />
                      {unreadCount > 0 && <span className={cx("badge")}>{unreadCount}</span>}
                    </Link>
                  </div>
                  <div className={cx("message-icon")}>
                    <Link to="/messages" className={cx("envelope-icon")}>
                      <FaFacebookMessenger />
                    </Link>
                  </div>
                  <div className={cx("user-dropdown")}>
                    <div className={cx("avatar-container")}>
                      <Avatar src={candidate?.profile_picture || images.avatar} fontsize={"5px"} alt={"Avatar"} 
                      />
                      <div className={cx("dropdown-menu")}>
                        <div className={cx("user-info")}>
                          <span className={cx("user-name")}>{user?.name || "Vĩ Nguyễn Đức"}</span>
                          <span className={cx("user-id")}>Mã ứng viên: #{user?.id || "9042870"}</span>
                          <span className={cx("user-email")}>{user?.email || "ngducvicc@gmail.com"}</span>
                        </div>
                        
                        <Link to="/user" className={cx("dropdown-item")}>
                          <i className="fa-regular fa-user"></i>
                          <span>Cài đặt thông tin cá nhân</span>
                        </Link>
                        
                        <Link to="/pricing" className={cx("dropdown-item")}>
                          <i className="fa-solid fa-crown"></i>
                          <span>Nâng cấp tài khoản VIP</span>
                        </Link>
                        
                        <Link to="/tai-khoan/notifications" className={cx("dropdown-item")}>
                          <i className="fa-solid fa-bell"></i>
                          <span>Cài đặt thông báo việc làm</span>
                        </Link>
                        
                        <Link to="/tai-khoan/setting-email" className={cx("dropdown-item")}>
                          <i className="fa-regular fa-envelope"></i>
                          <span>Cài đặt nhận email</span>
                        </Link>
                        
                        <Link to="/user" className={cx("dropdown-item")}>
                          <i className="fa-solid fa-shield"></i>
                          <span>Cài đặt bảo mật</span>
                        </Link>
                        
                        <button className={cx("dropdown-item")} onClick={handleLogout}>
                          <i className="fa-solid fa-arrow-right-from-bracket"></i>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={cx("auth-buttons")}>
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
                  <button
                    className={cx("post-job-btn")}
                    onClick={() => navigate('/recruiter')}
                  >
                    Đăng tin tuyển dụng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div 
          className={cx("overlay", { active: isMobileMenuOpen })}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {modalType && <Modal onClose={closeModal} />}
      </div>
      <Outlet />
    </>
  );
};

export default Sidebar;
