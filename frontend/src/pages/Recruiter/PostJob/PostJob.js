// PostJob page
import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./PostJob.module.scss";
import { authAPI, recruiterApis, userApis } from "~/utils/api";
import { useNavigate } from "react-router-dom";
import UserContext from "~/context/UserContext";
import { toast } from "react-toastify";

const cx = classNames.bind(styles);

const categories = [
  { value: "1f25fd8e-ce9e-11ef-9430-2cf05db24bc7", name: "Retail" },
  { value: "1f25fc2b-ce9e-11ef-9430-2cf05db24bc7", name: "Operations" },
  { value: "1f25fb0c-ce9e-11ef-9430-2cf05db24bc7", name: "Engineering" },
  { value: "1f25f98c-ce9e-11ef-9430-2cf05db24bc7", name: "Legal" },
  { value: "1f25f861-ce9e-11ef-9430-2cf05db24bc7", name: "Healthcare" },
  { value: "1f25f6f2-ce9e-11ef-9430-2cf05db24bc7", name: "Education" },
  { value: "1f25f441-ce9e-11ef-9430-2cf05db24bc7", name: "Consulting" },
  { value: "1f25f23d-ce9e-11ef-9430-2cf05db24bc7", name: "Finance" },
  { value: "1f25f189-ce9e-11ef-9430-2cf05db24bc7", name: "Business Analyst" },
  { value: "1f25f0db-ce9e-11ef-9430-2cf05db24bc7", name: "Cybersecurity" },
  { value: "1f25f02b-ce9e-11ef-9430-2cf05db24bc7", name: "Mobile Development" },
  { value: "1f25ef7a-ce9e-11ef-9430-2cf05db24bc7", name: "Web Development" },
  { value: "1f25eec3-ce9e-11ef-9430-2cf05db24bc7", name: "Customer Support" },
  { value: "1f25ee06-ce9e-11ef-9430-2cf05db24bc7", name: "Human Resources" },
  { value: "1f25ed2a-ce9e-11ef-9430-2cf05db24bc7", name: "Sales" },
  { value: "1f25ec4e-ce9e-11ef-9430-2cf05db24bc7", name: "Graphic Design" },
  { value: "1f25eb8c-ce9e-11ef-9430-2cf05db24bc7", name: "Marketing" },
  { value: "1f25ea73-ce9e-11ef-9430-2cf05db24bc7", name: "Project Management" },
  { value: "1f25e912-ce9e-11ef-9430-2cf05db24bc7", name: "Data Science" },
  {
    value: "1f25e3ee-ce9e-11ef-9430-2cf05db24bc7",
    name: "Software Engineering",
  },
];

