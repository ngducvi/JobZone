// JobDetail page
import React, { useEffect, useState } from "react";
import { authAPI, userApis } from "~/utils/api";
import { useParams, Link } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./JobDetail.module.scss";
import UserInfo from "~/components/UserInfo";
import images from "~/assets/images";
import PopularKeywords from '~/components/PopularKeywords/PopularKeywords';
const cx = classNames.bind(styles);

const JobDetail = () => {
  const [job, setJob] = useState(null);
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await authAPI().get(userApis.getJobDetailByJobId(id));
      setJob(response.data.job);
      setCompany(response.data.company);
      console.log(response.data);
    }
    fetchData();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        {/* Left Column - Job Details */}
        <div className={cx("job-content")}>
          <div className={cx("job-header")}>
            <div className={cx("company-info")}>
              <img
                src={job?.Company?.logo || images.company_1}
                alt=""
                className={cx("company-logo")}
              />
              <div className={cx("info")}>
                <h1 className={cx("job-title")}>{job?.title}</h1>
                <Link
                  to={`/company/${job?.Company?.id}`}
                  className={cx("company-name")}
                >
                  {job?.Company?.company_name}
                </Link>
                <div className={cx("deadline")}>
                  Hạn nộp hồ sơ: {job?.deadline || "Không thời hạn"}
                </div>
              </div>
            </div>
            <div className={cx("action-buttons")}>
              <button className={cx("apply-btn")}>
                <i className="fas fa-paper-plane"></i>
                Ứng tuyển ngay
              </button>
              <button className={cx("save-btn")}>
                <i className="far fa-heart"></i>
                Lưu tin
              </button>
            </div>
          </div>

          <div className={cx("job-overview")}>
            <div className={cx("overview-item")}>
              <i className="fas fa-sack-dollar"></i>
              <div>
                <label>Mức lương</label>
                <span>{job?.salary || "Thỏa thuận"}</span>
              </div>
            </div>
            <div className={cx("overview-item")}>
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <label>Địa điểm</label>
                <span>{job?.location}</span>
              </div>
            </div>
            <div className={cx("overview-item")}>
              <i className="fas fa-briefcase"></i>
              <div>
                <label>Kinh nghiệm</label>
                <span>{job?.experience || "Không yêu cầu"}</span>
              </div>
            </div>
          </div>

          <div className={cx("job-description")}>
            <h2>Chi tiết tuyển dụng</h2>
            <div className={cx("section")}>
              <h3>Mô tả công việc</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.description }} />
            </div>

            <div className={cx("section")}>
              <h3>Yêu cầu ứng viên</h3>
              <div
                dangerouslySetInnerHTML={{ __html: job?.job_requirements }}
              />
            </div>
            {/* thu nhập */}
            <div className={cx("section")}>
              <h3>Thu nhập</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.salary }} />
            </div>

            <div className={cx("section")}>
              <h3>Quyền lợi</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.benefits }} />
            </div>
            {/* địa điểm làm việc */}
            <div className={cx("section")}>
              <h3>Địa điểm làm việc</h3>
              <div dangerouslySetInnerHTML={{ __html: job?.location }} />
            </div>
            {/* cách thức ứng tuyển  */}
            <div className={cx("section")}>
              <h3>Cách thức ứng tuyển</h3>
              Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới
              đây.
              {/* hạn nộp */}
              <div className={cx("deadline")}>
                Hạn nộp: {job?.deadline || "Không thời hạn"}
              </div>
            </div>
            {/* Button ứng tuyển và Lưu Tin  */}
            <div className={cx("action-buttons")}>
              <button className={cx("apply-btn")}>
                <i className="fas fa-paper-plane"></i>
                Ứng tuyển ngay
              </button>
              <button className={cx("save-btn")}>
                <i className="far fa-heart"></i>
                Lưu tin
              </button>
            </div>
            <div className={cx("report-btn")}>
              <i className="fas fa-exclamation-triangle"></i>
              Báo cáo tin tuyển dụng: Nếu bạn thấy rằng tin tuyển dụng này không
              đúng hoặc có dấu hiệu lừa đảo, hãy phản ánh với chúng tôi.
            </div>
          </div>
        </div>

        {/* Right Column - Company Info */}
        <div className={cx("company-profile")}>
          <div className={cx("company-card")}>
            <img src={company?.logo || images.company_1} alt="" />
            <h3>{company?.company_name}</h3>
            <div className={cx("company-meta")}>
              <div>
                <i className="fas fa-user-friends"></i>
                <span>{company?.size || "100-499 nhân viên"}</span>
              </div>
              <div>
                <i className="fas fa-briefcase"></i>
                <span>{company?.industry || "Bán lẻ - Hàng tiêu dùng - FMCG"} </span>
              </div>
              <div>
                <i className="fas fa-map-marker-alt"></i>
                <span>{company?.address || "Hà Nội"}</span>
              </div>
            </div>
            <Link
              to={`/company/${job?.Company?.id}`}
              className={cx("view-company")}
            >
              Xem trang công ty <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className={cx("job-overview-card")}>
            <h3>Thông tin chung</h3>
            <div className={cx("overview-items")}>
              <div className={cx("item")}>
                <i className="fas fa-chart-line"></i>
                <div>
                  <label>Cấp bậc</label>
                  <span>{job?.rank || "Nhân viên"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-graduation-cap"></i>
                <div>
                  <label>Học vấn</label>
                  <span>{job?.education || "Trung học phổ thông (Cấp 3) trở lên"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-users"></i>
                <div>
                  <label>Số lượng tuyển</label>
                  <span>{job?.quantity || "2 người"}</span>
                </div>
              </div>
              <div className={cx("item")}>
                <i className="fas fa-clock"></i>
                <div>
                  <label>Hình thức làm việc</label>
                  <span>{job?.working_time|| "Toàn thời gian"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={cx("related-categories")}>
            <h3>Danh mục Nghề liên quan</h3>
            <div className={cx("category-list")}>
              <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              <Link to="/jobs/ban-le">Bán lẻ/Bán sỉ</Link>
              <Link to="/jobs/ban-hang">Bán hàng/Dịch vụ khách hàng</Link>
              <Link to="/jobs/ban-le">Bán lẻ</Link>
            </div>
            {/* Kỹ năng cần có */}
            <div className={cx("required-skills")}>
              <h3>Kỹ năng cần có</h3>
              <div className={cx("category-list")}>
                <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              </div>
            </div>
            {/* Khu vực làm việc */}
            <div className={cx("work-location")}>
              <h3>Khu vực làm việc</h3>
              <div className={cx("category-list")}>
                <Link to="/jobs/kinh-doanh">Kinh doanh/Bán hàng</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={cx('social-buttons')}>
        <button 
          className={cx('social-btn', 'facebook')} 
          onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-facebook-f"></i>
        </button>
        <button 
          className={cx('social-btn', 'twitter')}
          onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-twitter"></i>
        </button>
        <button 
          className={cx('social-btn', 'linkedin')}
          onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`, '_blank')}
        >
          <i className="fab fa-linkedin-in"></i>
        </button>
        <button 
          className={cx('social-btn', 'copy-link', { copied })}
          onClick={handleCopyLink}
          title={copied ? 'Đã sao chép' : 'Sao chép liên kết'}
        >
          <i className={copied ? "fas fa-check" : "fas fa-link"}></i>
        </button>
      </div>
      <PopularKeywords />
    </div>
  );
};

export default JobDetail;
