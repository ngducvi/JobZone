// ManagerCV
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./ManagerCV.module.scss";
import { FaUpload, FaEdit, FaEye, FaTrash, FaDownload } from "react-icons/fa";
import { authAPI, userApis } from "~/utils/api";
import Suitablejob from "~/components/Suitablejob/Suitablejob";
import { useNavigate } from "react-router-dom";
const cx = classNames.bind(styles);

const ManagerCV = () => {
  const [activeTab, setActiveTab] = useState("created"); // created | uploaded
  const [userCv, setUserCv] = useState([]);
  const [candidateCv, setCandidateCv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [viewedJobs, setViewedJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      authAPI().get(userApis.getAllUserCvByUserId),
      authAPI().get(userApis.getAllCandidateCvByUserId),
    ])
      .then(([userCvResponse, candidateCvResponse]) => {
        setUserCv(userCvResponse.data.userCv);
        setCandidateCv(candidateCvResponse.data.candidateCv);
        // console.log("candidateCv", candidateCvResponse.data.candidateCv);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUploadCV = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await authAPI().post(
        userApis.uploadCandidateCv,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Refresh candidate CV list
      const candidateCvResponse = await authAPI().get(
        userApis.getAllCandidateCvByUserId
      );
      setCandidateCv(candidateCvResponse.data.candidateCv);

      // Show success message
      alert("Upload CV thành công!");
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert("Có lỗi xảy ra khi tải CV lên. Vui lòng thử lại!");
    }
  };
  useEffect(() => {
    // dùng promise.all để lấy dữ liệu
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const [
        userResponse,
        appliedJobsResponse,
        savedJobsResponse,
        viewdJobResponse,
      ] = await Promise.all([
        authAPI().get(userApis.getCurrentUser),
        authAPI().get(userApis.getAllAppliedJobsByUser),
        authAPI().get(userApis.getAllSavedJobsByUser),
      ]);
      setUser(userResponse.data.user);
      setAppliedJobs(appliedJobsResponse.data.appliedJobs);
      setSavedJobs(savedJobsResponse.data.savedJobs);
      console.log("user", userResponse.data.user);
      console.log("appliedJobs", appliedJobsResponse.data.appliedJobs);
      console.log("savedJobs", savedJobsResponse.data.savedJobs);
    };
    fetchData();
  }, []);
  return (
    <div className={cx("wrapper")}>
      <div className={cx("header-section")}>
        <div className={cx("header-content")}>
          <div className={cx("header-icon")}>
            <i className="fa-solid fa-file-lines"></i>
          </div>
          <h1>Quản lý CV của bạn</h1>
          <p>Tạo và quản lý CV chuyên nghiệp để tăng cơ hội được tuyển dụng</p>
        </div>
      </div>

      <div className={cx("container")}>
        {/* Left Column - CV List */}
        <div className={cx("cv-section")}>
          <div className={cx("cv-header")}>
            <div className={cx("tabs")}>
              <button
                className={cx("tab", { active: activeTab === "created" })}
                onClick={() => setActiveTab("created")}
              >
                <i className="fa-solid fa-pen-to-square"></i>
                CV đã tạo
              </button>
              <button
                className={cx("tab", { active: activeTab === "uploaded" })}
                onClick={() => setActiveTab("uploaded")}
              >
                <i className="fa-solid fa-cloud-upload-alt"></i>
                CV đã tải lên
              </button>
            </div>
          </div>

          {activeTab === "created" ? (
            <div className={cx("cv-list")}>
              {loading ? (
                <div className={cx("loading")}>Loading...</div>
              ) : userCv.length > 0 ? (
                userCv.map((cv) => (
                  <div key={cv.cv_id} className={cx("cv-item")}>
                    <div className={cx("cv-preview")}>
                      <div className={cx("cv-image")}>
                        <img
                          src={cv.cv_thumbnail || "/images/cv-preview.png"}
                          alt="CV Preview"
                        />
                      </div>
                      <div className={cx("cv-actions")}>
                        <button
                          className={cx("action-btn")}
                          onClick={() =>
                            navigate("/user/see-cv", {
                              state: {
                                cv_id: cv.cv_id,
                                template_id: cv.template_id,
                              },
                            })
                          }
                        >
                          <FaEye /> Xem
                        </button>
                        <button
                          className={cx("action-btn")}
                          onClick={() =>
                            navigate("/user/use-templates", {
                              state: {
                                template: cv.template,
                                formData: cv.formData,
                              },
                            })
                          }
                        >
                          <FaEdit /> Chỉnh sửa
                        </button>
                      </div>
                    </div>
                    <div className={cx("cv-info")}>
                      <h3>{cv.cv_name}</h3>
                      <div className={cx("cv-meta")}>
                        <span>
                          Cập nhật lần cuối:{" "}
                          {new Date(cv.updated_at).toLocaleString()}
                        </span>
                        <div className={cx("cv-stats")}>
                          <span>
                            <FaEye /> 2 lượt xem
                          </span>
                          <span>
                            <FaDownload /> 0 lượt tải
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={cx("cv-item", "empty")}>
                  <div className={cx("empty-content")}>
                    <FaUpload className={cx("upload-icon")} />
                    <p>Bạn chưa tải lên CV nào</p>
                    <button className={cx("upload-btn")}>
                      <FaUpload /> Tải CV lên
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={cx("cv-list", "uploaded")}>
              {loading ? (
                <div className={cx("loading")}>Loading...</div>
              ) : candidateCv.length > 0 ? (
                candidateCv.map((cv) => (
                  <div key={cv.cv_id} className={cx("cv-item")}>
                    <div className={cx("cv-preview")}>
                      <div className={cx("cv-image")}>
                        <img
                          src={`${process.env.REACT_APP_API_URL}/uploads/candidate_cv/${cv.cv_url}`}
                          alt="CV Preview"
                        />
                      </div>
                      <div className={cx("cv-actions")}>
                        <button
                          className={cx("action-btn")}
                          onClick={() => {
                            navigate("/user/see-cv", {
                              state: {
                                cv_id: cv.cv_id,
                                template_id: cv.template_id,
                              },
                            });
                          }}
                        >
                          <FaEye /> Xem
                        </button>
                        <button
                          className={cx("action-btn")}
                          onClick={() =>
                            navigate("/user/use-templates", {
                              state: {
                                template: cv.template,
                                formData: cv.formData,
                              },
                            })
                          }
                        >
                          <FaEdit /> Chỉnh sửa
                        </button>
                      </div>
                    </div>
                    <div className={cx("cv-info")}>
                      <h3>{cv.cv_name || "CV của tôi"}</h3>
                      <div className={cx("cv-meta")}>
                        <span>
                          Tải lên: {new Date(cv.created_at).toLocaleString()}
                        </span>
                        <div className={cx("cv-stats")}>
                          <span>
                            <FaEye /> {cv.views || 0} lượt xem
                          </span>
                          <span>
                            <FaDownload /> {cv.downloads || 0} lượt tải
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={cx("cv-item", "empty")}>
                  <div className={cx("empty-content")}>
                    <FaUpload className={cx("upload-icon")} />
                    <p>Bạn chưa tải lên CV nào</p>
                    <label className={cx("upload-btn")} htmlFor="cv-upload">
                      <FaUpload /> Tải CV lên
                    </label>
                    <input
                      type="file"
                      id="cv-upload"
                      accept=".pdf,.doc,.docx"
                      style={{ display: "none" }}
                      onChange={(e) => handleUploadCV(e.target.files[0])}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - User Profile */}
        <div className={cx("profile-section")}>
          <div className={cx("profile-card")}>
            <div className={cx("profile-header")}>
              <div className={cx("avatar-wrapper")}>
                <div className={cx("avatar")}>
                  <img src="/images/avatar.jpg" alt="User Avatar" />
                  <div className={cx("status-badge")}></div>
                </div>
              </div>
              <div className={cx("user-info")}>
                <h2>Quách Nguyễn Anh</h2>
                <span className={cx("job-title")}>Frontend Developer</span>
                <div className={cx("status")}>
                  <span className={cx("status-dot")}></span>
                  <span>Đang tắt tìm việc</span>
                </div>
              </div>
            </div>

            <div className={cx("profile-stats")}>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>12</span>
                <span className={cx("stat-label")}>CV đã tạo</span>
              </div>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>45</span>
                <span className={cx("stat-label")}>Lượt xem</span>
              </div>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{appliedJobs.length}</span>
                <span className={cx("stat-label")}>Đã ứng tuyển</span>
              </div>
            </div>

            <div className={cx("profile-settings")}>
              <div className={cx("setting-item")}>
                <div className={cx("setting-header")}>
                  <div className={cx("setting-title")}>
                    <i className="fa-solid fa-search"></i>
                    <span>Trạng thái tìm việc</span>
                  </div>
                  <label className={cx("switch")}>
                    <input type="checkbox" />
                    <span className={cx("slider")}></span>
                  </label>
                </div>
                <p>Bật tìm việc để được tiếp cận bởi nhà tuyển dụng</p>
              </div>

              <div className={cx("setting-item")}>
                <div className={cx("setting-header")}>
                  <div className={cx("setting-title")}>
                    <i className="fa-solid fa-eye"></i>
                    <span>Hiển thị hồ sơ</span>
                  </div>
                  <label className={cx("switch")}>
                    <input type="checkbox" />
                    <span className={cx("slider")}></span>
                  </label>
                </div>
                <p>Cho phép nhà tuyển dụng xem hồ sơ của bạn</p>
              </div>
            </div>

            <div className={cx("profile-actions")}>
              <button className={cx("action-btn", "primary")}>
                <i className="fa-solid fa-pen"></i>
                Chỉnh sửa hồ sơ
              </button>
              <button className={cx("action-btn", "secondary")}>
                <i className="fa-solid fa-eye"></i>
                Xem hồ sơ
              </button>
            </div>
          </div>

          <div className={cx("qr-section")}>
            <div className={cx("qr-content")}>
              <div className={cx("qr-code")}>
                <img src="/images/qr-code.png" alt="QR Code" />
              </div>
              <div className={cx("qr-info")}>
                <h3>Tải ứng dụng TopCV</h3>
                <p>Quản lý CV và nhận thông báo việc làm mới nhất</p>
                <div className={cx("app-buttons")}>
                  <button>
                    <i className="fab fa-google-play"></i>
                    Google Play
                  </button>
                  <button>
                    <i className="fab fa-apple"></i>
                    App Store
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Suitablejob />
    </div>
  );
};

export default ManagerCV;
