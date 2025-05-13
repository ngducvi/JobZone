// page job description
import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./JobDescription.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import { 
  FaBriefcase, 
  FaBuilding, 
  FaMoneyBill, 
  FaCopy, 
  FaCheck,
  FaRocket,
  FaRegClipboard,
  FaGraduationCap,
  FaUsers,
  FaMapMarkerAlt
} from "react-icons/fa";

const cx = classNames.bind(styles);

const JobDescription = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "full-time", // full-time, part-time, contract
    experience: "1-3", // 0-1, 1-3, 3-5, 5+
    education: "bachelor", // high-school, bachelor, master, phd
    salary: "",
    skills: "",
    responsibilities: "",
    benefits: "",
    companyDescription: ""
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const jobTypes = [
    { value: "full-time", label: "Toàn thời gian" },
    { value: "part-time", label: "Bán thời gian" },
    { value: "contract", label: "Hợp đồng" }
  ];

  const experienceLevels = [
    { value: "0-1", label: "0-1 năm" },
    { value: "1-3", label: "1-3 năm" },
    { value: "3-5", label: "3-5 năm" },
    { value: "5+", label: "5+ năm" }
  ];

  const educationLevels = [
    { value: "high-school", label: "Trung học phổ thông" },
    { value: "bachelor", label: "Cử nhân" },
    { value: "master", label: "Thạc sĩ" },
    { value: "phd", label: "Tiến sĩ" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateJobDescription = async () => {
    setLoading(true);
    setIsStreaming(true);
    setStreamError(null);
    setCompletionStatus("");
    setGeneratedContent("");

    const token = localStorage.getItem("token");
    if (!token) {
      setModalType("loginEmail");
      setLoading(false);
      setIsStreaming(false);
      return;
    }

    const prompt = `Là một chuyên gia tuyển dụng, hãy tạo một bản mô tả công việc chuyên nghiệp với thông tin sau:

    Thông tin cơ bản:
    - Vị trí: ${formData.jobTitle}
    - Công ty: ${formData.companyName}
    - Địa điểm: ${formData.location}
    - Loại công việc: ${formData.jobType}
    - Kinh nghiệm: ${formData.experience} năm
    - Trình độ học vấn: ${formData.education}
    
    Thông tin chi tiết:
    - Mức lương: ${formData.salary}
    - Kỹ năng yêu cầu: ${formData.skills}
    - Trách nhiệm: ${formData.responsibilities}
    - Phúc lợi: ${formData.benefits}
    - Mô tả công ty: ${formData.companyDescription}
    
    Yêu cầu mô tả:
    1. Tổng quan về vị trí
    2. Mô tả công ty
    3. Trách nhiệm chính
    4. Yêu cầu kỹ năng
    5. Yêu cầu kinh nghiệm
    6. Phúc lợi và đãi ngộ
    7. Thông tin bổ sung
    8. Cách ứng tuyển`;

    let eventSource;
    try {
      eventSource = new EventSourcePolyfill(
        `${process.env.REACT_APP_API_URL}/openai/chat-stream?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          withCredentials: false,
          heartbeatTimeout: 60000,
        }
      );

      eventSource.onopen = () => {
        setStreamError(null);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setGeneratedContent((prev) => prev + data);
        } catch (error) {
          console.error('Error parsing event data:', error);
          setStreamError('Lỗi khi xử lý dữ liệu nhận được');
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          setIsStreaming(false);
          if (generatedContent) {
            setCompletionStatus('Đã hoàn thành! Bạn có thể sao chép nội dung.');
          } else {
            setStreamError('Kết nối bị đóng trước khi nhận được nội dung');
          }
        }
        eventSource.close();
        setLoading(false);
      };

    } catch (error) {
      console.error('Error:', error);
      setStreamError('Đã xảy ra lỗi');
      setLoading(false);
      setIsStreaming(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy:', err);
        });
    }
  };

    return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("content")}>
          <div className={cx("main-content")}>
            <div className={cx("header")}>
              <h2>
                <FaRocket className={cx("icon")} />
                Công cụ Tạo Mô tả Công việc
              </h2>
              <p className={cx("description")}>
                Tạo mô tả công việc chuyên nghiệp với sự hỗ trợ của AI
              </p>
            </div>

            <div className={cx("form-container")}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />

              <div className={cx("form")}>
                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Vị trí công việc(*)</label>
                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="VD: Frontend Developer"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Tên công ty(*)</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="VD: Tech Solutions"
                      value={formData.companyName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Địa điểm</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="VD: Hà Nội"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Loại công việc</label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                    >
                      {jobTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Kinh nghiệm</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                    >
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Trình độ học vấn</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                    >
                      {educationLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Mức lương</label>
                    <input
                      type="text"
                      name="salary"
                      placeholder="VD: 20-30 triệu VND"
                      value={formData.salary}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup", "full-width")}>
                    <label>Kỹ năng yêu cầu</label>
                    <textarea
                      name="skills"
                      placeholder="Liệt kê các kỹ năng cần thiết"
                      value={formData.skills}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup", "full-width")}>
                    <label>Trách nhiệm chính</label>
                    <textarea
                      name="responsibilities"
                      placeholder="Mô tả các trách nhiệm chính của vị trí"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup", "full-width")}>
                    <label>Phúc lợi</label>
                    <textarea
                      name="benefits"
                      placeholder="Mô tả các phúc lợi của công ty"
                      value={formData.benefits}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup", "full-width")}>
                    <label>Mô tả công ty</label>
                    <textarea
                      name="companyDescription"
                      placeholder="Mô tả ngắn gọn về công ty"
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <button
                  className={cx("button")}
                  onClick={generateJobDescription}
                  disabled={!formData.jobTitle || !formData.companyName || loading}
                >
                  {loading ? "Đang tạo mô tả..." : "Tạo Mô tả Công việc"}
                </button>
              </div>

              {streamError && (
                <div className={cx("error-message")}>
                  {streamError}
                </div>
              )}

              {generatedContent && (
                <div className={cx("result-container")}>
                  <div className={cx("result-header")}>
                    <h3>
                      <FaRegClipboard className={cx("icon")} />
                      Mô tả Công việc
                    </h3>
                    <div className={cx("header-actions")}>
                      {isStreaming ? (
                        <span className={cx("streaming-indicator")}>
                          Đang tạo nội dung...
                        </span>
                      ) : completionStatus ? (
                        <span className={cx("completion-status")}>
                          {completionStatus}
                        </span>
                      ) : null}
                      <button 
                        className={cx("button")} 
                        onClick={handleCopyContent}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        {copySuccess ? (
                          <>
                            <FaCheck /> Đã sao chép!
                          </>
                        ) : (
                          <>
                            <FaCopy /> Sao chép
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className={cx("result-content")}>
                    {generatedContent.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;


