// page 
import React, { useState, useRef, useEffect } from 'react';
import classNames from "classnames/bind";

import styles from "./RegisterRecruiter.module.scss";
import InputWrapper from "~/components/InputWrapper";
import { handleInputBlur } from "~/utils/handleInputBlur";
import { ErrorIcon } from "~/components/Icons";
import api, { recruiterApis } from "~/utils/api";
import Spinner from "~/components/Spinner";

const cx = classNames.bind(styles);

function RegisterRecruiter({ setRegisterSuccess }) {
    const [name, setName] = useState({ value: "", error: "" });
    const [username, setUsername] = useState({ value: "", error: "" });
    const [phone, setPhone] = useState({ value: "", error: "" });
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
    const [email, setEmail] = useState({
        value: "",
        error: "",
    });
    const [password, setPassword] = useState({ value: "", error: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState({
        value: "",
        error: "",
    });
    const [errorMessage, setErrorMessage] = useState();
    const nameInputRef = useRef(null);

    useEffect(() => {
        if(!isSubmitSuccess){
            nameInputRef.current.focus();
        }
    }, [isSubmitSuccess]);

    const handleEmailBlur = async () => {
        handleInputBlur(email.value, setEmail, "email");
    };

    const handleChange = (setter) => (e) => {
        setter({ value: e.target.value, error: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            setErrorMessage();
            // Đăng ký với role recruiter
            const registerResponse = await api.post(recruiterApis.register, {
                username: username.value,
                email: email.value,
                phone: phone.value,
                password: password.value,
                name: name.value,
                re_password: confirmPassword.value,
                role: "recruiter" // Thêm role recruiter
            });

            if (registerResponse && registerResponse.data) {
                setIsSubmitSuccess(true);
                if (setRegisterSuccess) {
                    setRegisterSuccess();
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                setErrorMessage(message);
            } else {
                console.log("Unexpected error: ", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return isSubmitSuccess ? (
        <div className={cx("success-container")}>
            <div className={cx("success-message")}>
                <h2>🎉 Đăng ký thành công!</h2>
                <p>
                    Vui lòng kiểm tra email của bạn (<strong>{email.value}</strong>) để xác
                    nhận tài khoản nhà tuyển dụng.
                </p>
            </div>
            <button
                className={cx("back-btn")}
                onClick={() => {
                    setIsSubmitSuccess(false);
                }}
            >
                Quay lại
            </button>
        </div>
    ) : (
        <form autoComplete="off" onSubmit={handleSubmit}>
            <InputWrapper>
                <div className={cx("label-group")}>
                    <label className={cx("label")}>Tên của bạn?</label>
                </div>
                <div className={cx("input-wrap", name.error && "invalid")}>
                    <input
                        ref={nameInputRef}
                        placeholder="Họ và tên của bạn"
                        name="name"
                        value={name.value}
                        onChange={handleChange(setName)}
                        onBlur={() => handleInputBlur(name.value, setName)}
                    />
                    {name.error && <ErrorIcon className={cx("error-icon")} />}
                </div>
                {name.error && <div className={cx("error-message")}>{name.error}</div>}
            </InputWrapper>

            <InputWrapper>
                <div className={cx("label-group")}>
                    <label className={cx("label")}>Email của bạn</label>
                </div>
                <div className={cx("input-wrap", email.error && "invalid")}>
                    <input
                        placeholder="Email của bạn"
                        name="email"
                        type="email"
                        value={email.value}
                        onChange={handleChange(setEmail)}
                        onBlur={handleEmailBlur}
                    />
                    {email.error && <ErrorIcon className={cx("error-icon")} />}
                </div>
                {email.error && (
                    <div className={cx("error-message")}>{email.error}</div>
                )}
            </InputWrapper>

            <InputWrapper>
                <div className={cx("label-group")}>
                    <label className={cx("label")}>Tên đăng nhập</label>
                </div>
                <div className={cx("input-wrap", username.error && "invalid")}>
                    <input
                        placeholder="Tên đăng nhập"
                        name="username"
                        type="text"
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
                <div className={cx("label-group")}>
                    <label className={cx("label")}>Số điện thoại</label>
                </div>
                <div className={cx("input-wrap", phone.error && "invalid")}>
                    <input
                        placeholder="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={phone.value}
                        onChange={handleChange(setPhone)}
                        onBlur={() => handleInputBlur(phone.value, setPhone)}
                    />
                    {phone.error && <ErrorIcon className={cx("error-icon")} />}
                </div>
                {phone.error && (
                    <div className={cx("error-message")}>{phone.error}</div>
                )}
            </InputWrapper>

            <InputWrapper>
                <div className={cx("label-group")}>
                    <label className={cx("label")}>Mật khẩu</label>
                </div>
                <div className={cx("input-wrap", password.error && "invalid")}>
                    <input
                        placeholder="Nhập mật khẩu"
                        name="password"
                        type="password"
                        minLength={6}
                        value={password.value}
                        onChange={handleChange(setPassword)}
                        onBlur={() =>
                            handleInputBlur(password.value, setPassword, "password")
                        }
                    />
                </div>
                {password.error && (
                    <div className={cx("error-message")}>{password.error}</div>
                )}
            </InputWrapper>

            <InputWrapper>
                <div className={cx("input-wrap", confirmPassword.error && "invalid")}>
                    <input
                        placeholder="Nhập lại mật khẩu"
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
                        isSubmitting || !email.value || !password.value || !name.value
                    }
                    className={cx("submit-btn", {
                        disabled:
                            isSubmitting ||
                            !(
                                email.value &&
                                password.value &&
                                name.value &&
                                confirmPassword.value &&
                                username.value &&
                                phone.value
                            ),
                    })}
                >
                    {isSubmitting ? <Spinner /> : "Đăng ký"}
                </button>
            </InputWrapper>

            {errorMessage && (
                <div className={cx("form-error-message")}>
                    <ErrorIcon />
                    <span>{errorMessage}</span>
                </div>
            )}
        </form>
    );
}

export default RegisterRecruiter;   
