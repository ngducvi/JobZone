import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./ChangePassword.module.scss";
import userServices from "~/services/userServices";

const cx = classNames.bind(styles);

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setSuccess("");
      return;
    }

    setError(""); // Clear errors if validation passes
    try {
      await userServices.updatePassword({
        old_password: currentPassword,
        new_password: newPassword,
        re_password: confirmPassword,
      });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Mật khẩu đã được thay đổi thành công.");
    } catch (error) {
      setError(error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
      setSuccess("");
    }
  };

  return (
    <div className={cx("profile-container")}>
      <div className={cx("title-main")}>Bảo mật</div>
      <div className={cx("form-container")}>
        <div className={cx("form-title")}>Thay đổi mật khẩu</div>
        <form className={cx("form")} onSubmit={handleSubmit}>
          {["currentPassword", "newPassword", "confirmPassword"].map(
            (field, index) => (
              <div key={index} className={cx("form-group", "password-group")}>
                <label htmlFor={field}>
                  {field === "currentPassword"
                    ? "Mật khẩu hiện tại"
                    : field === "newPassword"
                    ? "Mật khẩu mới"
                    : "Xác nhận mật khẩu mới"}
                </label>
                <div className={cx("input-wrapper")}>
                  <input
                    type={showPassword[field] ? "text" : "password"}
                    id={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={
                      field === "currentPassword"
                        ? "Nhập mật khẩu hiện tại"
                        : field === "newPassword"
                        ? "Nhập mật khẩu mới"
                        : "Xác nhận mật khẩu mới"
                    }
                    required
                  />
                  <span
                    className={cx("password-toggle")}
                    onClick={() => toggleShowPassword(field)}
                  >
                    {showPassword[field] ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </span>
                </div>
              </div>
            )
          )}
          <div className={cx("btn-container")}>
            <button type="submit" className={cx("btn")}>
              Lưu
            </button>
          </div>
          {error && (
            <div className={cx("error-message")}>
              <span className={cx("icon")}>
                <i className="fa-solid fa-circle-exclamation"></i>
              </span>
              {error}
            </div>
          )}
          {success && (
            <div className={cx("success-message")}>
              <span className={cx("icon")}>
                <i className="fa-solid fa-circle-check"></i>
              </span>
              {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
