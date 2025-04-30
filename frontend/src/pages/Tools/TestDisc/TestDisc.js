// Test Disc

import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./TestDisc.module.scss";
import Background3D from "~/components/Background3D/Background3D";
import images from "~/assets/images";
import useScrollTop from '~/hooks/useScrollTop';

const cx = classNames.bind(styles);

function TestDisc() {
  const [currentStep, setCurrentStep] = useState("intro"); // intro, test, result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
    most: null,
    least: null,
  });
  const [allAnswers, setAllAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 phút tính bằng giây
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []); // Empty dependency array means this runs once when component mounts
  const dataquestion = [
    {
      id: 1,
      options: [
        {
          id: "1A",
          text: "Dễ tin, nhiệt tình",
          type: "I",
        },
        {
          id: "1B",
          text: "Khoan dung, lễ phép",
          type: "S",
        },
        {
          id: "1C",
          text: "Can đảm, thích mạo hiểm",
          type: "D",
        },
        {
          id: "1D",
          text: "Dễ chịu, dễ thỏa hiệp",
          type: "C",
        },
      ],
    },
    {
      id: 2,
      options: [
        {
          id: "2A",
          text: "Sáng tạo, có tầm nhìn",
          type: "D",
        },
        {
          id: "2B",
          text: "Kín đáo, ít nói",
          type: "C",
        },
        {
          id: "2C",
          text: "Hòa đồng, ăn ý",
          type: "I",
        },
        {
          id: "2D",
          text: "Người hòa giải, người đàm phán",
          type: "S",
        },
      ],
    },
    {
      id: 3,
      options: [
        {
          id: "3A",
          text: "Rõ ràng, chính xác",
          type: "C",
        },
        {
          id: "3B",
          text: "Tập trung, hướng mục tiêu",
          type: "D",
        },
        {
          id: "3C",
          text: "Làm việc nhóm, thỏa hiệp",
          type: "S",
        },
        {
          id: "3D",
          text: "Động viên/khuyến khích người khác",
          type: "I",
        },
      ],
    },
    {
      id: 4,
      options: [
        {
          id: "4A",
          text: "Nhạy cảm, dễ kích động",
          type: "S",
        },
        {
          id: "4B",
          text: "Đối đầu, thẳng thắn",
          type: "D",
        },
        {
          id: "4C",
          text: "Tự mãn, kín tiếng",
          type: "C",
        },
        {
          id: "4D",
          text: "Thể hiện quan điểm, muốn được nghe",
          type: "I",
        },
      ],
    },
    // {
    //   id: 5,
    //   options: [
    //     {
    //       id: "5A",
    //       text: "Tìm kiếm sự cân bằng, bình tĩnh",
    //       type: "S",
    //     },
    //     {
    //       id: "5B",
    //       text: "Nói nhiều, có sức lôi cuốn",
    //       type: "I",
    //     },
    //     {
    //       id: "5C",
    //       text: "Tuân thủ, theo quy định",
    //       type: "C",
    //     },
    //     {
    //       id: "5D",
    //       text: "Nhanh chóng, tinh thần cao",
    //       type: "D",
    //     },
    //   ],
    // },
    // {
    //   id: 6,
    //   options: [
    //     {
    //       id: "6A",
    //       text: "Có hệ thống, quản lý thời gian",
    //       type: "C",
    //     },
    //     {
    //       id: "6B",
    //       text: "Lo lắng, vội vã",
    //       type: "D",
    //     },
    //     {
    //       id: "6C",
    //       text: "Đáng tin cậy, bền bỉ",
    //       type: "S",
    //     },
    //     {
    //       id: "6D",
    //       text: "Dễ xúc động, bốc đồng",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 7,
    //   options: [
    //     {
    //       id: "7A",
    //       text: "Tách rời, quá cẩn thận",
    //       type: "C",
    //     },
    //     {
    //       id: "7B",
    //       text: "Không thực tế, quá tận tâm",
    //       type: "I",
    //     },
    //     {
    //       id: "7C",
    //       text: "Tự mãn, chống lại sự thay đổi",
    //       type: "S",
    //     },
    //     {
    //       id: "7D",
    //       text: "Lỗ mãn, hống hách",
    //       type: "D",
    //     },
    //   ],
    // },
    // {
    //   id: 8,
    //   options: [
    //     {
    //       id: "8A",
    //       text: "Người phân tích tốt",
    //       type: "C",
    //     },
    //     {
    //       id: "8B",
    //       text: "Người lắng nghe tốt",
    //       type: "S",
    //     },
    //     {
    //       id: "8C",
    //       text: "Người động viên tốt",
    //       type: "I",
    //     },
    //     {
    //       id: "8D",
    //       text: "Người giao việc tốt",
    //       type: "D",
    //     },
    //   ],
    // },
    // {
    //   id: 9,
    //   options: [
    //     {
    //       id: "9A",
    //       text: "Hối thúc, điều khiển",
    //       type: "D",
    //     },
    //     {
    //       id: "9B",
    //       text: "Lạc quan, có sức lôi cuốn",
    //       type: "I",
    //     },
    //     {
    //       id: "9C",
    //       text: "Có tinh thần cộng tác, cùng nhau làm",
    //       type: "S",
    //     },
    //     {
    //       id: "9D",
    //       text: "Chính xác",
    //       type: "C",
    //     },
    //   ],
    // },
    // {
    //   id: 10,
    //   options: [
    //     {
    //       id: "10A",
    //       text: "Sẽ chờ đợi để mua hàng, kiên nhẫn",
    //       type: "S",
    //     },
    //     {
    //       id: "10B",
    //       text: "Sẽ kiên quyết mua, quyết đoán",
    //       type: "D",
    //     },
    //     {
    //       id: "10C",
    //       text: "Sẽ mua những gì cần, ích kỷ",
    //       type: "C",
    //     },
    //     {
    //       id: "10D",
    //       text: "Sẽ bất chấp, tự kiểm soát",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 11,
    //   options: [
    //     {
    //       id: "11A",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "11B",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //     {
    //       id: "11C",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "11D",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 12,
    //   options: [
    //     {
    //       id: "12A",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "12B",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "12C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "12D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 13,
    //   options: [
    //     {
    //       id: "13A",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "13B",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "13C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "13D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 14,
    //   options: [
    //     {
    //       id: "14A",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "14B",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "14C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "14D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 15,
    //   options: [
    //     {
    //       id: "15A",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "15B",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "15C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "15D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 16,
    //   options: [
    //     {
    //       id: "16A",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "16B",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "16C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "16D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 17,
    //   options: [
    //     {
    //       id: "17A",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "17B",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "17C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "17D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 18,
    //   options: [
    //     {
    //       id: "18A",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "18B",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "18C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "18D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 19,
    //   options: [
    //     {
    //       id: "19A",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "19B",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "19C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "19D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 20,
    //   options: [
    //     {
    //       id: "20A",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "20B",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "20C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "20D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 21,
    //   options: [
    //     {
    //       id: "21A",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "21B",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "21C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "21D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 22,
    //   options: [
    //     {
    //       id: "22A",
    //       text: "Tính toán, quá tải vì những chi tiết",
    //       type: "C",
    //     },
    //     {
    //       id: "22B",
    //       text: "Bốc đồng, dễ xúc động",
    //       type: "I",
    //     },
    //     {
    //       id: "22C",
    //       text: "Đòi hỏi cao, kiểm soát",
    //       type: "D",
    //     },
    //     {
    //       id: "22D",
    //       text: "Không thích đối đầu, có thể dự đoán trước",
    //       type: "S",
    //     },
    //   ],
    // },
    // {
    //   id: 23,
    //   options: [
    //     {
    //       id: "23A",
    //       text: "Thân thiện, tử tế",
    //       type: "S",
    //     },
    //     {
    //       id: "23B",
    //       text: "Tìm kiếm sự thay đổi, chiến đấu",
    //       type: "D",
    //     },
    //     {
    //       id: "23C",
    //       text: "Cứng nhắc, muốn mọi thứ chính xác",
    //       type: "C",
    //     },
    //     {
    //       id: "23D",
    //       text: "Tránh đơn điệu, chán công việc lặp lại",
    //       type: "I",
    //     },
    //   ],
    // },
    // {
    //   id: 24,
    //   options: [
    //     {
    //       id: "24A",
    //       text: "Sáng tạo, độc đáo",
    //       type: "I",
    //     },
    //     {
    //       id: "24B",
    //       text: "Luôn hướng kết quả, lợi nhuận",
    //       type: "D",
    //     },
    //     {
    //       id: "24C",
    //       text: "Đáng tin cậy, xác thực",
    //       type: "S",
    //     },
    //     {
    //       id: "24D",
    //       text: "Tiêu chuẩn cao, dựa vào các chuẩn mực",
    //       type: "C",
    //     },
    //   ],
    // },
  ];

  const handleAnswer = (type, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [type]: optionId,
    }));
  };

  const handleNextQuestion = () => {
    if (answers.most && answers.least) {
      setAllAnswers(prev => [...prev, {
        questionId: currentQuestion + 1,
        most: answers.most,
        least: answers.least
      }]);

      if (currentQuestion === dataquestion.length - 1) {
        calculateResult();
      } else {
        setCurrentQuestion(prev => prev + 1);
        setAnswers({ most: null, least: null });
      }
    }
  };

  const calculateResult = () => {
    let scores = {
      D: { most: 0, least: 0 },
      I: { most: 0, least: 0 },
      S: { most: 0, least: 0 },
      C: { most: 0, least: 0 }
    };

    allAnswers.forEach(answer => {
      const mostOption = dataquestion[answer.questionId - 1].options.find(opt => opt.id === answer.most);
      const leastOption = dataquestion[answer.questionId - 1].options.find(opt => opt.id === answer.least);

      scores[mostOption.type].most += 1;
      scores[leastOption.type].least += 1;
    });

    const finalScores = {
      D: scores.D.most - scores.D.least,
      I: scores.I.most - scores.I.least,
      S: scores.S.most - scores.S.least,
      C: scores.C.most - scores.C.least
    };

    const sortedTypes = Object.entries(finalScores)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type);

    const primaryType = sortedTypes[0];
    const secondaryType = sortedTypes[1];

    setResult({
      scores: finalScores,
      primaryType,
      secondaryType,
      details: {
        D: scores.D,
        I: scores.I,
        S: scores.S,
        C: scores.C
      }
    });

    setCurrentStep("result");
  };

  // Thêm useEffect để xử lý đếm ngược
  useEffect(() => {
    if (currentStep === "test") {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            calculateResult(); // Tự động nộp bài khi hết giờ
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep]);

  useScrollTop(); // Sử dụng custom hook

  // Hàm format thời gian
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderTest = () => (
    // sử dụng useScrollTop();
    
    <div className={cx("test-section")}>
      <div className={cx("timer")}>
        <div className={cx("timer-content", { warning: timeLeft <= 60 })}>
          <i className="fas fa-clock"></i>
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>
      <div className={cx("progress-bar")}>
        <div 
          className={cx("progress")} 
          style={{width: `${((currentQuestion + 1) / dataquestion.length) * 100}%`}}
        />
        <span className={cx("progress-text")}>
          {currentQuestion + 1}/{dataquestion.length}
        </span>
      </div>

      <div className={cx("question-card")}>
        <div className={cx("card-header")}>
          <div className={cx("question-number")}>
            <span className={cx("current")}>#{currentQuestion + 1}</span>
            <span className={cx("total")}>/ {dataquestion.length}</span>
          </div>
          <h2>Chọn đặc điểm phù hợp nhất (MOST) và ít phù hợp nhất (LEAST) với bạn</h2>
        </div>

        <div className={cx("options-container")}>
          <div className={cx("options-header")}>
            <div className={cx("trait-col")}>Đặc điểm</div>
            <div className={cx("choice-cols")}>
              <div className={cx("most-col")}>
                <span className={cx("choice-label")}>MOST</span>
                <div className={cx("choice-desc")}>Phù hợp nhất</div>
              </div>
              <div className={cx("least-col")}>
                <span className={cx("choice-label")}>LEAST</span>
                <div className={cx("choice-desc")}>Ít phù hợp nhất</div>
              </div>
            </div>
          </div>

          <div className={cx("options-list")}>
            {dataquestion[currentQuestion].options.map((option) => (
              <div key={option.id} className={cx("option-item")}>
                <div className={cx("trait-text")}>{option.text}</div>
                <div className={cx("choice-buttons")}>
                  <label className={cx("radio-button", "most", {
                    selected: answers.most === option.id
                  })}>
                    <input
                      type="radio"
                      name="most"
                      checked={answers.most === option.id}
                      onChange={() => handleAnswer("most", option.id)}
                    />
                    <span className={cx("radio-circle")}></span>
                  </label>
                  <label className={cx("radio-button", "least", {
                    selected: answers.least === option.id
                  })}>
                    <input
                      type="radio"
                      name="least"
                      checked={answers.least === option.id}
                      onChange={() => handleAnswer("least", option.id)}
                    />
                    <span className={cx("radio-circle")}></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cx("card-footer")}>
          <button
            className={cx("next-button", { active: answers.most && answers.least })}
            disabled={!answers.most || !answers.least}
            onClick={handleNextQuestion}
          >
            {currentQuestion === dataquestion.length - 1 ? (
              <>
                <span>Xem kết quả</span>
                <i className="fas fa-chart-bar"></i>
              </>
            ) : (
              <>
                <span>Câu tiếp theo</span>
                <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const discTypes = [
    {
      type: "D",
      title: "Nhóm người thủ lĩnh (Dominance)",
      description:
        "Những người nằm ở nhóm này quan trọng kết quả hoàn thành, họ luôn tự tin và có động lực cạnh tranh để chiến thắng hoặc đạt được kết quả.",
      icon: <i className="fas fa-crown"></i>,
      color: "#4CAF50",
    },
    {
      type: "I",
      title: "Nhóm người Tạo ảnh hưởng (Influence)",
      description:
        "Người thuộc nhóm này chú trọng việc tạo ra ảnh hưởng hoặc thuyết phục người khác bằng sự giao tiếp và các mối quan hệ.",
      icon: <i className="fas fa-users"></i>,
      color: "#FF5722",
    },
    {
      type: "S",
      title: "Nhóm người Kiên định (Steadiness)",
      description:
        "Những người thuộc nhóm này thường chú trọng việc tạo môi trường làm việc ổn định, hợp tác và đáng tin cậy.",
      icon: <i className="fas fa-handshake"></i>,
      color: "#2196F3",
    },
    {
      type: "C",
      title: "Nhóm người Tuân thủ (Compliance)",
      description:
        "Những người thuộc nhóm Tuân thủ hay thường chú trọng vào chuẩn mực và chính xác, chuyên môn, đảng lực và thường tìm hiểu kỹ.",
      icon: <i className="fas fa-check-circle"></i>,
      color: "#FFC107",
    },
  ];

  const renderIntro = () => (
    <div className={cx("intro-section")}>
      <div className={cx("intro-content")}>
        <div className={cx("header")}>
          <div className={cx("header-icon")}>
            <i className="fas fa-brain"></i>
          </div>
          <h1>Bài trắc nghiệm tính cách DISC</h1>
          <p>
            Bạn là mẫu người nào? Phương cách làm việc của bạn là gì? Những nhóm
            tính cách DISC nào sẽ "hợp" với bạn nhất?
          </p>
        </div>

        <div className={cx("banner-section")}>
          <div className={cx("banner-content")}>
            <div className={cx("banner-text")}>
              <h2>Khám phá tính cách của bạn</h2>
              <p>
                DISC là một công cụ đánh giá hành vi được sử dụng để cải thiện
                năng suất làm việc, tinh thần đồng đội và giao tiếp.
              </p>
              <button
                className={cx("start-button")}
                onClick={() => setCurrentStep("test")}
              >
                <i className="fas fa-play"></i>
                Làm bài test ngay
              </button>
            </div>
            <div className={cx("banner-image")}>
              <img src={images.test_disc} alt="DISC Test" />
            </div>
          </div>
        </div>

        <div className={cx("info-section")}>
          <div className={cx("info-card")}>
            <div className={cx("info-icon")}>
              <i className="fas fa-clock"></i>
            </div>
            <div className={cx("info-content")}>
              <h4>Thời gian làm bài</h4>
              <p>10-15 phút</p>
            </div>
          </div>

          <div className={cx("info-card")}>
            <div className={cx("info-icon")}>
              <i className="fas fa-question-circle"></i>
            </div>
            <div className={cx("info-content")}>
              <h4>Số câu hỏi</h4>
              <p>24 câu hỏi</p>
            </div>
          </div>

          <div className={cx("info-card")}>
            <div className={cx("info-icon")}>
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className={cx("info-content")}>
              <h4>Kết quả</h4>
              <p>Chi tiết & chính xác</p>
            </div>
          </div>
        </div>

        <div className={cx("disc-types")}>
          <h2>4 nhóm tính cách DISC</h2>
          <p className={cx("disc-intro")}>
            DISC dựa trên 4 tiêu chí chính là 4 cặp phạm trù xoay quanh thế giới
            quan của con người, dùng để đánh giá và phân tích tính cách của con
            người.
          </p>
          {discTypes.map((type) => (
            <div
              className={cx("disc-card")}
              key={type.type}
              style={{ "--card-color": type.color }}
            >
              <div className={cx("disc-icon")}>{type.icon}</div>
              <h3>{type.title}</h3>
              <p>{type.description}</p>
            </div>
          ))}
        </div>

        <div className={cx("disc-info-section")}>
          <div className={cx("info-block")}>
            <h2>Trắc nghiệm DISC là gì?</h2>
            <p>
              DISC là từ viết tắt chỉ 4 nhóm tính cách đó là: Dominance (thống
              trị) – Influence (ảnh hưởng) – Steadiness (kiên định) – Compliance
              (tuân thủ).
            </p>
            <p>
              Trắc nghiệm DISC là bài trắc nghiệm giúp đánh giá hành vi và tính
              cách hoạt động dựa trên lý thuyết DISC của nhà tâm lý học William
              Moulton Marston, được tiến hành trong khoảng thời gian từ 5 đến 10
              phút.
            </p>
          </div>

          <div className={cx("info-grid")}>
            <div className={cx("info-card")}>
              <div className={cx("card-icon")}>
                <i className="fas fa-user-check"></i>
              </div>
              <h3>Đối với cá nhân</h3>
              <ul>
                <li>Nâng cao nhận thức về bản thân và năng lực</li>
                <li>Hiểu được điều gì tạo động lực cho bạn</li>
                <li>Biết cách phản ứng với mâu thuẫn</li>
                <li>Phát triển kỹ năng giao tiếp</li>
              </ul>
            </div>

            <div className={cx("info-card")}>
              <div className={cx("card-icon")}>
                <i className="fas fa-users-cog"></i>
              </div>
              <h3>Đối với nhà tuyển dụng</h3>
              <ul>
                <li>Đánh giá chính xác tính cách ứng viên</li>
                <li>Dự đoán khả năng thích ứng</li>
                <li>Xây dựng môi trường làm việc phù hợp</li>
                <li>Tối ưu hóa việc phân công công việc</li>
              </ul>
            </div>
          </div>

          <div className={cx("notice-section")}>
            <h3>Lưu ý khi làm bài test</h3>
            <div className={cx("notice-grid")}>
              <div className={cx("notice-item")}>
                <i className="fas fa-clock"></i>
                <p>Dành đủ thời gian để đọc và trả lời</p>
              </div>
              <div className={cx("notice-item")}>
                <i className="fas fa-heart"></i>
                <p>Trả lời trung thực, khách quan</p>
              </div>
              <div className={cx("notice-item")}>
                <i className="fas fa-redo"></i>
                <p>Chỉ làm 1 bài test mỗi ngày</p>
              </div>
              <div className={cx("notice-item")}>
                <i className="fas fa-user-shield"></i>
                <p>Độ tuổi trên 20 cho kết quả chính xác hơn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className={cx('result-section')}>
      <div className={cx('result-header')}>
        <h2>Kết quả trắc nghiệm DISC của bạn</h2>
        <p>Dựa trên câu trả lời của bạn, chúng tôi xác định được:</p>
      </div>

      <div className={cx('result-main')}>
        <div className={cx('result-type')}>
          <h3>Nhóm tính cách chính</h3>
          <div className={cx('type-card', result.primaryType.toLowerCase())}>
            <div className={cx('type-icon')}>
              {discTypes.find(t => t.type === result.primaryType).icon}
            </div>
            <div className={cx('type-content')}>
              <h4>{discTypes.find(t => t.type === result.primaryType).title}</h4>
              <p>{discTypes.find(t => t.type === result.primaryType).description}</p>
            </div>
          </div>
        </div>

        <div className={cx('result-chart')}>
          <h3>Biểu đồ DISC của bạn</h3>
          <div className={cx('chart-bars')}>
            {Object.entries(result.scores).map(([type, score]) => (
              <div key={type} className={cx('bar-group')}>
                <div className={cx('bar-label')}>{type}</div>
                <div className={cx('bar-wrapper')}>
                  <div 
                    className={cx('bar-fill')} 
                    style={{height: `${(score + 6) * 8}%`}}
                  />
                </div>
                <div className={cx('bar-value')}>{score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={cx('result-details')}>
          <h3>Chi tiết điểm số</h3>
          <div className={cx('details-grid')}>
            {Object.entries(result.details).map(([type, {most, least}]) => (
              <div key={type} className={cx('detail-card')}>
                <h4>{type}</h4>
                <div className={cx('detail-scores')}>
                  <div>Most: {most}</div>
                  <div>Least: {least}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cx('result-actions')}>
        <button onClick={() => window.print()} className={cx('print-button')}>
          <i className="fas fa-print"></i>
          In kết quả
        </button>
        <button onClick={() => {
          setCurrentStep("intro");
          setAllAnswers([]);
          setResult(null);
          setCurrentQuestion(0);
        }} className={cx('restart-button')}>
          <i className="fas fa-redo"></i>
          Làm lại bài test
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Background3D />
      <div className={cx("wrapper")}>
        <div className={cx("container")}>
          {currentStep === "intro" && renderIntro()}
          {currentStep === "test" && renderTest()}
          {currentStep === "result" && renderResult()}
        </div>
      </div>
    </>
  );
}

export default TestDisc;
