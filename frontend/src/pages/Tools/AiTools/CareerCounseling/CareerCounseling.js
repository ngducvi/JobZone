import React, { useState, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CareerCounseling.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import { 
  FaLightbulb, 
  FaChartLine, 
  FaCompass, 
  FaCopy, 
  FaCheck,
  FaRocket,
  FaRegClipboard
} from "react-icons/fa";

const cx = classNames.bind(styles);

const CareerCounseling = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [activeTab, setActiveTab] = useState("assessment"); // assessment, planning, guidance
  const [formData, setFormData] = useState({
    currentRole: "",
    yearsExperience: "",
    education: "",
    skills: "",
    interests: "",
    goals: "",
    challenges: "",
    preferredIndustries: "",
    workStyle: "office", // office, remote, hybrid
    careerStage: "early", // early, mid, senior, transition
    analysisType: "comprehensive" // quick, comprehensive, specific
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const workStyles = [
    { value: "office", label: "Làm việc tại văn phòng" },
    { value: "remote", label: "Làm việc từ xa" },
    { value: "hybrid", label: "Kết hợp" }
  ];

  const careerStages = [
    { value: "early", label: "Mới bắt đầu sự nghiệp" },
    { value: "mid", label: "Phát triển sự nghiệp" },
    { value: "senior", label: "Cấp quản lý/lãnh đạo" },
    { value: "transition", label: "Chuyển đổi nghề nghiệp" }
  ];

  const analysisTypes = [
    { value: "quick", label: "Đánh giá nhanh" },
    { value: "comprehensive", label: "Phân tích toàn diện" },
    { value: "specific", label: "Tư vấn vấn đề cụ thể" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCareerAdvice = async (type) => {
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
    if (type === "assessment") {
      prompt = `Là một chuyên gia tư vấn nghề nghiệp giàu kinh nghiệm, hãy phân tích và đưa ra lời khuyên cho người dùng dựa trên thông tin sau:

      Thông tin cá nhân:
      - Vị trí hiện tại: ${formData.currentRole}
      - Kinh nghiệm: ${formData.yearsExperience}
      - Học vấn: ${formData.education}
      - Kỹ năng: ${formData.skills}
      - Sở thích: ${formData.interests}
      
      Mục tiêu và thách thức:
      - Mục tiêu nghề nghiệp: ${formData.goals}
      - Thách thức hiện tại: ${formData.challenges}
      - Ngành nghề quan tâm: ${formData.preferredIndustries}
      
      Yêu cầu phân tích:
      1. Đánh giá điểm mạnh và điểm yếu
      2. Phân tích sự phù hợp với mục tiêu
      3. Đề xuất hướng phát triển
      4. Các kỹ năng cần bổ sung
      5. Lộ trình phát triển cụ thể
      6. Các cơ hội tiềm năng
      7. Lời khuyên thực tế`;
    } else if (type === "planning") {
      prompt = `Là một chuyên gia tư vấn nghề nghiệp, hãy xây dựng kế hoạch phát triển sự nghiệp chi tiết cho người dùng:

      Thông tin hiện tại:
      - Vị trí: ${formData.currentRole}
      - Giai đoạn sự nghiệp: ${formData.careerStage}
      - Hình thức làm việc mong muốn: ${formData.workStyle}
      - Mục tiêu: ${formData.goals}
      
      Yêu cầu lập kế hoạch:
      1. Mục tiêu ngắn hạn (6 tháng)
      2. Mục tiêu trung hạn (1-2 năm)
      3. Mục tiêu dài hạn (3-5 năm)
      4. Các bước thực hiện cụ thể
      5. Các mốc đánh giá tiến độ
      6. Kế hoạch phát triển kỹ năng
      7. Chiến lược networking
      8. Đề xuất các khóa học/chứng chỉ
      9. Cách đo lường thành công`;
    } else if (type === "guidance") {
      prompt = `Là một chuyên gia tư vấn nghề nghiệp, hãy đưa ra hướng dẫn và lời khuyên cụ thể cho các thách thức hiện tại của người dùng:

      Thông tin:
      - Thách thức: ${formData.challenges}
      - Vị trí hiện tại: ${formData.currentRole}
      - Mục tiêu: ${formData.goals}
      
      Yêu cầu tư vấn:
      1. Phân tích nguyên nhân
      2. Đề xuất giải pháp cụ thể
      3. Các bước thực hiện
      4. Cách vượt qua trở ngại
      5. Nguồn lực cần thiết
      6. Thời gian dự kiến
      7. Cách đánh giá tiến độ
      8. Lời khuyên thực tế`;
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
                Công cụ Tư vấn Sự nghiệp
              </h2>
              <p className={cx("description")}>
                Nhận tư vấn chuyên sâu và định hướng phát triển sự nghiệp từ AI
              </p>
            </div>

            <div className={cx("tabs")}>
              <button
                className={cx("tab", { active: activeTab === "assessment" })}
                onClick={() => setActiveTab("assessment")}
              >
                <FaLightbulb className={cx("icon")} />
                Đánh giá Nghề nghiệp
              </button>
              <button
                className={cx("tab", { active: activeTab === "planning" })}
                onClick={() => setActiveTab("planning")}
              >
                <FaChartLine className={cx("icon")} />
                Lập Kế hoạch Phát triển
              </button>
              <button
                className={cx("tab", { active: activeTab === "guidance" })}
                onClick={() => setActiveTab("guidance")}
              >
                <FaCompass className={cx("icon")} />
                Tư vấn Thách thức
              </button>
            </div>

            <div className={cx("form-container")}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />

              <div className={cx("form")}>
                {activeTab === "assessment" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Vị trí hiện tại(*)</label>
                        <input
                          type="text"
                          name="currentRole"
                          placeholder="VD: Frontend Developer"
                          value={formData.currentRole}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Số năm kinh nghiệm</label>
                        <input
                          type="text"
                          name="yearsExperience"
                          placeholder="VD: 3 năm"
                          value={formData.yearsExperience}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Học vấn</label>
                        <input
                          type="text"
                          name="education"
                          placeholder="VD: Cử nhân CNTT"
                          value={formData.education}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Kỹ năng chính</label>
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
                        <label>Sở thích nghề nghiệp</label>
                        <input
                          type="text"
                          name="interests"
                          placeholder="VD: Phát triển sản phẩm, làm việc nhóm"
                          value={formData.interests}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Ngành nghề quan tâm</label>
                        <input
                          type="text"
                          name="preferredIndustries"
                          placeholder="VD: Fintech, E-commerce"
                          value={formData.preferredIndustries}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Mục tiêu nghề nghiệp</label>
                        <textarea
                          name="goals"
                          placeholder="Mô tả mục tiêu nghề nghiệp của bạn"
                          value={formData.goals}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateCareerAdvice("assessment")}
                      disabled={!formData.currentRole || loading}
                    >
                      {loading ? "Đang phân tích..." : "Nhận Đánh giá Nghề nghiệp"}
                    </button>
                  </>
                )}

                {activeTab === "planning" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Giai đoạn sự nghiệp</label>
                        <select
                          name="careerStage"
                          value={formData.careerStage}
                          onChange={handleInputChange}
                        >
                          {careerStages.map(stage => (
                            <option key={stage.value} value={stage.value}>
                              {stage.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Hình thức làm việc mong muốn</label>
                        <select
                          name="workStyle"
                          value={formData.workStyle}
                          onChange={handleInputChange}
                        >
                          {workStyles.map(style => (
                            <option key={style.value} value={style.value}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Mục tiêu phát triển(*)</label>
                        <textarea
                          name="goals"
                          placeholder="Mô tả chi tiết mục tiêu phát triển của bạn"
                          value={formData.goals}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateCareerAdvice("planning")}
                      disabled={!formData.goals || loading}
                    >
                      {loading ? "Đang lập kế hoạch..." : "Nhận Kế hoạch Phát triển"}
                    </button>
                  </>
                )}

                {activeTab === "guidance" && (
                  <>
                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup")}>
                        <label>Loại phân tích</label>
                        <select
                          name="analysisType"
                          value={formData.analysisType}
                          onChange={handleInputChange}
                        >
                          {analysisTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={cx("inputGroup")}>
                        <label>Vị trí hiện tại</label>
                        <input
                          type="text"
                          name="currentRole"
                          placeholder="VD: Frontend Developer"
                          value={formData.currentRole}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Thách thức hiện tại(*)</label>
                        <textarea
                          name="challenges"
                          placeholder="Mô tả chi tiết thách thức bạn đang gặp phải"
                          value={formData.challenges}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className={cx("form-row")}>
                      <div className={cx("inputGroup", "full-width")}>
                        <label>Mục tiêu mong muốn</label>
                        <textarea
                          name="goals"
                          placeholder="Mô tả mục tiêu bạn muốn đạt được"
                          value={formData.goals}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <button
                      className={cx("button")}
                      onClick={() => generateCareerAdvice("guidance")}
                      disabled={!formData.challenges || loading}
                    >
                      {loading ? "Đang phân tích..." : "Nhận Tư vấn Chi tiết"}
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
                      {activeTab === "assessment" ? "Đánh giá Nghề nghiệp" :
                       activeTab === "planning" ? "Kế hoạch Phát triển" :
                       "Tư vấn Chi tiết"}
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

export default CareerCounseling; 