// Preview Modal Component
const PreviewJobModal = ({ isOpen, onClose, jobDetails, companyInfo }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (text) => {
    if (!text) return <p>Chưa cập nhật</p>;
    return text.split("\n").map((paragraph, index) => {
      if (paragraph.trim().startsWith("- ")) {
        return (
          <ul key={index}>
            <li>{paragraph.trim().substring(2)}</li>
          </ul>
        );
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal-content")}>
        <button className={cx("close-btn")} onClick={onClose}>
          <i className="fa-solid fa-times"></i>
        </button>

        <div className={cx("job-main")}>
          <div className={cx("job-header")}>
            <div className={cx("company-info")}>
              <div className={cx("company-logo")}>
                <img
                  src={companyInfo.logo}
                  alt="Company logo"
                  className={cx("logo-preview")}
                  style={{ width: "70px", height: "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    padding: "2px",
                   }}
                />
              </div>
              <div className={cx("company-name")}>
                {companyInfo.company_name}
                <div className={cx("posting-date")}>
                  Hạn nộp: {formatDate(jobDetails.deadline)}
                </div>
              </div>
            </div>

            <h1 className={cx("job-title")}>{jobDetails.title}</h1>

            <div className={cx("job-meta")}>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-money-bill"></i>
                {jobDetails.salary}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-location-dot"></i>
                {jobDetails.location}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-briefcase"></i>
                {jobDetails.jobType}
              </div>
              <div className={cx("meta-item")}>
                <i className="fa-solid fa-clock"></i>
                {jobDetails.experience}
              </div>
            </div>
          </div>

          <div className={cx("job-content")}>
            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-circle-info"></i>
                Mô tả công việc
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.description)}
              </div>
            </div>

            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-list-check"></i>
                Yêu cầu công việc
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.jobRequirements)}
              </div>
            </div>

            <div className={cx("job-section")}>
              <h3>
                <i className="fa-solid fa-gift"></i>
                Quyền lợi
              </h3>
              <div className={cx("section-content")}>
                {formatContent(jobDetails.benefits)}
              </div>
            </div>
          </div>
        </div>

        <div className={cx("company-sidebar")}>
          <div className={cx("sidebar-section")}>
            <h4>Thông tin chung</h4>
            <div className={cx("company-stats")}>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-users"></i>
                100-499 nhân viên
              </div>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-building"></i>
                Bán lẻ - Hàng tiêu dùng - FMCG
              </div>
              <div className={cx("stat-item")}>
                <i className="fa-solid fa-location-dot"></i>
                123 Car St, MI
              </div>
            </div>
            <a href="#" className={cx("company-link")}>
              Xem trang công ty
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className={cx("action-buttons")}>
            <button className={cx("apply-btn")}>
              <i className="fa-solid fa-paper-plane"></i>
              Ứng tuyển ngay
            </button>
            <button className={cx("save-btn")}>
              <i className="fa-regular fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function PostJob() {
  const { user } = useContext(UserContext);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [specialisms, setSpecialisms] = useState("");
  const [salary, setSalary] = useState("");
  const [username, setUsername] = useState("");
  const [jobType, setJobType] = useState("");
  const [careerLevel, setCareerLevel] = useState("");
  const [experience, setExperience] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [location, setLocation] = useState("");
  const [benefits, setBenefits] = useState("");
  const [jobRequirements, setJobRequirements] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recruiter, setRecruiter] = useState({});
  const [companyInfo, setCompanyInfo] = useState({});
  const [companyId, setCompanyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await authAPI().get(userApis.getCurrentUser);
        const responseCompany = await authAPI().get(
          recruiterApis.getAllRecruiterCompanies
        );
        setCompanyId(responseCompany.data.companies[0].company_id);
        setUsername(response.data.user.username);
        setRecruiter(response.data.user.username);
        setCompanyInfo(responseCompany.data.companies[0]);
      } catch (error) {
        setError("Không thể tải thông tin người dùng.");
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("Submitting job data:", {
      jobTitle,
      description,
      email,
      specialisms,
      salary,
      username,
      jobType,
      careerLevel,
      experience,
      location,
      benefits,
      jobRequirements,
      deadline,
      company_id: companyId,
      category_id: categoryId,
    });

    try {
      await authAPI().post(recruiterApis.postJob, {
        title: jobTitle,
        description,
        email,
        specialisms,
        salary,
        working_time: jobType,
        username,
        careerLevel,
        experience,
        location,
        benefits,
        job_requirements: jobRequirements,
        deadline,
        company_id: companyId,
        created_by: username,
        last_modified_by: username,
        category_id: categoryId,
      });
      setSuccess("Đăng tin tuyển dụng thành công!");
      navigate("/recruiter/jobs");
    } catch (err) {
      console.error("Error posting job:", err.response.data); // In ra thông báo lỗi chi tiết
      setError("Đã xảy ra lỗi khi đăng tin tuyển dụng. Vui lòng thử lại.");
    }
  };

  const handlePreview = () => {
    setIsPreviewModalOpen(true);
  };

  return (
    <div className={cx("wrapper")}>
      <h1>Đăng Tin Tuyển Dụng</h1>
      {error && <p className={cx("error-message")}>{error}</p>}
      {success && <p className={cx("success-message")}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={cx("form-group")}>
          <label htmlFor="jobTitle">Tiêu đề công việc</label>
          <input
            type="text"
            id="jobTitle"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="description">Mô tả công việc</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="location">Địa điểm làm việc</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="benefits">Quyền lợi</label>
          <textarea
            id="benefits"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="jobRequirements">Yêu cầu công việc</label>
          <textarea
            id="jobRequirements"
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="deadline">Hạn nộp đơn</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="email">Địa chỉ email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="specialisms">Chuyên môn</label>
          <input
            type="text"
            id="specialisms"
            value={specialisms}
            onChange={(e) => setSpecialisms(e.target.value)}
            required
          />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="salary">Mức lương</label>
          <select
            id="salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          >
            <option value="">Chọn mức lương</option>
            <option value="duoi-10-trieu">Dưới 10 triệu</option>
            <option value="10-15-trieu">10 - 15 triệu</option>
            <option value="15-20-trieu">15 - 20 triệu</option>
            <option value="20-25-trieu">20 - 25 triệu</option>
            <option value="25-30-trieu">25 - 30 triệu</option>
            <option value="30-50-trieu">30 - 50 triệu</option>
            <option value="tren-50-trieu">Trên 50 triệu</option>
            <option value="thoa-thuan">Thỏa thuận</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="username">Tên người đăng</label>
          <input type="text" id="username" value={username} required disabled />
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="jobType">Hình thức làm việc</label>
          <select
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
          >
            <option value="">Chọn hình thức</option>
            <option value="tat-ca">Tất cả</option>
            <option value="toan-thoi-gian">Toàn thời gian</option>
            <option value="ban-thoi-gian">Bán thời gian</option>
            <option value="thuc-tap">Thực tập</option>
            <option value="khac">Khác</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="careerLevel">Cấp độ nghề nghiệp</label>
          <select
            id="careerLevel"
            value={careerLevel}
            onChange={(e) => setCareerLevel(e.target.value)}
            required
          >
            <option value="">Chọn cấp độ</option>
            <option value="nhan-vien">Nhân viên</option>
            <option value="truong-nhom">Trưởng nhóm</option>
            <option value="truong-pho-phong">Trưởng/Phó phòng</option>
            <option value="quan-ly-giam-sat">Quản lý / Giám sát</option>
            <option value="truong-chi-nhanh">Trưởng chi nhánh</option>
            <option value="pho-giam-doc">Phó giám đốc</option>
            <option value="giam-doc">Giám đốc</option>
            <option value="thuc-tap-sinh">Thực tập sinh</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="experience">Kinh nghiệm</label>
          <select
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            required
          >
            <option value="">Chọn kinh nghiệm</option>
            <option value="khong-yeu-cau">Không yêu cầu</option>
            <option value="duoi-1-nam">Dưới 1 năm</option>
            <option value="1-nam">1 năm</option>
            <option value="2-nam">2 năm</option>
            <option value="3-nam">3 năm</option>
            <option value="4-nam">4 năm</option>
            <option value="5-nam">5 năm</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="companyType">Loại công ty</label>
          <select
            id="companyType"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            required
          >
            <option value="">Chọn loại công ty</option>
            <option value="tat-ca">Tất cả</option>
            <option value="pro-company">Pro Company</option>
          </select>
        </div>
        <div className={cx("form-group")}>
          <label htmlFor="categoryId">Danh mục</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className={cx("button-group")}>
          <button type="submit" className={cx("submit-btn")}>
            Đăng tin
          </button>
          <button
            type="button"
            className={cx("preview-btn")}
            onClick={handlePreview}
          >
            Xem trước
          </button>
        </div>
      </form>
      <PreviewJobModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        jobDetails={{
          title: jobTitle,
          description,
          salary,
          location,
          experience,
          jobType,
          rank: careerLevel,
          deadline,
          benefits,
          jobRequirements,
          workingLocation: location,
          status: "Đã đăng",
          categoryId,
        }}
        companyInfo={companyInfo}
      />
    </div>
  );
}

export default PostJob;
