import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./WriteRecruitmentEmails.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import { 
  FaEnvelope, 
  FaUserTie, 
  FaBuilding, 
  FaCopy, 
  FaCheck,
  FaRocket,
  FaRegClipboard
} from "react-icons/fa";

const cx = classNames.bind(styles);

const WriteRecruitmentEmails = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [activeTab, setActiveTab] = useState("initial"); // initial, followup, rejection
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    candidateName: "",
    experience: "",
    skills: "",
    salary: "",
    benefits: "",
    location: "",
    workType: "full-time", // full-time, part-time, contract
    emailType: "initial", // initial, followup, rejection
    tone: "professional" // professional, friendly, formal
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const workTypes = [
    { value: "full-time", label: "Toàn thời gian" },
    { value: "part-time", label: "Bán thời gian" },
    { value: "contract", label: "Hợp đồng" }
  ];

  const emailTypes = [
    { value: "initial", label: "Email đầu tiên" },
    { value: "followup", label: "Email theo dõi" },
    { value: "rejection", label: "Email từ chối" }
  ];

  const tones = [
    { value: "professional", label: "Chuyên nghiệp" },
    { value: "friendly", label: "Thân thiện" },
    { value: "formal", label: "Trang trọng" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateEmail = async (type) => {
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

    let prompt = "";
    if (type === "initial") {
      prompt = `Là một chuyên gia tuyển dụng, hãy viết một email tuyển dụng chuyên nghiệp với thông tin sau:

      Thông tin công ty và vị trí:
      - Tên công ty: ${formData.companyName}
      - Vị trí tuyển dụng: ${formData.position}
      - Loại công việc: ${formData.workType}
      - Địa điểm: ${formData.location}
      
      Thông tin ứng viên:
      - Tên ứng viên: ${formData.candidateName}
      - Kinh nghiệm: ${formData.experience}
      - Kỹ năng: ${formData.skills}
      
      Thông tin bổ sung:
      - Mức lương: ${formData.salary}
      - Phúc lợi: ${formData.benefits}
      - Giọng điệu: ${formData.tone}
      
      Yêu cầu email:
      1. Lời chào thân thiện
      2. Giới thiệu công ty và vị trí
      3. Lý do quan tâm đến ứng viên
      4. Mô tả cơ hội
      5. Lời kêu gọi hành động
      6. Thông tin liên hệ`;
    } else if (type === "followup") {
      prompt = `Là một chuyên gia tuyển dụng, hãy viết một email theo dõi sau phỏng vấn:

      Thông tin:
      - Tên công ty: ${formData.companyName}
      - Vị trí: ${formData.position}
      - Tên ứng viên: ${formData.candidateName}
      - Giọng điệu: ${formData.tone}
      
      Yêu cầu email:
      1. Cảm ơn ứng viên đã tham gia phỏng vấn
      2. Nhắc lại các điểm chính từ cuộc phỏng vấn
      3. Cập nhật tiến trình tuyển dụng
      4. Thời gian dự kiến phản hồi
      5. Mời đặt câu hỏi
      6. Thông tin liên hệ`;
    } else if (type === "rejection") {
      prompt = `Là một chuyên gia tuyển dụng, hãy viết một email từ chối ứng viên một cách chuyên nghiệp:

      Thông tin:
      - Tên công ty: ${formData.companyName}
      - Vị trí: ${formData.position}
      - Tên ứng viên: ${formData.candidateName}
      - Giọng điệu: ${formData.tone}
      
      Yêu cầu email:
      1. Cảm ơn sự quan tâm
      2. Thông báo quyết định
      3. Phản hồi tích cực
      4. Khuyến khích ứng tuyển trong tương lai
      5. Giữ liên lạc
      6. Lời chúc tốt đẹp`;
    }

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
                Công cụ Viết Email Tuyển dụng
              </h2>
              <p className={cx("description")}>
                Tạo email tuyển dụng chuyên nghiệp với sự hỗ trợ của AI
              </p>
            </div>

            <div className={cx("tabs")}>
              <button
                className={cx("tab", { active: activeTab === "initial" })}
                onClick={() => setActiveTab("initial")}
              >
                <FaEnvelope className={cx("icon")} />
                Email Đầu tiên
              </button>
              <button
                className={cx("tab", { active: activeTab === "followup" })}
                onClick={() => setActiveTab("followup")}
              >
                <FaUserTie className={cx("icon")} />
                Email Theo dõi
              </button>
              <button
                className={cx("tab", { active: activeTab === "rejection" })}
                onClick={() => setActiveTab("rejection")}
              >
                <FaBuilding className={cx("icon")} />
                Email Từ chối
              </button>
            </div>

            <div className={cx("form-container")}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />

              <div className={cx("form")}>
                {activeTab === "initial" && (
                  <>
                    <div className={cx("form-row")}>
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

                      <div className={cx("inputGroup")}>
                        <label>Vị trí tuyển dụng(*)</label>
                        <input
                          type="text"
                          name="position"
                          placeholder="VD: Frontend Developer"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Tên ứng viên</label>
                        <input
                          type="text"
                          name="candidateName"
                          placeholder="VD: Nguyễn Văn A"
                          value={formData.candidateName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Loại công việc</label>
                        <select
                          name="workType"
                          value={formData.workType}
                          onChange={handleInputChange}
                        >
                          {workTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Kinh nghiệm yêu cầu</label>
                        <input
                          type="text"
                          name="experience"
                          placeholder="VD: 3-5 năm kinh nghiệm"
                          value={formData.experience}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Kỹ năng cần thiết</label>
                        <input
                          type="text"
                          name="skills"
                          placeholder="VD: React, TypeScript, UI/UX"
                          value={formData.skills}
                          onChange={handleInputChange}
                        />
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
                      <div className={cx("inputGroup")}>
                        <label>Giọng điệu</label>
                        <select
                          name="tone"
                          value={formData.tone}
                          onChange={handleInputChange}
                        >
                          {tones.map(tone => (
                            <option key={tone.value} value={tone.value}>
                              {tone.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateEmail("initial")}
                      disabled={!formData.companyName || !formData.position || loading}
                    >
                      {loading ? "Đang tạo email..." : "Tạo Email Tuyển dụng"}
                    </button>
                  </>
                )}

                {activeTab === "followup" && (
                  <>
                    <div className={cx("form-row")}>
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

                      <div className={cx("inputGroup")}>
                        <label>Vị trí tuyển dụng(*)</label>
                        <input
                          type="text"
                          name="position"
                          placeholder="VD: Frontend Developer"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Tên ứng viên(*)</label>
                        <input
                          type="text"
                          name="candidateName"
                          placeholder="VD: Nguyễn Văn A"
                          value={formData.candidateName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Giọng điệu</label>
                        <select
                          name="tone"
                          value={formData.tone}
                          onChange={handleInputChange}
                        >
                          {tones.map(tone => (
                            <option key={tone.value} value={tone.value}>
                              {tone.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateEmail("followup")}
                      disabled={!formData.companyName || !formData.position || !formData.candidateName || loading}
                    >
                      {loading ? "Đang tạo email..." : "Tạo Email Theo dõi"}
                    </button>
                  </>
                )}

                {activeTab === "rejection" && (
                  <>
                    <div className={cx("form-row")}>
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

                      <div className={cx("inputGroup")}>
                        <label>Vị trí tuyển dụng(*)</label>
                        <input
                          type="text"
                          name="position"
                          placeholder="VD: Frontend Developer"
                          value={formData.position}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Tên ứng viên(*)</label>
                        <input
                          type="text"
                          name="candidateName"
                          placeholder="VD: Nguyễn Văn A"
                          value={formData.candidateName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Giọng điệu</label>
                        <select
                          name="tone"
                          value={formData.tone}
                          onChange={handleInputChange}
                        >
                          {tones.map(tone => (
                            <option key={tone.value} value={tone.value}>
                              {tone.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateEmail("rejection")}
                      disabled={!formData.companyName || !formData.position || !formData.candidateName || loading}
                    >
                      {loading ? "Đang tạo email..." : "Tạo Email Từ chối"}
                    </button>
                  </>
                )}
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
                      {activeTab === "initial" ? "Email Tuyển dụng" :
                       activeTab === "followup" ? "Email Theo dõi" :
                       "Email Từ chối"}
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

export default WriteRecruitmentEmails;
