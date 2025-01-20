import classNames from "classnames/bind";

import styles from "./RecruiterLayout.module.scss";
import Header from "~/components/Layouts/components/Header";
import Footer from "~/components/Layouts/components/Footer";
import { Navigate } from "react-router-dom";
import SidebarSectuiter from "~/components/Layouts/components/SidebarSecruiter";

const cx = classNames.bind(styles);

function RecruiterLayout({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  // if (user?.role !== "recruiter") {
  //   // Điều hướng đến trang 403 nếu không có quyền truy cập
  //   return <Navigate to="/403" replace />;
  // }

  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("container")}>
        <SidebarSectuiter />
        <div className={cx("content")}>{children}</div>
      </div>
      <Footer />
    </div>
  );
}

export default RecruiterLayout;
