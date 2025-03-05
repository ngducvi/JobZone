import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./Login.module.scss";
import InputWrapper from "~/components/InputWrapper";
import { handleInputBlur } from "~/utils/handleInputBlur";
import { ErrorIcon } from "~/components/Icons";
import api, { userApis } from "~/utils/api";
import Spinner from "~/components/Spinner";
import { toast } from "react-toastify";
import UserContext from '~/context/UserContext';

const cx = classNames.bind(styles);

function Login() {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState({
    value: "",
    error: "",
  });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  const handleChange = (setter) => (e) => {
    setter({ value: e.target.value, error: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setErrorMessage();
      const response = await api.post(userApis.login, {
        account: username.value,
        password: password.value,
      });

      if (response.data.user.role !== 'user' && response.data.user.role !== 'admin') {
        setErrorMessage("Bạn không có quyền truy cập vào tài khoản này.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const user = response.data.user;
      toast.success(`Chào mừng ${user.name || user.account} đã quay trở lại!`, {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          fontSize: "14px",
          fontWeight: 500,
        },
        progressStyle: {
          background: "#00875A",
        },
        icon: "��",
      });

      window.location.reload();
    } catch (error) {
      setIsSubmitting(false);
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        console.error("Unexpected error: ", error);
      }
    }
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <InputWrapper>
        <div className={cx("label-group")}>
          <label className={cx("label")}>Tên đăng nhập</label>
        </div>
        <div className={cx("input-wrap", { invalid: username.error })}>
          <input
            autoFocus
            placeholder="Nhập email/ Username/ Số điện thoại"
            name="email"
            type="email"
            value={username.value}
            onChange={handleChange(setUsername)}
            onBlur={() => handleInputBlur(username.value, setUsername)}
          />
          {username.error && <ErrorIcon className={cx("error-icon")} />}
        </div>
        {username.error && (
          <div className={cx("error-message")}>{username.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <div className={cx("input-wrap", { invalid: password.error })}>
          <input
            placeholder="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password.value}
            onChange={handleChange(setPassword)}
            onBlur={() => handleInputBlur(password.value, setPassword)}
          />
          <span
            className={cx("password-toggle")}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {password.value ? (
              showPassword ? (
                <i className="fa-solid fa-eye-slash"></i>
              ) : (
                <i className="fa-solid fa-eye"></i>
              )
            ) : (
              <></>
            )}
          </span>
          {password.error && <ErrorIcon className={cx("error-icon")} />}
        </div>
        {password.error && (
          <div className={cx("error-message")}>{password.error}</div>
        )}
      </InputWrapper>

      <InputWrapper>
        <button
          onClick={handleSubmit}
          type="submit"
          disabled={!username.value || !password.value || isSubmitting}
          className={cx("submit-btn", {
            disabled: !username.value || !password.value,
            rounded: true,
            primary: true,
            loading: isSubmitting,
          })}
        >
          {isSubmitting ? <Spinner /> : "Đăng nhập"}
        </button>
      </InputWrapper>
      {errorMessage && (
        <div className={cx("error-message")}>{errorMessage}</div>
      )}
    </form>
  );
}

export default Login;
