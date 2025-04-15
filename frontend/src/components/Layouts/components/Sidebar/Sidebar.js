import React, { useContext, useEffect, useState } from "react";
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
    to: "/profile/cv",
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
      {
        title: "Tạo Cover Letter",
        to: "/jobs/cover-letter",
        authRequired: false
      },
      {
        title: "Quản lý CV",
        to: "/user/manager-cv",
        authRequired: true
      },
      {
        title: "Quản lý Cover Letter",
        to: "/jobs/manage-cover-letter",
        authRequired: true
      },
      {
        title: "Dịch vụ tư vấn CV",
        to: "/jobs/cv-consulting",
        authRequired: false
      },
      {
        title: "Thư viện CV theo ngành nghề",
        badge: "MỚI",
        to: "/user/cv-library",
        authRequired: false
      },
      {
        title: "TopCV Profile",
        to: "/user/job-zone-profile",
        authRequired: true
      },
      {
        title: "Test Template",
        to: "/test-template",
        authRequired: false
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
      {
        icon: <i className="fa-solid fa-file-lines"></i>,
        title: "Tạo bài viết SEO",
        to: "/templates/create-seo-blog",
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
  const [candidate, setCandidate] = useState(null);
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        setUser(response.data.user);
        setCandidate(response.data.candidate);
        console.log("response.data.candidate", response.data.candidate);
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

  const handleLogout = () => {
    setIsDropdownOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className={cx("search-container")}>
            <input 
              type="text"
              placeholder="Search..."
              className={cx("search-input")}
            />
            <i className="fa-solid fa-search"></i>
          </div>

          <div className={cx("nav-container", { active: isMobileMenuOpen })}>
            <ul className={cx("nav-list")}>
              {userSidebarIcons.map((item, index) => (
                (!item.authRequired || (item.authRequired && user?.role === 'user')) && (
                  <li key={index}>
                    <Link
                      to={item.to}
                      className={cx("nav-item", {
                        active: item.to === location.pathname || 
                               (item.subMenu && item.subMenu.some(sub => sub.to === location.pathname)),
                      })}
                    >
                      {/* {item.icon} */}
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
                  </li>
                )
              ))}
            </ul>

            <div className={cx("user-section")}>
              {token ? (
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
                      
                      <Link to="/vip" className={cx("dropdown-item")}>
                        <i className="fa-solid fa-crown"></i>
                        <span>Nâng cấp tài khoản VIP</span>
                      </Link>
                      
                      <Link to="/gifts" className={cx("dropdown-item")}>
                        <i className="fa-solid fa-gift"></i>
                        <span>Kích hoạt quà tặng</span>
                      </Link>
                      
                      <Link to="/cv" className={cx("dropdown-item")}>
                        <i className="fa-regular fa-eye"></i>
                        <span>Nhà tuyển dụng xem hồ sơ</span>
                      </Link>
                      
                      <Link to="/job-alert" className={cx("dropdown-item")}>
                        <i className="fa-regular fa-bell"></i>
                        <span>Cài đặt gợi ý việc làm</span>
                      </Link>
                      
                      <Link to="/notifications" className={cx("dropdown-item")}>
                        <i className="fa-solid fa-bell"></i>
                        <span>Cài đặt thông báo việc làm</span>
                      </Link>
                      
                      <Link to="/email-settings" className={cx("dropdown-item")}>
                        <i className="fa-regular fa-envelope"></i>
                        <span>Cài đặt nhận email</span>
                      </Link>
                      
                      <Link to="/security" className={cx("dropdown-item")}>
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
