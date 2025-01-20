import classNames from "classnames/bind";
import { useState, useRef, useEffect } from "react";

import styles from "./ForgotPassword.module.scss";
import InputWrapper from "~/components/InputWrapper";
import { handleInputBlur } from "~/utils/handleInputBlur";
import { ErrorIcon } from "~/components/Icons";
import api, { userApis } from "~/utils/api";
import Spinner from "~/components/Spinner";

const cx = classNames.bind(styles);

function ForgotPassword({ setModalType }) {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [isSubmitting, setIsSubmitting] = useState(false); // State for form submission
  const [isSuccess, setIsSuccess] = useState(false); // State for success status
  const emailInputRef = useRef(null);

  useEffect(() => {
    emailInputRef.current.focus();
  }, []);

  const handleChange = (setter) => (e) => {
    setter({ value: e.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set isSubmitting to true

    try {
      await api.post(userApis.forgotPassword, {
        email: email.value,
      });

      setIsSubmitting(false);
      setIsSuccess(true); // Set success status
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);

    }
  };

  return (
    <div className={cx("forgot-password")}>
      {!isSuccess ? (
        <form autoComplete="off" onSubmit={handleSubmit}>
          <InputWrapper>
            <div className={cx("label-group")}>
              <label className={cx("label")}>Email của bạn</label>
            </div>
            <div className={cx("input-wrap", email.error && "invalid")}>
              <input
                ref={emailInputRef}
                placeholder="Email của bạn"
                name="email"
                type="email"
                value={email.value}
                onChange={handleChange(setEmail)}
                onBlur={() => handleInputBlur(email.value, setEmail, "email")}
              />
              {email.error && <ErrorIcon className={cx("error-icon")} />}
            </div>
            {email.error && (
              <div className={cx("error-message")}>{email.error}</div>
            )}
          </InputWrapper>

          <InputWrapper>
            <button
              type="submit"
              disabled={isSubmitting || !email.value || email.error}
              className={cx("submit-btn", {
                disabled: isSubmitting || !email.value || email.error,
                rounded: true,
                primary: true,
                loading: isSubmitting,
              })}
            >
              {isSubmitting ? <Spinner /> : "Xác nhận"}
            </button>
          </InputWrapper>
        </form>
      ) : (
        <div className={cx("success-message")}>
          <div className={cx("icon-wrapper")}>
            <img
              src="/path/to/success-icon.svg"
              alt="Success"
              className={cx("success-icon")}
            />
          </div>
          <p className={cx("success-text")}>
            Kiểm tra email để đặt lại mật khẩu của bạn. <br />
            Nếu không thấy, hãy kiểm tra thư mục **Spam** hoặc thử lại.
          </p>
          <button
            className={cx("back-btn")}
            onClick={() => setModalType("loginEmail")}
          >
            Quay lại đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
