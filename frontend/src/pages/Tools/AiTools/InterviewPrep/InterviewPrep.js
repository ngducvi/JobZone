import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./InterviewPrep.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import { FaUserTie, FaLightbulb, FaComments, FaCheck, FaCopy, FaPlay, FaPause, FaStop } from "react-icons/fa";

const cx = classNames.bind(styles);

const InterviewPrep = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState("");
  const [activeTab, setActiveTab] = useState("practice"); // practice, questions, feedback
  const [formData, setFormData] = useState({
    jobTitle: "",
    industry: "",
    experienceLevel: "entry", // entry, mid, senior
    interviewType: "technical", // technical, behavioral, general
    specificSkills: "",
    preferredLanguage: "vietnamese" // vietnamese, english
  });
  
  const [practiceSession, setPracticeSession] = useState({
    isActive: false,
    currentQuestion: "",
    userAnswer: "",
    feedback: "",
    recording: false,
    audioUrl: null
  });

  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const experienceLevels = [
    { value: "entry", label: "Mới đi làm (0-2 năm)" },
    { value: "mid", label: "Có kinh nghiệm (2-5 năm)" },
    { value: "senior", label: "Nhiều kinh nghiệm (5+ năm)" }
  ];

  const interviewTypes = [
    { value: "technical", label: "Phỏng vấn kỹ thuật" },
    { value: "behavioral", label: "Phỏng vấn hành vi" },
    { value: "general", label: "Phỏng vấn chung" }
  ];

  const languages = [
    { value: "vietnamese", label: "Tiếng Việt" },
    { value: "english", label: "Tiếng Anh" }
  ];

  useEffect(() => {
    // Cleanup recording when component unmounts
    return () => {
      if (practiceSession.recording) {
        stopRecording();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateInterviewContent = async (type) => {
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
    if (type === "questions") {
      prompt = `Là một chuyên gia tuyển dụng có kinh nghiệm, hãy tạo một danh sách câu hỏi phỏng vấn chi tiết cho vị trí ${formData.jobTitle} trong ngành ${formData.industry}.

      Thông tin chi tiết:
      - Cấp độ kinh nghiệm: ${formData.experienceLevel === 'entry' ? 'Mới đi làm (0-2 năm)' : 
        formData.experienceLevel === 'mid' ? 'Có kinh nghiệm (2-5 năm)' : 'Nhiều kinh nghiệm (5+ năm)'}
      - Loại phỏng vấn: ${formData.interviewType === 'technical' ? 'Kỹ thuật' :
        formData.interviewType === 'behavioral' ? 'Hành vi' : 'Chung'}
      - Kỹ năng cần đánh giá: ${formData.specificSkills}
      - Ngôn ngữ: ${formData.preferredLanguage === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}

      Yêu cầu:
      1. Tạo 10 câu hỏi phỏng vấn phù hợp
      2. Với mỗi câu hỏi, cung cấp:
         - Mục đích đánh giá
         - Gợi ý trả lời
         - Các điểm cần lưu ý
      3. Sắp xếp từ dễ đến khó
      4. Thêm lời khuyên cho cách trả lời`;
    } else if (type === "feedback") {
      prompt = `Là một chuyên gia tuyển dụng, hãy đánh giá câu trả lời sau cho câu hỏi phỏng vấn:

      Câu hỏi: ${practiceSession.currentQuestion}
      Câu trả lời: ${practiceSession.userAnswer}

      Yêu cầu đánh giá:
      1. Điểm mạnh trong câu trả lời
      2. Điểm cần cải thiện
      3. Gợi ý cách trả lời tốt hơn
      4. Đánh giá về:
         - Nội dung
         - Cách trình bày
         - Tính thuyết phục
      5. Lời khuyên cụ thể để cải thiện`
      `Lưu ý nội dung đẹp mắt `;
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

  const startPracticeSession = () => {
    setPracticeSession(prev => ({
      ...prev,
      isActive: true,
      currentQuestion: "Hãy giới thiệu về bản thân và kinh nghiệm của bạn?",
      userAnswer: "",
      feedback: "",
      recording: false,
      audioUrl: null
    }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPracticeSession(prev => ({
          ...prev,
          audioUrl
        }));
      };

      mediaRecorder.start();
      setPracticeSession(prev => ({
        ...prev,
        recording: true,
        mediaRecorder
      }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (practiceSession.recording && practiceSession.mediaRecorder) {
      practiceSession.mediaRecorder.stop();
      setPracticeSession(prev => ({
        ...prev,
        recording: false
      }));
    }
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
                <FaUserTie className={cx("icon")} />
                Công cụ Chuẩn bị Phỏng vấn
              </h2>
              <p className={cx("description")}>
                Chuẩn bị và luyện tập phỏng vấn với sự hỗ trợ của AI
              </p>
            </div>

            <div className={cx("tabs")}>
              <button
                className={cx("tab", { active: activeTab === "practice" })}
                onClick={() => setActiveTab("practice")}
              >
                <FaComments className={cx("icon")} />
                Luyện tập phỏng vấn
              </button>
              <button
                className={cx("tab", { active: activeTab === "questions" })}
                onClick={() => setActiveTab("questions")}
              >
                <FaLightbulb className={cx("icon")} />
                Ngân hàng câu hỏi
              </button>
            </div>

            <div className={cx("form-container")}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />

              <div className={cx("form")}>
                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Vị trí ứng tuyển(*)</label>
                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="VD: Frontend Developer"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Ngành nghề(*)</label>
                    <input
                      type="text"
                      name="industry"
                      placeholder="VD: Công nghệ thông tin"
                      value={formData.industry}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Cấp độ kinh nghiệm</label>
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

                  <div className={cx("inputGroup")}>
                    <label>Loại phỏng vấn</label>
                    <select
                      name="interviewType"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                    >
                      {interviewTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Kỹ năng cần đánh giá</label>
                    <input
                      type="text"
                      name="specificSkills"
                      placeholder="VD: React, TypeScript, Team work"
                      value={formData.specificSkills}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Ngôn ngữ</label>
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleInputChange}
                    >
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeTab === "practice" && (
                  <div className={cx("practice-section")}>
                    {!practiceSession.isActive ? (
                      <button
                        className={cx("button")}
                        onClick={startPracticeSession}
                      >
                        Bắt đầu phiên luyện tập
                      </button>
                    ) : (
                      <div className={cx("practice-content")}>
                        <div className={cx("question-card")}>
                          <h3>Câu hỏi:</h3>
                          <p>{practiceSession.currentQuestion}</p>
                        </div>

                        <div className={cx("recording-controls")}>
                          {!practiceSession.recording ? (
                            <button
                              className={cx("record-button")}
                              onClick={startRecording}
                            >
                              <FaPlay /> Bắt đầu ghi âm
                            </button>
                          ) : (
                            <button
                              className={cx("stop-button")}
                              onClick={stopRecording}
                            >
                              <FaStop /> Dừng ghi âm
                            </button>
                          )}
                        </div>

                        {practiceSession.audioUrl && (
                          <div className={cx("audio-player")}>
                            <audio controls src={practiceSession.audioUrl} />
                          </div>
                        )}

                        <div className={cx("answer-section")}>
                          <textarea
                            placeholder="Nhập câu trả lời của bạn..."
                            value={practiceSession.userAnswer}
                            onChange={(e) => setPracticeSession(prev => ({
                              ...prev,
                              userAnswer: e.target.value
                            }))}
                            rows="4"
                          />
                          <button
                            className={cx("button")}
                            onClick={() => generateInterviewContent("feedback")}
                            disabled={!practiceSession.userAnswer.trim()}
                          >
                            Nhận đánh giá
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "questions" && (
                  <button
                    className={cx("button")}
                    onClick={() => generateInterviewContent("questions")}
                    disabled={!formData.jobTitle || !formData.industry || loading}
                  >
                    {loading ? "Đang tạo câu hỏi..." : "Tạo câu hỏi phỏng vấn"}
                  </button>
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
                      {activeTab === "questions" ? "Câu hỏi phỏng vấn" : "Đánh giá câu trả lời"}
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

export default InterviewPrep; 