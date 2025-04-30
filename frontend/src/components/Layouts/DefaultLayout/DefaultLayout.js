import classNames from "classnames/bind";

import styles from "./DefaultLayout.module.scss";
import Header from "~/components/Layouts/components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import userServices from "~/services/userServices";
import { Link } from "react-router-dom";
import images from "~/assets/images";

const cx = classNames.bind(styles);
function DefaultLayout({ children }) {
  const [balance, setBalance] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const token = localStorage.getItem("token");

  // useEffect(() => {
  //   const getBalance = async () => {
  //     try {
  //       const res = await userServices.getBalance();
  //       setBalance(res);
  //     } catch (error) {
  //       console.error("Failed to fetch data:", error);
  //     }
  //   };
  //   if (token) {
  //     getBalance();
  //   }
  // }, [token]);
  // const updateBalance = async () => {
  //   try {
  //     const res = await userServices.getBalance();
  //     setBalance(res);
  //   } catch (error) {
  //     console.error("Failed to fetch data:", error);
  //   }
  // };
  
  return (
    <div className={cx("wrapper")}>
      <Header />
      <div className={cx("container")}>
        <Sidebar />
        <div className={cx("content")}>
          {children}
          <div className={cx("ai-assistant")} onClick={() => setShowChat(true)}>
            <img src={images.ai_logo} alt="AI Assistant" />
          </div>

          {showChat && (
            <div className={cx("chat-modal")}>
              <div className={cx("chat-header")}>
                <div className={cx("chat-title")}>
                  <img src={images.ai_logo} alt="AI Assistant" />
                  <span>CV AI sẵn sàng hỗ trợ bạn nhé!</span>
                </div>
                <button className={cx("close-btn")} onClick={() => setShowChat(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className={cx("chat-content")}>
                <p className={cx("welcome-message")}>
                  Chào bạn, hiện tại đang ngoài giờ làm việc của CareerViet, các bạn hiện đang nhắn tin cùng CareerViet AI. Nếu gặp bất kỳ vấn đề nào, chúng tôi sẽ liên hệ với bạn khi trở lại.
                </p>

                <form className={cx("contact-form")}>
                  <div className={cx("form-group")}>
                    <input type="text" placeholder="*Tên" required />
                  </div>
                  <div className={cx("form-group")}>
                    <input type="email" placeholder="*Email" required />
                  </div>
                  <div className={cx("form-group")}>
                    <input type="tel" placeholder="*Số điện thoại" required />
                  </div>
                  <button type="submit" className={cx("submit-btn")}>
                    Bắt đầu
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default DefaultLayout;
