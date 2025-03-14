import { useContext, useState, useEffect } from "react";
import classNames from "classnames/bind";

import styles from "./RecruiterLayout.module.scss";
import Header from "~/components/Layouts/components/Header";
import Footer from "~/components/Layouts/components/Footer";
import { Navigate } from "react-router-dom";
import SidebarSectuiter from "~/components/Layouts/components/SidebarSecruiter";
import SidebarContext from "~/context/SidebarContext";

const cx = classNames.bind(styles);

function RecruiterLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const { isOpenSidebar } = useContext(SidebarContext);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // if (user?.role !== "recruiter") {
  //   // Điều hướng đến trang 403 nếu không có quyền truy cập
  //   return <Navigate to="/403" replace />;
  // }

  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("container", { "mobile": isMobile })}>
        <SidebarSectuiter />
        <div 
          className={cx("content", { 
            "sidebar-collapsed": !isOpenSidebar,
            "mobile": isMobile 
          })}
        >
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RecruiterLayout;
