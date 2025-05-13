import React, { useState, useEffect, useContext } from "react";
import classNames from "classnames/bind";
import styles from "./CreateEmail.module.scss";
import { EventSourcePolyfill } from "event-source-polyfill";
import ResultPrompt from "~/components/ResultPrompt";
import ModalTypeContext from "~/context/ModalTypeContext";
import ModelAI from "~/components/ModelAI";
import useAgeServices from "~/services/useAgeServices";
import Content from "~/components/Modal/Content";
import { FaEnvelope, FaCopy, FaCheck } from "react-icons/fa";

const cx = classNames.bind(styles);

const CreateEmail = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [formData, setFormData] = useState({
    emailType: "business", // business, formal, informal
    recipient: "",
    recipientRole: "",
    sender: "",
    senderRole: "",
    subject: "",
    purpose: "",
    tone: "professional", // professional, friendly, casual
    additionalInfo: "",
    language: "vietnamese" // vietnamese, english
  });
  const [model, setModel] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [completionStatus, setCompletionStatus] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentPath = window.location.pathname;

  const emailTypes = [
    { value: "business", label: "Email Doanh nghiệp" },
    { value: "formal", label: "Email Trang trọng" },
    { value: "informal", label: "Email Thân mật" }
  ];

  const tones = [
    { value: "professional", label: "Chuyên nghiệp" },
    { value: "friendly", label: "Thân thiện" },
    { value: "casual", label: "Thoải mái" }
  ];

  const languages = [
    { value: "vietnamese", label: "Tiếng Việt" },
    { value: "english", label: "Tiếng Anh" }
  ];

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateForm = () => {
    const requiredFields = ['recipient', 'subject', 'purpose'];
    setIsFormValid(requiredFields.every(field => formData[field].trim()));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allCategories = await useAgeServices.getAllCategories();
        const seoTemplates = allCategories.categories.filter(
          (template) => template.type === "green"
        );
        setTemplates(seoTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateEmail = async () => {
    setLoading(true);
    setIsStreaming(true);
    setStreamError(null);
    setCompletionStatus('');
    setEmailContent("");
    
    const token = localStorage.getItem("token");
    if (!token) {
        setModalType("loginEmail");
        setLoading(false);
        setIsStreaming(false);
        return;
    }

    let eventSource;
    try {
      const prompt = `Bạn là một chuyên gia trong lĩnh vực viết email chuyên nghiệp. Hãy tạo một email ${formData.emailType === 'business' ? 'doanh nghiệp' : 
        formData.emailType === 'formal' ? 'trang trọng' : 'thân mật'} bằng ${
        formData.language === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'
      }.

      Yêu cầu chi tiết:
      1. Cấu trúc email:
         - Lời chào phù hợp với mối quan hệ và vị trí của người nhận
         - Phần mở đầu giới thiệu ngắn gọn về mục đích email
         - Nội dung chính được chia thành các đoạn rõ ràng
         - Kết thúc với lời cảm ơn và ký tên phù hợp

      2. Thông tin cần có:
         - Người nhận: ${formData.recipient}${formData.recipientRole ? ` (${formData.recipientRole})` : ''}
         - Người gửi: ${formData.sender}${formData.senderRole ? ` (${formData.senderRole})` : ''}
         - Chủ đề: ${formData.subject}
         - Mục đích chính: ${formData.purpose}
         - Giọng điệu: ${formData.tone === 'professional' ? 'chuyên nghiệp, lịch sự' : 
           formData.tone === 'friendly' ? 'thân thiện, gần gũi' : 'thoải mái, tự nhiên'}
         ${formData.additionalInfo ? `- Thông tin bổ sung: ${formData.additionalInfo}` : ''}

      3. Yêu cầu về nội dung:
         - Sử dụng ngôn ngữ ${formData.language === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'} chuẩn mực
         - Các câu văn rõ ràng, mạch lạc
         - Có các từ ngữ chuyên nghiệp phù hợp với ngữ cảnh
         - Đảm bảo tính lịch sự và tôn trọng
         - Thể hiện sự chuyên nghiệp trong cách trình bày

      4. Định dạng:
         - Sử dụng các đoạn văn ngắn gọn, dễ đọc
         - Có khoảng cách phù hợp giữa các đoạn
         - Các ý chính được nhấn mạnh một cách tinh tế
         - Kết thúc email với thông tin liên hệ đầy đủ

      Hãy tạo một email hoàn chỉnh, chuyên nghiệp và phù hợp với tất cả các yêu cầu trên.`;
        
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
          setEmailContent((prev) => prev + data);
            } catch (error) {
                console.error('Error parsing event data:', error);
                setStreamError('Lỗi khi xử lý dữ liệu nhận được');
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
                setIsStreaming(false);
          if (emailContent) {
                    setCompletionStatus('Đã hoàn thành! Bạn có thể sao chép nội dung.');
                } else {
                    setStreamError('Kết nối bị đóng trước khi nhận được nội dung');
                }
            }
            eventSource.close();
            setLoading(false);
        };

    } catch (error) {
      console.error('Error creating email:', error);
      setStreamError('Lỗi khi tạo email');
        setLoading(false);
        setIsStreaming(false);
    }

    return () => {
        if (eventSource) {
            eventSource.close();
        }
    };
  };

  const handleCardClick = (slug) => {
    window.location.href = `/templates/custom/${slug}`;
  };

  const handleCopyContent = () => {
    if (emailContent) {
      navigator.clipboard.writeText(emailContent)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
          const textArea = document.createElement('textarea');
          textArea.value = emailContent;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
          } catch (err) {
            console.error('Fallback copy failed:', err);
          }
          document.body.removeChild(textArea);
        });
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("container")}>
        <div className={cx("content")}>
          <div className={cx("main-content")}>
            <div className={cx("form-container")}>
              <h2>
                <FaEnvelope className={cx("icon")} />
                Tạo Email Chuyên Nghiệp
              </h2>
              <p className={cx("description")}>
                Tạo email chuyên nghiệp với sự hỗ trợ của AI. Điền đầy đủ thông tin và chọn các tùy chọn phù hợp để tạo email hoàn hảo.
              </p>

              <div className={cx("form")}>
                <ModelAI selectedModel={model} setSelectedModel={setModel} />
                
                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Loại Email</label>
                    <select name="emailType" value={formData.emailType} onChange={handleInputChange}>
                      {emailTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Ngôn ngữ</label>
                    <select name="language" value={formData.language} onChange={handleInputChange}>
                      {languages.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Người nhận(*)</label>
                    <input
                      type="text"
                      name="recipient"
                      placeholder="Tên người nhận"
                      value={formData.recipient}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className={cx("inputGroup")}>
                    <label>Chức vụ người nhận</label>
                    <input
                      type="text"
                      name="recipientRole"
                      placeholder="VD: Giám đốc nhân sự"
                      value={formData.recipientRole}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("form-row")}>
                  <div className={cx("inputGroup")}>
                    <label>Người gửi</label>
                    <input
                      type="text"
                      name="sender"
                      placeholder="Tên người gửi"
                      value={formData.sender}
                      onChange={handleInputChange}
                    />
                  </div>

                <div className={cx("inputGroup")}>
                    <label>Chức vụ người gửi</label>
                  <input
                    type="text"
                      name="senderRole"
                      placeholder="VD: Ứng viên"
                      value={formData.senderRole}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className={cx("inputGroup")}>
                  <label>Chủ đề(*)</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Tiêu đề email"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className={cx("inputGroup")}>
                  <label>Mục đích(*)</label>
                  <textarea
                    name="purpose"
                    placeholder="Mục đích của email (VD: Xin việc, Cảm ơn, Xin lỗi,...)"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <div className={cx("inputGroup")}>
                  <label>Giọng điệu</label>
                  <select name="tone" value={formData.tone} onChange={handleInputChange}>
                    {tones.map(tone => (
                      <option key={tone.value} value={tone.value}>{tone.label}</option>
                    ))}
                  </select>
                </div>

                <div className={cx("inputGroup")}>
                  <label>Thông tin thêm</label>
                  <textarea
                    name="additionalInfo"
                    placeholder="Thông tin bổ sung (nếu có)"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>

                <button
                  className={cx("button")}
                  onClick={handleCreateEmail}
                  disabled={!isFormValid || loading}
                >
                  {loading ? "Đang tạo email..." : "Tạo Email"}
                </button>
              </div>

              {streamError && (
                <div className={cx("error-message")}>
                  {streamError}
                </div>
              )}

              {emailContent && (
                <div className={cx("result-container")}>
                  <div className={cx("result-header")}>
                    <h3>Email đã tạo</h3>
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
                    {emailContent.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className={cx("sidebar")}>
            <h3 className={cx("sidebar-title")}>SEO Templates</h3>
            {isLoading ? (
              <div className={cx("loading")}>Đang tải...</div>
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={cx("menu-item", {
                    'current': `/templates/custom/${template.slug}` === currentPath
                  })}
                  onClick={() => handleCardClick(template.slug)}
                >
                  <i className={template.icon}></i>
                  <span>{template.title}</span>
                </div>
              ))
            ) : (
              <div className={cx("no-templates")}>
                Không tìm thấy templates
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CreateEmail;
