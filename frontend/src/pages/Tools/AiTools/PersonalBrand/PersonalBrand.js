// PersonalBrand page
import React, { useState, useContext } from 'react';
import classNames from 'classnames/bind';
import styles from './PersonalBrand.module.scss';
import { EventSourcePolyfill } from 'event-source-polyfill';
import ModalTypeContext from '~/context/ModalTypeContext';
import ModelAI from '~/components/ModelAI';
import {
  FaUserTie,
  FaLinkedin,
  FaGithub,
  FaMedium,
  FaTwitter,
  FaInstagram,
  FaCopy,
  FaCheck,
  FaChartLine,
  FaLightbulb,
  FaPencilAlt,
  FaTrophy,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const cx = classNames.bind(styles);

const PersonalBrand = () => {
  const { setModalType } = useContext(ModalTypeContext);
  const [model, setModel] = useState('');
  const [formData, setFormData] = useState({
    industry: '',
    expertise: '',
    experience: '',
    achievements: '',
    targetAudience: '',
    goals: '',
    uniqueValue: '',
    platforms: []
  });

  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState(null);
  const [brandStrategy, setBrandStrategy] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [completionStatus, setCompletionStatus] = useState('');

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: <FaLinkedin /> },
    { id: 'github', name: 'GitHub', icon: <FaGithub /> },
    { id: 'medium', name: 'Medium', icon: <FaMedium /> },
    { id: 'twitter', name: 'Twitter', icon: <FaTwitter /> },
    { id: 'instagram', name: 'Instagram', icon: <FaInstagram /> }
  ];

  const analytics = [
    { title: 'Độ nhận diện thương hiệu', value: '78%', trend: 'up' },
    { title: 'Tương tác trung bình', value: '25%', trend: 'up' },
    { title: 'Tỷ lệ phát triển', value: '12%', trend: 'down' },
    { title: 'Chỉ số ảnh hưởng', value: '856', trend: 'up' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const generateBrandStrategy = async () => {
    setLoading(true);
    setIsStreaming(true);
    setStreamError(null);
    setCompletionStatus('');
    setBrandStrategy('');

    const token = localStorage.getItem('token');
    if (!token) {
      setModalType('loginEmail');
      setLoading(false);
      setIsStreaming(false);
      return;
    }

    let eventSource;
    try {
      const prompt = `Bạn là một chuyên gia tư vấn thương hiệu cá nhân. Hãy phân tích và đề xuất chiến lược xây dựng thương hiệu cá nhân dựa trên thông tin sau:

      1. Thông tin cơ bản:
      - Ngành nghề: ${formData.industry}
      - Chuyên môn: ${formData.expertise}
      - Kinh nghiệm: ${formData.experience}
      - Thành tích: ${formData.achievements}

      2. Mục tiêu và đối tượng:
      - Đối tượng mục tiêu: ${formData.targetAudience}
      - Mục tiêu phát triển: ${formData.goals}
      - Giá trị độc đáo: ${formData.uniqueValue}
      - Nền tảng mục tiêu: ${formData.platforms.join(', ')}

      Hãy tạo một chiến lược toàn diện bao gồm:
      1. Phân tích SWOT về thương hiệu cá nhân hiện tại
      2. Đề xuất định vị thương hiệu cá nhân
      3. Chiến lược nội dung cho từng nền tảng đã chọn
      4. Kế hoạch phát triển thương hiệu trong 3-6-12 tháng
      5. Các KPI và cách đo lường thành công
      6. Đề xuất về quản lý và duy trì thương hiệu

      Hãy trình bày chi tiết và có ví dụ cụ thể cho từng phần.`;

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
          setBrandStrategy((prev) => prev + data);
        } catch (error) {
          console.error('Error parsing event data:', error);
          setStreamError('Lỗi khi xử lý dữ liệu nhận được');
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        if (eventSource.readyState === EventSourcePolyfill.CLOSED) {
          setIsStreaming(false);
          if (brandStrategy) {
            setCompletionStatus('Đã hoàn thành! Bạn có thể sao chép nội dung.');
          } else {
            setStreamError('Kết nối bị đóng trước khi nhận được nội dung');
          }
        }
        eventSource.close();
        setLoading(false);
      };

    } catch (error) {
      console.error('Error generating brand strategy:', error);
      setStreamError('Lỗi khi tạo chiến lược thương hiệu');
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
    if (brandStrategy) {
      navigator.clipboard.writeText(brandStrategy)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text:', err);
          const textArea = document.createElement('textarea');
          textArea.value = brandStrategy;
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
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('header')}>
          <h1 className={cx('title')}>
            <FaUserTie className={cx('icon')} />
            Phát triển Thương hiệu Cá nhân
          </h1>
          <p className={cx('description')}>
            Xây dựng và phát triển thương hiệu cá nhân chuyên nghiệp với sự hỗ trợ của AI
          </p>
        </div>

        <div className={cx('content-grid')}>
          <div className={cx('section')}>
            <h2 className={cx('section-title')}>
              <FaPencilAlt className={cx('icon')} />
              Thông tin cơ bản
            </h2>
            <div className={cx('form')}>
              <ModelAI selectedModel={model} setSelectedModel={setModel} />
              
              <div className={cx('input-group')}>
                <label>Ngành nghề</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="VD: Công nghệ thông tin, Marketing,..."
                  value={formData.industry}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Chuyên môn</label>
                <input
                  type="text"
                  name="expertise"
                  placeholder="VD: Phát triển web, Digital Marketing,..."
                  value={formData.expertise}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Kinh nghiệm</label>
                <textarea
                  name="experience"
                  placeholder="Mô tả kinh nghiệm làm việc của bạn"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Thành tích nổi bật</label>
                <textarea
                  name="achievements"
                  placeholder="Liệt kê các thành tích, chứng chỉ, giải thưởng..."
                  value={formData.achievements}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className={cx('section')}>
            <h2 className={cx('section-title')}>
              <FaTrophy className={cx('icon')} />
              Mục tiêu & Định vị
            </h2>
            <div className={cx('form')}>
              <div className={cx('input-group')}>
                <label>Đối tượng mục tiêu</label>
                <input
                  type="text"
                  name="targetAudience"
                  placeholder="VD: Nhà tuyển dụng, Khách hàng tiềm năng,..."
                  value={formData.targetAudience}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Mục tiêu phát triển</label>
                <textarea
                  name="goals"
                  placeholder="Mục tiêu phát triển thương hiệu cá nhân của bạn"
                  value={formData.goals}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Giá trị độc đáo</label>
                <textarea
                  name="uniqueValue"
                  placeholder="Điểm khác biệt của bạn so với những người khác"
                  value={formData.uniqueValue}
                  onChange={handleInputChange}
                />
              </div>

              <div className={cx('input-group')}>
                <label>Nền tảng mục tiêu</label>
                <div className={cx('platform-list')}>
                  {platforms.map(platform => (
                    <div
                      key={platform.id}
                      className={cx('platform-item', {
                        selected: formData.platforms.includes(platform.id)
                      })}
                      onClick={() => handlePlatformToggle(platform.id)}
                    >
                      <div className={cx('platform-icon')}>{platform.icon}</div>
                      <div className={cx('platform-name')}>{platform.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className={cx('button')}
                onClick={generateBrandStrategy}
                disabled={loading}
              >
                {loading ? 'Đang tạo chiến lược...' : 'Tạo chiến lược'}
              </button>
            </div>
          </div>

          {brandStrategy && (
            <div className={cx('section')} style={{ gridColumn: '1 / -1' }}>
              <div className={cx('result-container')}>
                <div className={cx('result-header')}>
                  <h3>Chiến lược Thương hiệu Cá nhân</h3>
                  <div className={cx('header-actions')}>
                    {isStreaming ? (
                      <span className={cx('streaming-indicator')}>
                        Đang tạo nội dung...
                      </span>
                    ) : completionStatus ? (
                      <span className={cx('completion-status')}>
                        {completionStatus}
                      </span>
                    ) : null}
                    <button
                      className={cx('button')}
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
                <div className={cx('result-content')}>
                  {brandStrategy.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>

              <div className={cx('analytics-section')}>
                <h2 className={cx('section-title')}>
                  <FaChartLine className={cx('icon')} />
                  Phân tích Hiệu quả
                </h2>
                <div className={cx('analytics-grid')}>
                  {analytics.map((metric, index) => (
                    <div key={index} className={cx('analytics-card')}>
                      <div className={cx('metric-title')}>{metric.title}</div>
                      <div className={cx('metric-value')}>
                        {metric.value}
                        {metric.trend === 'up' ? (
                          <FaArrowUp className={cx('trend-up')} />
                        ) : (
                          <FaArrowDown className={cx('trend-down')} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cx('content-suggestions')}>
                <h2 className={cx('section-title')}>
                  <FaLightbulb className={cx('icon')} />
                  Gợi ý Nội dung
                </h2>
                <div className={cx('suggestion-item')}>
                  <h3 className={cx('suggestion-title')}>Bài viết chuyên môn</h3>
                  <p className={cx('suggestion-description')}>
                    Chia sẻ kinh nghiệm và kiến thức chuyên môn của bạn qua các bài viết có giá trị
                  </p>
                </div>
                <div className={cx('suggestion-item')}>
                  <h3 className={cx('suggestion-title')}>Case Study</h3>
                  <p className={cx('suggestion-description')}>
                    Phân tích và chia sẻ các dự án thành công bạn đã thực hiện
                  </p>
                </div>
                <div className={cx('suggestion-item')}>
                  <h3 className={cx('suggestion-title')}>Video Tutorial</h3>
                  <p className={cx('suggestion-description')}>
                    Tạo các video hướng dẫn ngắn về các kỹ năng trong lĩnh vực của bạn
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
    );
};

export default PersonalBrand;


