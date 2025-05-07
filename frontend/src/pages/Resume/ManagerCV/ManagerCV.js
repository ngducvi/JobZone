// ManagerCV
import React, { useEffect, useState } from "react";
import classNames from "classnames/bind";
import styles from "./ManagerCV.module.scss";
import { FaUpload, FaEdit, FaEye, FaTrash, FaDownload, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { authAPI, userApis } from "~/utils/api";
import Suitablejob from "~/components/Suitablejob/Suitablejob";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import images from "~/assets/images/index";
const cx = classNames.bind(styles);

const ManagerCV = () => {
  const [activeTab, setActiveTab] = useState("created"); // created | uploaded
  const [userCv, setUserCv] = useState([]);
  const [candidateCv, setCandidateCv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentUser, setCurrentUser] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showJobSearchConfirm, setShowJobSearchConfirm] = useState(false);
  const [showProfileVisibilityConfirm, setShowProfileVisibilityConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    Promise.all([
      authAPI().get(userApis.getAllUserCvByUserId),
      authAPI().get(userApis.getAllCandidateCvByUserId),
      authAPI().get(userApis.getCurrentUser),
      authAPI().get(userApis.getCandidateProfile(userId)),
    ])
      .then(([userCvResponse, candidateCvResponse, currentUserResponse, candidateProfileResponse]) => {
        setUserCv(userCvResponse.data.userCv);
        setCandidateCv(candidateCvResponse.data.candidateCv);
        setCurrentUser(currentUserResponse.data.user);
        setUserId(currentUserResponse.data.user.id);
        setCandidateProfile(candidateProfileResponse.data.candidate);
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
      ] = await Promise.all([
        authAPI().get(userApis.getCurrentUser),
        authAPI().get(userApis.getAllAppliedJobsByUser),
        authAPI().get(userApis.getAllSavedJobsByUser),
      ]);
      setUser(userResponse.data.user);
      setAppliedJobs(appliedJobsResponse.data.appliedJobs);
      setSavedJobs(savedJobsResponse.data.savedJobs);
    };
    fetchData();
  }, []);

  const handleDownloadCV = async (cv) => {
    try {
      // Get the file from the URL
      const response = await fetch(cv.cv_link);
      const blob = await response.blob();

      // Create a temporary link element
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Set the file name - either use the cv_name or generate one
      const fileName = cv.cv_name ? `${cv.cv_name}.pdf` : `cv-${Date.now()}.pdf`;
      link.setAttribute('download', fileName);

      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Có lỗi xảy ra khi tải CV. Vui lòng thử lại!');
    }
  };

  const handleToggleTemplate = async (cv) => {
    try {
      let response;
      if (cv.is_template) {
        // If it's already a template, cancel it
        response = await authAPI().put(`${userApis.cancelCvTemplate(cv.cv_id)}`);
      } else {
        // If it's not a template, set it as template
        response = await authAPI().put(`${userApis.toggleCvTemplate(cv.cv_id)}`);
      }

      if (response.data.code === 1) {
        // Refresh the CV list
        const candidateCvResponse = await authAPI().get(userApis.getAllCandidateCvByUserId);
        setCandidateCv(candidateCvResponse.data.candidateCv);
        toast.success(cv.is_template ? 'Đã hủy mặc định' : 'Đã cài làm mặc định');
      }
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleToggleUserCvTemplate = async (cv) => {
    try {
      let response;
      if (cv.is_template) {
        // If it's already a template, cancel it
        response = await authAPI().put(`${userApis.cancelUserCvTemplate(cv.cv_id)}`);
      } else {
        // If it's not a template, set it as template
        response = await authAPI().put(`${userApis.toggleUserCvTemplate(cv.cv_id)}`);
      }

      if (response.data.code === 1) {
        // Refresh the CV list
        const userCvResponse = await authAPI().get(userApis.getAllUserCvByUserId);
        setUserCv(userCvResponse.data.userCv);
        toast.success(cv.is_template ? 'Đã hủy mặc định' : 'Đã cài làm mặc định');
      }
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  const handleToggleJobSearchConfirm = () => {
    setShowJobSearchConfirm(true);
  };

  const handleToggleProfileVisibilityConfirm = () => {
    setShowProfileVisibilityConfirm(true);
  };

  const handleToggleJobSearch = async () => {
    try {
      const response = await authAPI().put(
        userApis.editIsSearchableAndIsActivelySearching(candidateProfile.candidate_id),
        {
          is_actively_searching: !candidateProfile.is_actively_searching
        }
      );

      if (response.data.code === 1) {
        setCandidateProfile({
          ...candidateProfile,
          is_actively_searching: !candidateProfile.is_actively_searching
        });
        toast.success(candidateProfile.is_actively_searching ? 'Đã tắt trạng thái tìm việc' : 'Đã bật trạng thái tìm việc');
      }
    } catch (error) {
      console.error('Error toggling job search status:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setShowJobSearchConfirm(false);
    }
  };

  const handleToggleProfileVisibility = async () => {
    try {
      const response = await authAPI().put(
        userApis.editIsSearchableAndIsActivelySearching(candidateProfile.candidate_id),
        {
          is_searchable: !candidateProfile.is_searchable
        }
      );

      if (response.data.code === 1) {
        setCandidateProfile({
          ...candidateProfile,
          is_searchable: !candidateProfile.is_searchable
        });
        toast.success(candidateProfile.is_searchable ? 'Đã ẩn hồ sơ' : 'Đã cho phép xem hồ sơ');
      }
    } catch (error) {
      console.error('Error toggling profile visibility:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setShowProfileVisibilityConfirm(false);
    }
  };

  const handleCandidateClick = (candidateId) => {
    console.log("Clicking candidate with ID:", candidateId);
    navigate(`/recruiter/candidate-detail/${candidateId}`);
  };

  const handleDeleteCV = async (cv) => {
    try {
      const response = await authAPI().delete(`${userApis.deleteCandidateCv(cv.cv_id)}`);

      if (response.data.code === 1) {
        // Refresh the CV list
        const candidateCvResponse = await authAPI().get(userApis.getAllCandidateCvByUserId);
        setCandidateCv(candidateCvResponse.data.candidateCv);
        toast.success('Đã xóa CV thành công');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Có lỗi xảy ra khi xóa CV');
    }
  };

  const handleDeleteUserCv = async (cv) => {
    try {
      const response = await authAPI().delete(`${userApis.deleteUserCvTemplate(cv.cv_id)}`);

      if (response.data.code === 1) {
        // Refresh the CV list
        const userCvResponse = await authAPI().get(userApis.getAllUserCvByUserId);
        setUserCv(userCvResponse.data.userCv);
        toast.success('Đã xóa CV thành công');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Có lỗi xảy ra khi xóa CV');
    }
  };

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
                  <div key={cv.cv_id} className={cx("cv-item", { "is-template": cv.is_template })}>
                    <div className={cx("cv-preview")}>
                      <div className={cx("cv-image")}>
                        <img
                          src={images.coverletter}
                          // alt="CV Preview"
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
                            navigate("/user/edit-cv", {
                              state: {
                                cv_id: cv.cv_id,
                                template_id: cv.template_id,
                              },
                            })
                          }
                        >
                          <FaEdit /> Chỉnh sửa
                        </button>
                        <button
                          className={cx("action-btn", "template-btn", {
                            "active": cv.is_template
                          })}
                          onClick={() => handleToggleUserCvTemplate(cv)}
                        >
                          {cv.is_template ? (
                            <>
                              <FaCheck /> Hủy mặc định
                            </>
                          ) : (
                            <>
                              <FaCheck /> Cài làm mặc định
                            </>
                          )}
                        </button>
                        <button
                          className={cx("action-btn", "delete-btn")}
                          onClick={() => handleDeleteUserCv(cv)}
                        >
                          <FaTrash /> Xóa
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
                        <div className={cx("template-badge", { "show": cv.is_template })}>
                          {cv.is_template ? "Template" : "Nháp"}
                        </div>
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
                  <div key={cv.cv_id} className={cx("cv-item", { "is-template": cv.is_template })}>
                    <div className={cx("cv-preview")}>
                      <div className={cx("cv-image")}>
                        <img
                          src={images.coverletter}
                          alt="CV Preview"
                        />
                      </div>
                      <div className={cx("cv-actions")}>
                        <button
                          className={cx("action-btn")}
                          onClick={() => {
                            if (cv.cv_link) {
                              window.open(cv.cv_link, "_blank");
                            } else {
                              toast.error('Không thể xem CV này');
                            }
                          }}
                        >
                          <FaEye /> Xem
                        </button>
                        <button
                          className={cx("action-btn")}
                          onClick={() => handleDownloadCV(cv)}
                        >
                          <FaDownload /> Tải xuống
                        </button>
                        <button
                          className={cx("action-btn", "template-btn", {
                            "active": cv.is_template
                          })}
                          onClick={() => handleToggleTemplate(cv)}
                        >
                          {cv.is_template ? (
                            <>
                              <FaCheck /> Hủy mặc định
                            </>
                          ) : (
                            <>
                              <FaCheck /> Cài làm mặc định
                            </>
                          )}
                        </button>
                        <button
                          className={cx("action-btn", "delete-btn")}
                          onClick={() => handleDeleteCV(cv)}
                        >
                          <FaTrash /> Xóa
                        </button>
                      </div>
                    </div>
                    <div className={cx("cv-info")}>
                      <h3>{cv.cv_name || "CV của tôi"}</h3>
                      <div className={cx("cv-meta")}>
                        <span>
                          Tải lên: {new Date(cv.created_at).toLocaleString()}
                        </span>
                        <div className={cx("template-badge", { "show": cv.is_template })}>
                          {cv.is_template ? "Template" : "Nháp"}
                        </div>
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
                  <img src={candidateProfile?.profile_picture} />
                  <div className={cx("status-badge")}></div>
                </div>
              </div>
              <div className={cx("user-info")}>
                <h2>{currentUser?.name || "Loading..."}</h2>
                {/* <span className={cx("job-title")}>Frontend Developer</span> */}
                <div className={cx("status")}>
                  <span className={cx("status-dot", {
                    "active": candidateProfile?.is_actively_searching
                  })}></span>
                  <span>
                    {candidateProfile?.is_actively_searching ? "Đang tìm việc" : "Đang tắt tìm việc"}
                  </span>
                </div>
              </div>
            </div>

            <div className={cx("profile-stats")}>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{userCv.length}</span>
                <span className={cx("stat-label")}>CV đã tạo</span>
              </div>
              <div className={cx("stat-item")}>
                <span className={cx("stat-value")}>{candidateCv.length}</span>
                <span className={cx("stat-label")}>CV đã tải lên</span>
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
                    <input
                      type="checkbox"
                      checked={candidateProfile?.is_actively_searching || false}
                      onChange={handleToggleJobSearchConfirm}
                    />
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
                    <input
                      type="checkbox"
                      checked={candidateProfile?.is_searchable || false}
                      onChange={handleToggleProfileVisibilityConfirm}
                    />
                    <span className={cx("slider")}></span>
                  </label>
                </div>
                <p>Cho phép nhà tuyển dụng xem hồ sơ của bạn</p>
              </div>
            </div>

            <div className={cx("profile-actions")}>
              <button className={cx("action-btn", "primary")} onClick={() => navigate("/user/job-zone-profile")}>
                <i className="fa-solid fa-pen"></i>
                Chỉnh sửa hồ sơ
              </button>
              {/* <button className={cx("action-btn", "secondary")} onClick={() => handleCandidateClick(candidateProfile?.candidate_id)}>
                <i className="fa-solid fa-eye"></i>
                Xem hồ sơ
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <Suitablejob />

      {/* Confirmation Modals */}
      {showJobSearchConfirm && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-icon")}>
              <FaExclamationTriangle />
            </div>
            <h3>Xác nhận thay đổi trạng thái tìm việc</h3>
            <p>
              {candidateProfile?.is_actively_searching
                ? "Bạn có chắc chắn muốn tắt trạng thái tìm việc? Nhà tuyển dụng sẽ không thể tìm thấy bạn trong kết quả tìm kiếm."
                : "Bạn có chắc chắn muốn bật trạng thái tìm việc? Nhà tuyển dụng sẽ có thể tìm thấy bạn trong kết quả tìm kiếm."}
            </p>
            <div className={cx("modal-actions")}>
              <button
                className={cx("modal-btn", "cancel")}
                onClick={() => setShowJobSearchConfirm(false)}
              >
                Hủy
              </button>
              <button
                className={cx("modal-btn", "confirm")}
                onClick={handleToggleJobSearch}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showProfileVisibilityConfirm && (
        <div className={cx("modal-overlay")}>
          <div className={cx("modal")}>
            <div className={cx("modal-icon")}>
              <FaExclamationTriangle />
            </div>
            <h3>Xác nhận thay đổi hiển thị hồ sơ</h3>
            <p>
              {candidateProfile?.is_searchable
                ? "Bạn có chắc chắn muốn ẩn hồ sơ? Nhà tuyển dụng sẽ không thể xem thông tin chi tiết của bạn."
                : "Bạn có chắc chắn muốn cho phép xem hồ sơ? Nhà tuyển dụng sẽ có thể xem thông tin chi tiết của bạn."}
            </p>
            <div className={cx("modal-actions")}>
              <button
                className={cx("modal-btn", "cancel")}
                onClick={() => setShowProfileVisibilityConfirm(false)}
              >
                Hủy
              </button>
              <button
                className={cx("modal-btn", "confirm")}
                onClick={handleToggleProfileVisibility}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCV;
