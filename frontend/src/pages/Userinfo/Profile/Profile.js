import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Profile.module.scss";
import userServices from "~/services/userServices.js";
import UserContext from "~/context/UserContext";
import { authAPI, userApis } from "~/utils/api";

const cx = classNames.bind(styles);

const Profile = () => {
  const {  setUser } = useContext(UserContext); // Get user info and update function from Context
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await userServices.getCurrentUser();
        setFormData({
          name: userData.user.name,
          email: userData.user.email,
          phone: userData.user.phone,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updatedUser = await userServices.updateCurrentUser(formData); // Call API to update user info
      setUser(updatedUser.user); // Update user info in Context
      setSuccessMessage("Thông tin cá nhân đã được cập nhật thành công.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại."
      );
    }
  };
  // get user id từ token
  const { user } = useContext(UserContext);
  const [candidateProfile, setCandidateProfile] = useState(null);
  useEffect(() => {
    const fetchCandidateProfile = async () => {
      const response = await authAPI().get(userApis.getCandidateProfile(user.id));
      setCandidateProfile(response.data.candidate);
      console.log(response.data.candidate);
    };
    fetchCandidateProfile();
  }, []);



  return (
    <div className={cx("profile-container")}>
      <div className={cx("title-main")}>Hồ sơ cá nhân</div>
      <div className={cx("form-container")}>
        <div className={cx("form-title")}>Cập nhật thông tin</div>
        <form className={cx("form")} onSubmit={handleSubmit}>
          <div className={cx("form-group")}>
            <label htmlFor="name">Họ và tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              required
            />
          </div>
          <div className={cx("form-group")}>
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="number"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <div className={cx("btn-container")}>
            <button type="submit" className={cx("btn")}>
              Lưu
            </button>
          </div>
          {successMessage && (
            <div className={cx("success-message")}>
              <span className={cx("icon")}>
                <i className="fa-solid fa-circle-check"></i>
              </span>
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className={cx("error-message")}>
              <span className={cx("icon")}>
                <i className="fa-solid fa-circle-exclamation"></i>
              </span>
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
