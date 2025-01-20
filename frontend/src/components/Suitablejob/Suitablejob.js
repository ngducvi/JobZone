import React, { useEffect, useState } from "react";
import styles from "./Suitablejob.module.scss";
import classNames from "classnames/bind";
import { authAPI, userApis } from "~/utils/api";
import { Link, useNavigate } from "react-router-dom";
import images from "../../assets/images";

const cx = classNames.bind(styles);

const Suitablejob = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState(new Set());

  useEffect(() => {
    const fetchSuitableJobs = async () => {
      try {
        setLoading(true);
        const response = await authAPI().get(
          userApis.getAllSuitableJobsByUser,
          {
            params: {
              page: activePage,
            },
          }
        );
        setJobs(response.data.suitableJobs);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching suitable jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuitableJobs();
  }, [activePage]);

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
      } else {
        newSaved.add(jobId);
      }
      return newSaved;
    });
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <h2>Việc làm phù hợp với bạn</h2>
        <p>
          Để nhận được gợi ý việc làm chính xác hơn, hãy{" "}
          <Link to="/profile" className={cx("update-link")}>
            tùy chỉnh cài đặt gợi ý việc làm
          </Link>
          .
        </p>
      </div>

      {loading ? (
        <div className={cx("loading")}>Đang tải...</div>
      ) : (
        <>
          <div className={cx("job-list")}>
            {jobs.map((job) => (
              <div key={job.job_id} className={cx("job-item")}>
                <div className={cx("company-logo")}>
                  <img src={job.Company?.logo || images.company_1} alt="" />
                </div>

                <div className={cx("job-content")}>
                  <h3 className={cx("job-title")}>
                    <Link 
                      to={`/jobs/${job.job_id}`}
                      className={cx("job-link")}
                    >
                      {job.title}
                    </Link>
                  </h3>
                  <div className={cx("company-name")}>
                    {job.Company?.company_name}
                  </div>

                  <div className={cx("job-info")}>
                    <div className={cx("location")}>
                      <span>{job.location || "Hồ Chí Minh"}</span>
                    </div>
                    <div className={cx("salary")}>
                      <span>{job.salary || "8 - 15 triệu"}</span>
                    </div>
                    <div className={cx("deadline")}>
                      <span>
                        Còn {job.remaining_days || 14} ngày để ứng tuyển
                      </span>
                    </div>
                    <div className={cx("updated")}>
                      Cập nhật {job.updated_time || "3 tuần"} trước
                    </div>
                  </div>
                </div>

                <div className={cx("action-buttons")}>
                  <button className={cx("apply-btn")}>
                    <i className="fas fa-paper-plane"></i>
                    Ứng tuyển ngay
                  </button>
                  <button 
                    className={cx("save-btn", { saved: savedJobs.has(job.job_id) })}
                    onClick={() => handleSaveJob(job.job_id)}
                    title={savedJobs.has(job.job_id) ? "Bỏ lưu" : "Lưu tin"}
                  >
                    <i className={savedJobs.has(job.job_id) ? "fas fa-heart" : "far fa-heart"}></i>
                  </button>
                  <button className={cx("more-btn")} title="Xem thêm">
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Suitablejob;
