// page cvCOnsulting

import React, { useState } from "react";
import classNames from "classnames/bind";
import styles from "./CvConsulting.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaRobot, FaUserTie, FaFileAlt, FaCheckCircle, FaMagic, FaLock } from "react-icons/fa";
import { MdCompareArrows, MdNavigateNext } from "react-icons/md";

const cx = classNames.bind(styles);

const CvConsulting = () => {
    const navigate = useNavigate();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Mock user plan - in a real app, this would come from user context/API
    const userPlan = "Basic"; // Basic, Pro, ProMax
    
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // File validation
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                alert("Chỉ chấp nhận file PDF, DOC, DOCX");
                return;
            }
            
            // Size validation (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert("File không được vượt quá 5MB");
                return;
            }
            
            setUploadedFile(file);
            setShowModal(true);
        }
    };
    
    const handleSubmit = () => {
        if (uploadedFile && selectedPlan) {
            // Process submission - this would be connected to backend in a real app
            console.log("Submitting file:", uploadedFile);
            console.log("Selected plan:", selectedPlan);
            // Show success message or redirect
            alert("CV đã được gửi thành công! Chuyên gia sẽ liên hệ trong vòng 24 giờ.");
            setShowModal(false);
            setUploadedFile(null);
            setSelectedPlan(null);
        } else {
            alert("Vui lòng chọn gói dịch vụ");
        }
    };
    
    const consultingPlans = [
        {
            id: 'basic',
            name: 'Cơ bản',
            price: '199.000đ',
            description: 'Đánh giá CV bởi AI',
            features: [
                'Phân tích CV tự động bởi AI',
                'Đề xuất cải thiện cấu trúc',
                'Chỉnh sửa lỗi chính tả',
                'Báo cáo điểm mạnh, điểm yếu'
            ],
            unavailable: [],
            available: true,
            bestValue: false
        },
        {
            id: 'pro',
            name: 'Chuyên nghiệp',
            price: '399.000đ',
            description: 'Đánh giá CV bởi Chuyên gia',
            features: [
                'Tất cả tính năng của gói Cơ bản',
                'Đánh giá bởi chuyên gia nghề nghiệp',
                'Tư vấn riêng trong 30 phút',
                'Chỉnh sửa CV theo gợi ý',
                'Định hướng nghề nghiệp cơ bản'
            ],
            unavailable: [],
            available: true,
            bestValue: true
        },
        {
            id: 'premium',
            name: 'Cao cấp',
            price: '799.000đ',
            description: 'Tư vấn toàn diện',
            features: [
                'Tất cả tính năng của gói Chuyên nghiệp',
                'Tư vấn riêng trong 60 phút',
                'Thiết kế CV độc quyền',
                'Chuẩn bị cho phỏng vấn',
                'Tư vấn thương lượng lương',
                'Hỗ trợ trong 3 tháng'
            ],
            unavailable: [],
            available: true,
            bestValue: false
        }
    ];
    
    // Features for the main page
    const features = [
        {
            icon: <FaRobot />,
            title: "Phân tích CV bằng AI",
            description: "Công nghệ AI hiện đại phân tích CV của bạn, chỉ ra điểm mạnh, điểm yếu và đề xuất cải thiện."
        },
        {
            icon: <FaUserTie />,
            title: "Tư vấn chuyên gia",
            description: "Đội ngũ chuyên gia nghề nghiệp hàng đầu với hơn 10 năm kinh nghiệm tuyển dụng sẽ đánh giá CV của bạn."
        },
        {
            icon: <MdCompareArrows />,
            title: "So sánh với thị trường",
            description: "So sánh CV của bạn với các ứng viên thành công trong cùng ngành để biết cách cải thiện hiệu quả."
        },
        {
            icon: <FaMagic />,
            title: "Tối ưu hoá từ khoá",
            description: "Phân tích và tối ưu từ khoá trong CV để vượt qua hệ thống ATS của các công ty lớn."
        }
    ];
    
    return (
        <div className={cx("wrapper")}>
            <div className={cx("hero-section")}>
                <div className={cx("container")}>
                    <div className={cx("hero-content")}>
                        <h1 className={cx("title")}>Nâng tầm CV của bạn</h1>
                        <p className={cx("subtitle")}>
                            Tăng cơ hội được nhà tuyển dụng chú ý với dịch vụ tư vấn CV chuyên nghiệp
                        </p>
                        <div className={cx("upload-container")}>
                            <label htmlFor="cv-upload" className={cx("upload-button")}>
                                <FaCloudUploadAlt />
                                <span>Tải lên CV của bạn</span>
                            </label>
                            <input 
                                type="file" 
                                id="cv-upload" 
                                accept=".pdf,.doc,.docx" 
                                onChange={handleFileUpload}
                                className={cx("file-input")}
                            />
                            <p className={cx("upload-hint")}>
                                Hỗ trợ định dạng: PDF, DOC, DOCX (Tối đa 5MB)
                            </p>
                        </div>
                    </div>
                    <div className={cx("hero-image")}>
                        <img src="/images/cv-consulting.png" alt="CV Consulting" />
                    </div>
                </div>
            </div>
            
            <div className={cx("process-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Quy trình tư vấn CV</h2>
                        <p>Chúng tôi kết hợp công nghệ AI và chuyên gia hàng đầu để đem lại kết quả tốt nhất</p>
                    </div>
                    
                    <div className={cx("process-steps")}>
                        <div className={cx("step")}>
                            <div className={cx("step-number")}>1</div>
                            <h3>Tải lên CV</h3>
                            <p>Tải lên CV hiện tại của bạn để bắt đầu quá trình tư vấn</p>
                        </div>
                        <div className={cx("step-connector")}><MdNavigateNext /></div>
                        <div className={cx("step")}>
                            <div className={cx("step-number")}>2</div>
                            <h3>Phân tích AI</h3>
                            <p>Hệ thống AI phân tích CV và đưa ra đánh giá ban đầu</p>
                        </div>
                        <div className={cx("step-connector")}><MdNavigateNext /></div>
                        <div className={cx("step")}>
                            <div className={cx("step-number")}>3</div>
                            <h3>Đánh giá chuyên gia</h3>
                            <p>Chuyên gia nghề nghiệp đánh giá và đưa ra lời khuyên</p>
                        </div>
                        <div className={cx("step-connector")}><MdNavigateNext /></div>
                        <div className={cx("step")}>
                            <div className={cx("step-number")}>4</div>
                            <h3>Nhận kết quả</h3>
                            <p>Nhận báo cáo đánh giá và CV được tối ưu hóa</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={cx("features-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Tính năng nổi bật</h2>
                        <p>Công nghệ AI kết hợp với chuyên gia hàng đầu tạo nên dịch vụ tư vấn toàn diện</p>
                    </div>
                    
                    <div className={cx("features-grid")}>
                        {features.map((feature, index) => (
                            <div className={cx("feature-card")} key={index}>
                                <div className={cx("feature-icon")}>{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={cx("before-after-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Trước và Sau khi được tư vấn</h2>
                        <p>Xem sự khác biệt rõ rệt khi CV được tối ưu hóa bởi chuyên gia của chúng tôi</p>
                    </div>
                    
                    <div className={cx("comparison-container")}>
                        <div className={cx("comparison-item")}>
                            <div className={cx("comparison-header")}>
                                <h3>Trước khi tư vấn</h3>
                            </div>
                            <div className={cx("comparison-content", "before")}>
                                <div className={cx("cv-sample")}>
                                    <div className={cx("cv-section")}>
                                        <h3>Thông tin cá nhân</h3>
                                        <p>Nguyễn Văn A</p>
                                        <p>Lập trình viên</p>
                                        <p>email@example.com</p>
                                    </div>
                                    <div className={cx("cv-section")}>
                                        <h3>Kinh nghiệm</h3>
                                        <div className={cx("cv-item")}>
                                            <p>Công ty X - Lập trình viên</p>
                                            <p>2020 - hiện tại</p>
                                            <p>Làm việc với các dự án web.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={cx("cv-problems")}>
                                    <div className={cx("problem-item")}>
                                        <span className={cx("problem-marker")}>1</span>
                                        <p>Thiếu các từ khóa quan trọng</p>
                                    </div>
                                    <div className={cx("problem-item")}>
                                        <span className={cx("problem-marker")}>2</span>
                                        <p>Mô tả công việc quá chung chung</p>
                                    </div>
                                    <div className={cx("problem-item")}>
                                        <span className={cx("problem-marker")}>3</span>
                                        <p>Thiếu thành tích cụ thể</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className={cx("comparison-item")}>
                            <div className={cx("comparison-header")}>
                                <h3>Sau khi tư vấn</h3>
                            </div>
                            <div className={cx("comparison-content", "after")}>
                                <div className={cx("cv-sample")}>
                                    <div className={cx("cv-section")}>
                                        <h3>Thông tin cá nhân</h3>
                                        <p>Nguyễn Văn A</p>
                                        <p>Senior Front-end Developer</p>
                                        <p>email@example.com | github.com/nguyenvana</p>
                                    </div>
                                    <div className={cx("cv-section")}>
                                        <h3>Kinh nghiệm</h3>
                                        <div className={cx("cv-item")}>
                                            <p>Công ty X - Senior Front-end Developer</p>
                                            <p>2020 - hiện tại</p>
                                            <p>Phát triển và tối ưu hóa ứng dụng React, giảm 40% thời gian tải trang. Dẫn dắt team 5 thành viên hoàn thành dự án trước deadline 2 tuần.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={cx("cv-improvements")}>
                                    <div className={cx("improvement-item")}>
                                        <FaCheckCircle className={cx("improvement-icon")} />
                                        <p>Bổ sung từ khóa kỹ thuật quan trọng</p>
                                    </div>
                                    <div className={cx("improvement-item")}>
                                        <FaCheckCircle className={cx("improvement-icon")} />
                                        <p>Thêm thành tích cụ thể với số liệu</p>
                                    </div>
                                    <div className={cx("improvement-item")}>
                                        <FaCheckCircle className={cx("improvement-icon")} />
                                        <p>Nêu bật kỹ năng lãnh đạo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className={cx("pricing-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Các gói dịch vụ</h2>
                        <p>Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn</p>
                    </div>
                    
                    <div className={cx("pricing-plans")}>
                        {consultingPlans.map((plan) => (
                            <div 
                                className={cx("plan-card", { 
                                    "best-value": plan.bestValue,
                                    "unavailable": !plan.available
                                })} 
                                key={plan.id}
                            >
                                {plan.bestValue && <div className={cx("best-value-badge")}>Phổ biến nhất</div>}
                                <h3>{plan.name}</h3>
                                <div className={cx("plan-price")}>{plan.price}</div>
                                <p className={cx("plan-description")}>{plan.description}</p>
                                <ul className={cx("plan-features")}>
                                    {plan.features.map((feature, index) => (
                                        <li key={index}>
                                            <FaCheckCircle className={cx("feature-check")} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button 
                                    className={cx("select-plan-btn")}
                                    onClick={() => {
                                        if (plan.available) {
                                            setSelectedPlan(plan.id);
                                            document.getElementById('cv-upload').click();
                                        }
                                    }}
                                    disabled={!plan.available}
                                >
                                    {plan.available ? "Chọn gói" : (
                                        <>
                                            <FaLock /> Không khả dụng
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={cx("templates-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Mẫu CV chuyên nghiệp</h2>
                        <p>Khám phá bộ sưu tập mẫu CV được thiết kế bởi chuyên gia</p>
                    </div>
                    
                    <div className={cx("templates-grid")}>
                        {Array(6).fill().map((_, index) => (
                            <div className={cx("template-card")} key={index}>
                                <div className={cx("template-preview")}>
                                    <img src={`/images/cv-template-${index + 1}.png`} alt={`CV Template ${index + 1}`} />
                                    {index > 2 && (
                                        <div className={cx("premium-overlay")}>
                                            <FaLock />
                                            <span>Premium</span>
                                        </div>
                                    )}
                                </div>
                                <div className={cx("template-info")}>
                                    <h3>Template {index + 1}</h3>
                                    <p>{index > 2 ? "Gói Premium" : "Miễn phí"}</p>
                                </div>
                                <button 
                                    className={cx("use-template-btn")}
                                    disabled={index > 2 && userPlan === 'Basic'}
                                >
                                    {index > 2 && userPlan === 'Basic' ? (
                                        <>
                                            <FaLock /> Nâng cấp
                                        </>
                                    ) : "Sử dụng template"}
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    <div className={cx("view-more")}>
                        <Link to="/cv-templates" className={cx("view-more-btn")}>
                            Xem thêm mẫu CV
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className={cx("testimonials-section")}>
                <div className={cx("container")}>
                    <div className={cx("section-header")}>
                        <h2>Nhận xét từ khách hàng</h2>
                        <p>Xem những gì khách hàng của chúng tôi nói về dịch vụ tư vấn CV</p>
                    </div>
                    
                    <div className={cx("testimonials-grid")}>
                        {[
                            {
                                name: "Nguyễn Văn A",
                                position: "Software Developer",
                                company: "Công ty ABC",
                                quote: "Tôi đã nhận được 3 lời mời phỏng vấn trong tuần đầu tiên sau khi tối ưu hóa CV của mình với dịch vụ này.",
                                image: "/images/testimonial-1.jpg"
                            },
                            {
                                name: "Trần Thị B",
                                position: "Marketing Manager",
                                company: "Công ty XYZ",
                                quote: "Các chuyên gia đã giúp tôi làm nổi bật những kỹ năng quan trọng mà tôi không nghĩ đến. CV mới đã giúp tôi tăng lương 20%.",
                                image: "/images/testimonial-2.jpg"
                            },
                            {
                                name: "Lê Văn C",
                                position: "UX/UI Designer",
                                company: "Studio Design",
                                quote: "Dịch vụ tuyệt vời! Họ không chỉ cải thiện CV mà còn đưa ra lời khuyên quý giá cho sự nghiệp của tôi.",
                                image: "/images/testimonial-3.jpg"
                            }
                        ].map((testimonial, index) => (
                            <div className={cx("testimonial-card")} key={index}>
                                <div className={cx("testimonial-content")}>
                                    <p>"{testimonial.quote}"</p>
                                </div>
                                <div className={cx("testimonial-author")}>
                                    <div className={cx("author-image")}>
                                        <img src={testimonial.image} alt={testimonial.name} />
                                    </div>
                                    <div className={cx("author-info")}>
                                        <h4>{testimonial.name}</h4>
                                        <p>{testimonial.position}</p>
                                        <p>{testimonial.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className={cx("cta-section")}>
                <div className={cx("container")}>
                    <div className={cx("cta-content")}>
                        <h2>Sẵn sàng nâng tầm CV của bạn?</h2>
                        <p>Tải lên CV của bạn ngay hôm nay và nhận đánh giá chuyên nghiệp</p>
                        <button 
                            className={cx("cta-button")}
                            onClick={() => document.getElementById('cv-upload').click()}
                        >
                            <FaCloudUploadAlt />
                            <span>Tải lên CV ngay</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {showModal && (
                <div className={cx("modal-overlay")}>
                    <div className={cx("modal-container")}>
                        <div className={cx("modal-header")}>
                            <h3>Chọn gói dịch vụ</h3>
                            <button 
                                className={cx("close-modal")}
                                onClick={() => setShowModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className={cx("modal-body")}>
                            <div className={cx("upload-info")}>
                                <p>
                                    <FaFileAlt className={cx("file-icon")} />
                                    <span>{uploadedFile?.name}</span>
                                </p>
                            </div>
                            
                            <div className={cx("plan-selection")}>
                                <h4>Chọn gói dịch vụ:</h4>
                                <div className={cx("plan-options")}>
                                    {consultingPlans.map((plan) => (
                                        <div 
                                            className={cx("plan-option", { active: selectedPlan === plan.id })}
                                            key={plan.id}
                                            onClick={() => plan.available && setSelectedPlan(plan.id)}
                                        >
                                            <div className={cx("plan-check")}>
                                                {selectedPlan === plan.id && <FaCheckCircle />}
                                            </div>
                                            <div className={cx("plan-info")}>
                                                <h4>{plan.name}</h4>
                                                <p>{plan.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={cx("agree-terms")}>
                                <label className={cx("checkbox-container")}>
                                    <input type="checkbox" />
                                    <span className={cx("checkmark")}></span>
                                    <span>Tôi đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link> và <Link to="/privacy">Chính sách bảo mật</Link></span>
                                </label>
                            </div>
                        </div>
                        <div className={cx("modal-footer")}>
                            <button 
                                className={cx("cancel-btn")}
                                onClick={() => setShowModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                className={cx("submit-btn")}
                                onClick={handleSubmit}
                                disabled={!selectedPlan}
                            >
                                Gửi yêu cầu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CvConsulting;
