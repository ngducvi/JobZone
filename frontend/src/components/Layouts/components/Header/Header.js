import classNames from "classnames/bind";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import ModalTypeContext from "~/context/ModalTypeContext";
import BackButton from "~/components/BackButton";
import styles from "./Header.module.scss";
import images from "~/assets/images";
import config from "~/config";
import { authAPI, userApis } from "~/utils/api";
import UserContext from "~/context/UserContext";
import SidebarContext from "~/context/SidebarContext";
const cx = classNames.bind(styles);

function Header({ transparent, hasBackBtn, isAdmin }) {
  const { setUser } = useContext(UserContext);

  const location = useLocation();
  const {  setModalType } = useContext(ModalTypeContext);
  const { isOpenSidebar, setIsOpenSidebar } = useContext(SidebarContext);

  
  const token = localStorage.getItem("token");

  // eslint-disable-next-line
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await authAPI().get(userApis.getCurrentUser);
          setUser(response.data.user);
        } catch (error) {
          if (error) {
            localStorage.removeItem("token");
          }
          // Xử lý lỗi ở đây
          console.log(error);
        }
      };
      fetchUserData();
    }
  }, [token, setUser]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const action = queryParams.get("action");

    // Kiểm tra action và đặt modalType
    if (action === "reset_password") {
      setModalType("resetPassword");
    }
  }, [location.search, setModalType]);


 
  const handleToggleSidebar = () => {
    setIsOpenSidebar(!isOpenSidebar); // Toggle trạng thái sidebar
  };

  return (
    <header className={cx("wrapper", { transparent })}>
      <div className={cx("inner")}>
        <div className={cx("navbar")}>
          <Link to={config.routes.home}>
            <img
              className={cx("logo")}
              src={images.logo}
              alt="BIT Group_logo"
            />
          </Link>
          {config.routes.registeredCourse === location.pathname ||
          hasBackBtn ? (
            <BackButton />
          ) : (
            <Link to={config.routes.home} className={cx("logo-heading")}>
              <h4>JOB ZONE</h4>
            </Link>
          )}
        </div>


        <div className={cx("actions")}>
          <div className={cx("sidebar-toggle")} onClick={handleToggleSidebar}>
            <i className="fa-solid fa-bars"></i>
          </div>
        </div>

        
      </div>
    </header>
  );
}

export default Header;
