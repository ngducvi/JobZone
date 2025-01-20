import classNames from "classnames/bind";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styles from "./ResetPassword.module.scss";
import InputWrapper from "~/components/InputWrapper";
import { handleInputBlur } from "~/utils/handleInputBlur";
import api, { userApis } from "~/utils/api";
import Spinner from "~/components/Spinner";

const cx = classNames.bind(styles);

function ResetPassword({ setModalType }) {
  const [searchParams] = useSearchParams();
  const passwordFromURL = searchParams.get("password");
  const emailFromURL = searchParams.get("email");
  const [email, setEmail] = useState({ value: emailFromURL, error: "" });
  const [oldPassword, setOldPassword] = useState({
    value: passwordFromURL,
    error: "",
  });
  const [newPassword, setNewPassword] = useState({ value: "", error: "" });
  const [confirmPassword, setConfirmPassword] = useState({
    value: "",
    error: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helperMessage, setHelperMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    if (passwordFromURL) {
      setHelperMessage(
        <>
          <span>
            Mật khẩu mới của bạn là <strong>{passwordFromURL}</strong>.
          </span>
          <br />
          <span>Đổi mật khẩu ngay!</span>
        </>
      );
    }
  }, [passwordFromURL]);

  const handleChange = (setter) => (e) => {
    setter({ value: e.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Kiểm tra lỗi
    if (!newPassword.value || !confirmPassword.value) {
      setNewPassword((prev) => ({
        ...prev,
        error: !newPassword.value ? "Vui lòng nhập mật khẩu mới." : "",
      }));
      setConfirmPassword((prev) => ({
        ...prev,
        error: !confirmPassword.value ? "Vui lòng nhập lại mật khẩu mới." : "",
      }));
      setIsSubmitting(false);
      return;
    }

    if (newPassword.value !== confirmPassword.value) {
      setConfirmPassword((prev) => ({
        ...prev,
        error: "Mật khẩu mới và mật khẩu xác nhận không khớp.",
      }));
      setIsSubmitting(false);
      return;
    }

    // Gửi yêu cầu cập nhật mật khẩu
    try {
      setErrorMessage();

      const response = await api.post(userApis.changePassword, {
        email: email.value,
        old_password: oldPassword.value,
        new_password: newPassword.value,
        re_password: confirmPassword.value,
      });

      setIsSubmitting(false);
      setHelperMessage("Mật khẩu của bạn đã được đặt lại thành công.");
      setModalType("loginEmail");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        setErrorMessage(message);
      } else {
        console.log("Unexpected error: ", error);
      }
    }
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      {passwordFromURL && <div className={cx("helper")}>{helperMessage}</div>}

      <InputWrapper>
        <div className={cx("input-wrap", email.error && "invalid")}>
          <input
            placeholder="Email hiện tại"
            name="email"
            type="email"
            value={email.value}
            disabled
            // onChange={handleChange(setEmail)}
            onBlur={() =>
              handleInputBlur(email.value, setEmail, "email")
            }
          />
        </div>
        {email.error && (
          <div className={cx("error-message")}>{email.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("input-wrap", oldPassword.error && "invalid")}>
          <input
            placeholder="Mật khẩu hiện tại"
            name="password"
            type="password"
            minLength={6}
            value={oldPassword.value}
            onChange={handleChange(setOldPassword)}
            onBlur={() =>
              handleInputBlur(oldPassword.value, setOldPassword, "password")
            }
          />
        </div>
        {newPassword.error && (
          <div className={cx("error-message")}>{newPassword.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("input-wrap", newPassword.error && "invalid")}>
          <input
            placeholder="Mật khẩu mới"
            name="newPassword"
            type="password"
            minLength={6}
            value={newPassword.value}
            onChange={handleChange(setNewPassword)}
            onBlur={() =>
              handleInputBlur(newPassword.value, setNewPassword, "password")
            }
          />
        </div>
        {newPassword.error && (
          <div className={cx("error-message")}>{newPassword.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("input-wrap", confirmPassword.error && "invalid")}>
          <input
            placeholder="Nhập lại mật khẩu mới"
            name="confirmPassword"
            type="password"
            minLength={6}
            value={confirmPassword.value}
            onChange={handleChange(setConfirmPassword)}
            onBlur={() =>
              handleInputBlur(
                confirmPassword.value,
                setConfirmPassword,
                "password"
              )
            }
          />
        </div>
        {confirmPassword.error && (
          <div className={cx("error-message")}>{confirmPassword.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !newPassword.value ||
            !confirmPassword.value ||
            newPassword.error ||
            confirmPassword.error
          }
          className={cx("submit-btn", {
            disabled:
              isSubmitting || !(newPassword.value && confirmPassword.value),
            rounded: true,
            primary: true,
            loading: isSubmitting,
          })}
        >
          {isSubmitting ? <Spinner /> : "Đặt lại mật khẩu"}
        </button>
      </InputWrapper>
      {errorMessage && (
        <div className={cx("error-message")}>{errorMessage}</div>
      )}
    </form>
  );
}

export default ResetPassword;
