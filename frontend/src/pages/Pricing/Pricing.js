import React, { useContext } from "react";
import classNames from "classnames/bind";
import styles from "./Pricing.module.scss";
import { authAPI, userApis } from "~/utils/api";
import ModalTypeContext from "~/context/ModalTypeContext";

const cx = classNames.bind(styles);

function Pricing() {
  const { setModalType } = useContext(ModalTypeContext);

  const token = localStorage.getItem("token");
  
  const handleRegister = async (amount) => {
    if (!token) {
      setModalType("loginEmail");
      return;
    }
    try {
       const response  = await authAPI().post(userApis.createPaymentUrl, {amount: amount});
       if(response.data && response.data.paymentUrl) {
            window.location.href = response.data.paymentUrl;
       }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={cx("pricing-wrapper")}>
      

      <h2 className={cx("pricing-title")}>Chọn gói phù hợp</h2>
      <div className={cx("pricing-options")}>
        <div className={cx("pricing-card", "basic-plan")}>
          <h3 className={cx("plan-title")}>Gói cơ bản</h3>
          <p className={cx("plan-price")}>
            120.000 <span>VND</span>
          </p>
          <ul className={cx("plan-details")}>
            <li>Hỗ trợ GPT4o Mini, GPT4o</li>
            <li>120,000 BTG</li>
            <li>30 ngày sử dụng</li>
          </ul>
          <button className={cx("btn", "btn-primary")} onClick={() => handleRegister(120000)}>
            Đăng ký
          </button>
        </div>

        <div className={cx("pricing-card", "premium-plan")}>
          <h3 className={cx("plan-title")}>Gói nâng cao</h3>
          <p className={cx("plan-price")}>
            1.200.000 <span>VND</span>
          </p>
          <ul className={cx("plan-details")}>
            <li>Hỗ trợ GPT4o Mini, GPT4o</li>
            <li>1,200,000 BTG</li>
            <li>365 ngày sử dụng</li>
          </ul>
          <button className={cx("btn", "btn-primary")} onClick={() => handleRegister(1200000)}>
          Đăng ký</button>
        </div>
      </div>

      <div className={cx("notes-section")}>
        <div className={cx("note")}>
          <h4>Nếu chưa hết thời hạn sử dụng</h4>
          <p>Mua thêm gói sẽ được cộng dồn thời hạn và BTG</p>
        </div>
        <div className={cx("note")}>
          <h4>Nếu hết thời hạn sử dụng</h4>
          <p>
            <span className={cx("warning")}>BTG hiện tại sẽ bị hủy.</span> Mua
            thêm gói sẽ tính thời hạn và BTG theo gói đã mua.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
