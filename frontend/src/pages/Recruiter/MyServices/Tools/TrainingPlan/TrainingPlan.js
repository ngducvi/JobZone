// page 
import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./TrainingPlan.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import { 
  FaGraduationCap, 
  FaChartLine, 
  FaUsers, 
  FaCopy, 
  FaCheck,
  FaRocket,
  FaRegClipboard,
  FaCalendarAlt,
  FaBook,
  FaTasks
} from "react-icons/fa";

const cx = classNames.bind(styles);

const TrainingPlan = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [activeTab, setActiveTab] = useState("new"); // new, existing, evaluation
  const [formData, setFormData] = useState({
    department: "",
    position: "",
    employeeCount: "",
    experienceLevel: "junior", // junior, mid, senior
    trainingDuration: "",
    trainingType: "technical", // technical, soft-skills, leadership
    goals: "",
    challenges: "",
    resources: "",
    budget: "",
    timeline: "",
    evaluationMethod: "quiz", // quiz, project, presentation
    customRequirements: ""
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const experienceLevels = [
    { value: "junior", label: "Junior (0-2 năm)" },
    { value: "mid", label: "Mid-level (2-5 năm)" },
    { value: "senior", label: "Senior (5+ năm)" }
  ];

  const trainingTypes = [
    { value: "technical", label: "Kỹ thuật" },
    { value: "soft-skills", label: "Kỹ năng mềm" },
    { value: "leadership", label: "Lãnh đạo" }
  ];

  const evaluationMethods = [
    { value: "quiz", label: "Bài kiểm tra" },
    { value: "project", label: "Dự án thực tế" },
    { value: "presentation", label: "Thuyết trình" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateTrainingPlan = async (type) => {
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
    if (type === "new") {
      prompt = `Là một chuyên gia đào tạo, hãy tạo một kế hoạch đào tạo chi tiết với thông tin sau:

      Thông tin cơ bản:
      - Phòng ban: ${formData.department}
      - Vị trí: ${formData.position}
      - Số lượng nhân viên: ${formData.employeeCount}
      - Trình độ kinh nghiệm: ${formData.experienceLevel}
      
      Thông tin đào tạo:
      - Loại đào tạo: ${formData.trainingType}
      - Thời lượng: ${formData.trainingDuration}
      - Mục tiêu: ${formData.goals}
      - Thách thức: ${formData.challenges}
      
      Thông tin bổ sung:
      - Nguồn lực: ${formData.resources}
      - Ngân sách: ${formData.budget}
      - Thời gian: ${formData.timeline}
      - Phương pháp đánh giá: ${formData.evaluationMethod}
      - Yêu cầu đặc biệt: ${formData.customRequirements}
      
      Yêu cầu kế hoạch:
      1. Tổng quan về chương trình
      2. Mục tiêu học tập cụ thể
      3. Nội dung chi tiết từng module
      4. Phương pháp giảng dạy
      5. Tài liệu và công cụ
      6. Lịch trình chi tiết
      7. Phương pháp đánh giá
      8. Kế hoạch theo dõi và điều chỉnh`;
    } else if (type === "existing") {
      prompt = `Là một chuyên gia đào tạo, hãy đánh giá và đề xuất cải thiện kế hoạch đào tạo hiện tại:

      Thông tin hiện tại:
      - Phòng ban: ${formData.department}
      - Vị trí: ${formData.position}
      - Loại đào tạo: ${formData.trainingType}
      - Thách thức: ${formData.challenges}
      
      Yêu cầu phân tích:
      1. Đánh giá hiệu quả hiện tại
      2. Điểm mạnh và điểm yếu
      3. Đề xuất cải thiện
      4. Kế hoạch triển khai
      5. Phương pháp đo lường kết quả
      6. Tài nguyên bổ sung
      7. Lịch trình điều chỉnh`;
    } else if (type === "evaluation") {
      prompt = `Là một chuyên gia đào tạo, hãy tạo kế hoạch đánh giá hiệu quả đào tạo:

      Thông tin:
      - Phòng ban: ${formData.department}
      - Vị trí: ${formData.position}
      - Loại đào tạo: ${formData.trainingType}
      - Phương pháp đánh giá: ${formData.evaluationMethod}
      
      Yêu cầu kế hoạch:
      1. Tiêu chí đánh giá
      2. Công cụ và phương pháp
      3. Thời điểm đánh giá
      4. Người thực hiện đánh giá
      5. Quy trình thu thập dữ liệu
      6. Phương pháp phân tích
      7. Báo cáo kết quả
      8. Kế hoạch cải thiện`;
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
                Công cụ Tạo Kế hoạch Đào tạo
              </h2>
              <p className={cx("description")}>
                Tạo và quản lý kế hoạch đào tạo chuyên nghiệp với sự hỗ trợ của AI
              </p>
            </div>

            <div className={cx("tabs")}>
              <button
                className={cx("tab", { active: activeTab === "new" })}
                onClick={() => setActiveTab("new")}
              >
                <FaGraduationCap className={cx("icon")} />
                Kế hoạch Mới
              </button>
              <button
                className={cx("tab", { active: activeTab === "existing" })}
                onClick={() => setActiveTab("existing")}
              >
                <FaChartLine className={cx("icon")} />
                Cải thiện
              </button>
              <button
                className={cx("tab", { active: activeTab === "evaluation" })}
                onClick={() => setActiveTab("evaluation")}
              >
                <FaUsers className={cx("icon")} />
                Đánh giá
              </button>
            </div>

            <div className={cx("form-container")}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />

              <div className={cx("form")}>
                {activeTab === "new" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Phòng ban(*)</label>
                        <input
                          type="text"
                          name="department"
                          placeholder="VD: Phòng Kỹ thuật"
                          value={formData.department}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Vị trí(*)</label>
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
                        <label>Số lượng nhân viên</label>
                        <input
                          type="text"
                          name="employeeCount"
                          placeholder="VD: 10 người"
                          value={formData.employeeCount}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Trình độ kinh nghiệm</label>
                        <select
                          name="experienceLevel"
                          value={formData.experienceLevel}
                          onChange={handleInputChange}
                        >
                          {experienceLevels.map(level => (
                            <option key={level.value} value={level.value}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Loại đào tạo</label>
                        <select
                          name="trainingType"
                          value={formData.trainingType}
                          onChange={handleInputChange}
                        >
                          {trainingTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Thời lượng đào tạo</label>
                        <input
                          type="text"
                          name="trainingDuration"
                          placeholder="VD: 2 tháng"
                          value={formData.trainingDuration}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Mục tiêu đào tạo</label>
                        <textarea
                          name="goals"
                          placeholder="Mô tả mục tiêu đào tạo"
                          value={formData.goals}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Thách thức</label>
                        <textarea
                          name="challenges"
                          placeholder="Mô tả các thách thức cần giải quyết"
                          value={formData.challenges}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Nguồn lực</label>
                        <input
                          type="text"
                          name="resources"
                          placeholder="VD: Giảng viên, tài liệu, phòng học"
                          value={formData.resources}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Ngân sách</label>
                        <input
                          type="text"
                          name="budget"
                          placeholder="VD: 50 triệu VND"
                          value={formData.budget}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Thời gian</label>
                        <input
                          type="text"
                          name="timeline"
                          placeholder="VD: Q1/2024"
                          value={formData.timeline}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Phương pháp đánh giá</label>
                        <select
                          name="evaluationMethod"
                          value={formData.evaluationMethod}
                          onChange={handleInputChange}
                        >
                          {evaluationMethods.map(method => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Yêu cầu đặc biệt</label>
                        <textarea
                          name="customRequirements"
                          placeholder="Mô tả các yêu cầu đặc biệt khác"
                          value={formData.customRequirements}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateTrainingPlan("new")}
                      disabled={!formData.department || !formData.position || loading}
                    >
                      {loading ? "Đang tạo kế hoạch..." : "Tạo Kế hoạch Đào tạo"}
                    </button>
                  </>
                )}

                {activeTab === "existing" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Phòng ban(*)</label>
                        <input
                          type="text"
                          name="department"
                          placeholder="VD: Phòng Kỹ thuật"
                          value={formData.department}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Vị trí(*)</label>
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
                        <label>Loại đào tạo</label>
                        <select
                          name="trainingType"
                          value={formData.trainingType}
                          onChange={handleInputChange}
                        >
                          {trainingTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Thách thức hiện tại</label>
                        <textarea
                          name="challenges"
                          placeholder="Mô tả các thách thức cần giải quyết"
                          value={formData.challenges}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateTrainingPlan("existing")}
                      disabled={!formData.department || !formData.position || loading}
                    >
                      {loading ? "Đang phân tích..." : "Phân tích và Cải thiện"}
                    </button>
                  </>
                )}

                {activeTab === "evaluation" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Phòng ban(*)</label>
                        <input
                          type="text"
                          name="department"
                          placeholder="VD: Phòng Kỹ thuật"
                          value={formData.department}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Vị trí(*)</label>
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
                        <label>Loại đào tạo</label>
                        <select
                          name="trainingType"
                          value={formData.trainingType}
                          onChange={handleInputChange}
                        >
                          {trainingTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Phương pháp đánh giá</label>
                        <select
                          name="evaluationMethod"
                          value={formData.evaluationMethod}
                          onChange={handleInputChange}
                        >
                          {evaluationMethods.map(method => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateTrainingPlan("evaluation")}
                      disabled={!formData.department || !formData.position || loading}
                    >
                      {loading ? "Đang tạo kế hoạch..." : "Tạo Kế hoạch Đánh giá"}
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
                      {activeTab === "new" ? "Kế hoạch Đào tạo" :
                       activeTab === "existing" ? "Phân tích và Cải thiện" :
                       "Kế hoạch Đánh giá"}
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

export default TrainingPlan;
