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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      authAPI().get(userApis.getAllUserCvByUserId),
      authAPI().get(userApis.getAllCandidateCvByUserId)
    ])
      .then(([userCvResponse, candidateCvResponse]) => {
        setUserCv(userCvResponse.data.userCv);
        setCandidateCv(candidateCvResponse.data.candidateCv);
        // console.log("candidateCv", candidateCvResponse.data.candidateCv);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUploadCV = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await authAPI().post(userApis.uploadCandidateCv, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh candidate CV list
      const candidateCvResponse = await authAPI().get(userApis.getAllCandidateCvByUserId);
      setCandidateCv(candidateCvResponse.data.candidateCv);

      // Show success message
      alert('Upload CV thành công!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      alert('Có lỗi xảy ra khi tải CV lên. Vui lòng thử lại!');
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        {/* Left Column - CV List */}
        <div className={cx("cv-section")}>
          <div className={cx("cv-header")}>
            <div className={cx("tabs")}>
              <button 
                className={cx("tab", { active: activeTab === "created" })}
                onClick={() => setActiveTab("created")}
              >
                CV đã tạo trên TopCV
              </button>
              <button 
                className={cx("tab", { active: activeTab === "uploaded" })}
                onClick={() => setActiveTab("uploaded")}
              >
                CV đã tải lên TopCV
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
                        <img src={cv.cv_thumbnail || "/images/cv-preview.png"} alt="CV Preview" />
                      </div>
                      <div className={cx("cv-actions")}>
                        <button 
                          className={cx("action-btn")}
                          onClick={() => navigate('/user/see-cv', { state: { cv_id: cv.cv_id, template_id: cv.template_id } })}
                        >
                          <FaEye /> Xem
                        </button>
                        <button 
                          className={cx("action-btn")}
                          onClick={() => navigate('/user/use-templates', { 
                            state: { 
                              template: cv.template,
                              formData: cv.formData 
                            }
                          })}
                        >
                          <FaEdit /> Chỉnh sửa
                        </button>
                      </div>
                    </div>
                    <div className={cx("cv-info")}>
                      <h3>{cv.cv_name}</h3>
                      <div className={cx("cv-meta")}>
                        <span>Cập nhật lần cuối: {new Date(cv.updated_at).toLocaleString()}</span>
                        <div className={cx("cv-stats")}>
                          <span><FaEye /> 2 lượt xem</span>
                          <span><FaDownload /> 0 lượt tải</span>
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
                            navigate('/user/see-cv', { state: { cv_id: cv.cv_id, template_id: cv.template_id } });
                          }}
                        >
                          <FaEye /> Xem
                        </button>
                        <button 
                          className={cx("action-btn")}
                          onClick={() => navigate('/user/use-templates', { 
                            state: { 
                              template: cv.template,
                              formData: cv.formData 
                            }
                          })}
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
                      style={{ display: 'none' }}
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
              <div className={cx("avatar")}>
                <img src="/images/avatar.jpg" alt="User Avatar" />
                <span className={cx("status-badge")}></span>
              </div>
              <div className={cx("user-info")}>
                <h2>Quách Nguyễn Anh</h2>
                <div className={cx("status")}>
                  <span className={cx("status-dot")}></span>
                  <span>Đang tắt tìm việc</span>
                </div>
              </div>
            </div>

            <div className={cx("profile-settings")}>
              <div className={cx("setting-item")}>
                <div className={cx("setting-header")}>
                  <span>Đang tắt tìm việc</span>
                  <label className={cx("switch")}>
                    <input type="checkbox" />
                    <span className={cx("slider")}></span>
                  </label>
                </div>
                <p>Bật tìm việc giúp bạn dễ được tiếp cận hơn và được gợi ý các công việc phù hợp với NTD</p>
              </div>

              <div className={cx("setting-item")}>
                <div className={cx("setting-header")}>
                  <span>Cho phép NTD tìm kiếm hồ sơ</span>
                  <label className={cx("switch")}>
                    <input type="checkbox" />
                    <span className={cx("slider")}></span>
                  </label>
                </div>
                <p>Khi có cài đặt này, các nhà tuyển dụng có thể tìm thấy hồ sơ của bạn và chủ động liên hệ</p>
              </div>
            </div>

            <div className={cx("profile-actions")}>
              <button className={cx("action-btn", "primary")}>
                Chỉnh sửa TopCV Profile
              </button>
              <button className={cx("action-btn", "secondary")}>
                Xem TopCV Profile
              </button>
            </div>
          </div>

          <div className={cx("qr-section")}>
            <div className={cx("qr-code")}>
              <img src="/images/qr-code.png" alt="QR Code" />
            </div>
            <div className={cx("qr-info")}>
              <h3>Tải ứng dụng TopCV ngay!</h3>
              <p>Để không bỏ lỡ cơ hội việc làm và các thông tin hữu ích.</p>
            </div>
          </div>
        </div>
      </div>
      <Suitablejob />
    </div>
  );
};

export default ManagerCV;
