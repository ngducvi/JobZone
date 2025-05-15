import React, { useContext, useState, useEffect } from "react";
import classNames from "classnames/bind";
import styles from "./Pricing.module.scss";
import { authAPI, userApis } from "~/utils/api";
import ModalTypeContext from "~/context/ModalTypeContext";
import { FaCheck, FaTimes, FaCrown, FaUserAlt, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

const cx = classNames.bind(styles);

function Pricing() {
  const { setModalType } = useContext(ModalTypeContext);
  const [isYearly, setIsYearly] = useState(false);
  const token = localStorage.getItem("token");
  const [userPlan, setUserPlan] = useState(null);
  const [planExpiry, setPlanExpiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Function to fetch user's current plan
    const fetchUserPlan = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await authAPI().get(userApis.checkUserPlan);
        
        if (response.data && response.data.code === 1) {
          setUserPlan(response.data.aiAccess.plan);
          
          // Also fetch more user details to get plan expiry
          const userResponse = await authAPI().get(userApis.getCurrentUser);
          if (userResponse.data && userResponse.data.code === 1) {
            setPlanExpiry(userResponse.data.user.plan_expired_at);
          }
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      } finally {
        setLoading(false);
      }
    };
    
  // Fetch user's current plan on component mount
  useEffect(() => {
    fetchUserPlan();
  }, [token]);
  
  // Handle VNPay payment return
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const data = queryParams.get('data');
    const isValid = queryParams.get('is_valid');
    
    if (data && isValid) {
      const dataArray = data.split('|');
      const responseCode = dataArray[0];
      
      if (isValid === 'true' && responseCode === '00') {
        toast.success('Thanh toán thành công! Gói của bạn đã được nâng cấp.');
        fetchUserPlan();
      } else {
        toast.error('Thanh toán thất bại. Vui lòng thử lại sau.');
      }
      
      // Clear the URL parameters after processing
      navigate('/pricing', { replace: true });
    }
  }, [location, navigate, fetchUserPlan]);
  
  const formatExpiryDate = (dateString) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const handleRegister = async (amount, plan) => {
    // If user is already on this plan, show a toast and return
    if (userPlan === plan && plan === 'Basic') {
      toast.error(`Bạn đã đăng ký gói ${plan} rồi!`);
      return;
    }
    
    if (amount === 0) {
      // Xử lý đăng ký tài khoản free
      if (!token) {
        setModalType("registerUser");
      } else {
        // Nếu đã đăng nhập, thông báo đã có gói free
        toast.success("Bạn đã có tài khoản với gói cơ bản miễn phí!");
      }
      return;
    }

    if (!token) {
      setModalType("loginEmail");
      return;
    }
    
    // Handle plan extension or upgrade
    const actionType = userPlan === plan ? 'extension' : 'upgrade';
    
    try {
      setPaymentProcessing(true);
      const response = await authAPI().post(userApis.createPaymentUrl, {
        amount: amount,
        bankCode: "",
        language: "vn",
        actionType: actionType  // Pass the action type to the backend
      });
      
      if(response.data && response.data.status === 'success' && response.data.paymentUrl) {
        // Redirect to VNPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error("Không thể tạo đường dẫn thanh toán!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
      toast.error("Có lỗi xảy ra khi xử lý thanh toán!");
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const proPrice = isYearly ? 1200000 : 120000;
  const discount = isYearly ? "Tiết kiệm 20%" : "";

  return (
    <div className={cx("pricing-wrapper")}>
      <div className={cx("pricing-header")}>
        <h1 className={cx("pricing-title")}>Chọn gói phù hợp với bạn</h1>
        <p className={cx("pricing-subtitle")}>Khám phá các tính năng độc quyền với gói Pro</p>
        
        {userPlan && (
          <div className={cx("current-plan-badge")}>
            <FaCheckCircle className={cx("plan-icon")} />
            <span>
              Gói hiện tại: <strong>{userPlan}</strong>
              {planExpiry && userPlan !== 'Basic' && (
                <> (Hết hạn: {formatExpiryDate(planExpiry)})</>
              )}
            </span>
          </div>
        )}
        
        <div className={cx("pricing-toggle")}>
          <span className={cx(!isYearly && "active")}>Hàng tháng</span>
          <label className={cx("switch")}>
            <input 
              type="checkbox" 
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />
            <span className={cx("slider")}></span>
          </label>
          <span className={cx(isYearly && "active")}>Hàng năm</span>
          {isYearly && <span className={cx("discount-badge")}>{discount}</span>}
        </div>
      </div>

      <div className={cx("pricing-options")}>
        <div className={cx("pricing-card", "basic-plan", { 'current-plan': userPlan === 'Basic' })}>
          {userPlan === 'Basic' && <div className={cx("current-plan-marker")}>Gói hiện tại</div>}
          <div className={cx("card-header")}>
            <FaUserAlt className={cx("plan-icon")} />
            <h3 className={cx("plan-title")}>Gói cơ bản</h3>
            <p className={cx("plan-price")}>
              0 <span>VND</span>
            </p>
            <p className={cx("price-period")}>Miễn phí</p>
          </div>
          
          <ul className={cx("plan-features")}>
            <li><FaCheck className={cx("check-icon")} /> Tìm kiếm việc làm cơ bản</li>
            <li><FaCheck className={cx("check-icon")} /> Tạo hồ sơ ứng viên</li>
            <li><FaCheck className={cx("check-icon")} /> Ứng tuyển tối đa 10 việc/tháng</li>
            <li><FaCheck className={cx("check-icon")} /> 1 mẫu CV cơ bản</li>
            <li className={cx("disabled")}><FaTimes className={cx("times-icon")} /> Đề xuất việc làm thông minh</li>
            <li className={cx("disabled")}><FaTimes className={cx("times-icon")} /> Chế độ tìm việc ẩn danh</li>
            <li className={cx("disabled")}><FaTimes className={cx("times-icon")} /> Ưu tiên xếp hạng hồ sơ</li>
            <li className={cx("disabled")}><FaTimes className={cx("times-icon")} /> Gợi ý cải thiện CV</li>
          </ul>
          
          <button 
            className={cx("btn", "btn-basic", { 'current-plan-btn': userPlan === 'Basic' })} 
            onClick={() => handleRegister(0, 'Basic')}
            disabled={userPlan === 'Basic' || loading || paymentProcessing}
          >
            {userPlan === 'Basic' ? 'Gói hiện tại của bạn' : 'Bắt đầu miễn phí'}
          </button>
        </div>

        <div className={cx("pricing-card", "pro-plan", { 'current-plan': userPlan === 'Pro' })}>
          {userPlan !== 'Pro' && <div className={cx("popular-badge")}>Phổ biến</div>}
          {userPlan === 'Pro' && <div className={cx("current-plan-marker")}>Gói hiện tại</div>}
          {userPlan === 'Pro' && <div className={cx("extension-tag")}>Gia hạn +{isYearly ? '365' : '30'} ngày</div>}
          <div className={cx("card-header")}>
            <FaCrown className={cx("plan-icon")} />
            <h3 className={cx("plan-title")}>Gói Pro</h3>
            <p className={cx("plan-price")}>
              {proPrice.toLocaleString()} <span>VND</span>
            </p>
            <p className={cx("price-period")}>{isYearly ? 'Hàng năm' : 'Hàng tháng'}</p>
          </div>
          
          <ul className={cx("plan-features")}>
            <li><FaCheck className={cx("check-icon")} /> <strong>Tất cả tính năng cơ bản</strong></li>
            <li><FaCheck className={cx("check-icon")} /> <strong>Ứng tuyển không giới hạn</strong></li>
            <li><FaCheck className={cx("check-icon")} /> <strong>20+ mẫu CV cao cấp</strong></li>
            <li><FaCheck className={cx("check-icon")} /> Đề xuất việc làm thông minh AI</li>
            <li><FaCheck className={cx("check-icon")} /> Chế độ tìm việc ẩn danh</li>
            <li><FaCheck className={cx("check-icon")} /> Ưu tiên xếp hạng hồ sơ</li>
            <li><FaCheck className={cx("check-icon")} /> Gợi ý cải thiện CV bằng AI</li>
            <li><FaCheck className={cx("check-icon")} /> Hỗ trợ 24/7 qua email</li>
          </ul>
          
          <button 
            className={cx("btn", "btn-pro", { 'current-plan-btn': userPlan === 'Pro' })} 
            onClick={() => handleRegister(proPrice, 'Pro')}
            disabled={loading || paymentProcessing}
          >
            {paymentProcessing ? 'Đang xử lý...' : userPlan === 'Pro' ? 'Gia hạn gói Pro' : 'Nâng cấp ngay'}
          </button>
        </div>
      </div>

      <div className={cx("features-comparison")}>
        <h3>So sánh tính năng</h3>
        <table className={cx("comparison-table")}>
          <thead>
            <tr>
              <th>Tính năng</th>
              <th>Basic</th>
              <th>Pro</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tìm kiếm việc làm</td>
              <td>Cơ bản</td>
              <td>Nâng cao + AI</td>
            </tr>
            <tr>
              <td>Ứng tuyển việc làm</td>
              <td>10/tháng</td>
              <td>Không giới hạn</td>
            </tr>
            <tr>
              <td>Mẫu CV</td>
              <td>1 mẫu</td>
              <td>20+ mẫu</td>
            </tr>
            <tr>
              <td>Ưu tiên hồ sơ</td>
              <td><FaTimes /></td>
              <td><FaCheck /></td>
            </tr>
            <tr>
              <td>Gợi ý cải thiện CV</td>
              <td><FaTimes /></td>
              <td><FaCheck /></td>
            </tr>
            <tr>
              <td>Chế độ ẩn danh</td>
              <td><FaTimes /></td>
              <td><FaCheck /></td>
            </tr>
            <tr>
              <td>Đề xuất việc làm AI</td>
              <td><FaTimes /></td>
              <td><FaCheck /></td>
            </tr>
            <tr>
              <td>Hỗ trợ khách hàng</td>
              <td>Cơ bản</td>
              <td>Ưu tiên 24/7</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={cx("notes-section")}>
        <div className={cx("note")}>
          <h4>Nếu chưa hết thời hạn sử dụng</h4>
          <p>Mua thêm gói sẽ được cộng dồn thời hạn và các quyền lợi. Gói năm sẽ cộng dồn 365 ngày, gói tháng sẽ cộng dồn 30 ngày vào thời hạn hiện tại.</p>
        </div>
        <div className={cx("note")}>
          <h4>Đảm bảo hoàn tiền</h4>
          <p>
            Hoàn tiền 100% trong vòng 7 ngày nếu bạn không hài lòng với dịch vụ
          </p>
        </div>
      </div>
      
      <div className={cx("extension-info")}>
        <h3>Cách thức gia hạn gói</h3>
        <div className={cx("extension-grid")}>
          <div className={cx("extension-item")}>
            <div className={cx("extension-icon")}>
              <FaCheckCircle />
            </div>
            <h4>Gia hạn gói Pro</h4>
            <p>Khi bạn gia hạn gói Pro hàng tháng, thời hạn sử dụng sẽ được tự động cộng thêm 30 ngày vào ngày hết hạn hiện tại.</p>
          </div>
          <div className={cx("extension-item")}>
            <div className={cx("extension-icon")}>
              <FaCrown />
            </div>
            <h4>Gia hạn gói ProMax</h4>
            <p>Khi bạn nâng cấp hoặc gia hạn gói ProMax hàng năm, thời hạn sử dụng sẽ được tự động cộng thêm 365 ngày vào ngày hết hạn hiện tại.</p>
          </div>
          <div className={cx("extension-item")}>
            <div className={cx("extension-icon")}>
              <FaInfoCircle />
            </div>
            <h4>Nâng cấp từ Pro lên ProMax</h4>
            <p>Bạn có thể nâng cấp từ gói Pro lên ProMax bất cứ lúc nào. Thời gian sử dụng còn lại của gói Pro sẽ được giữ nguyên và cộng thêm 365 ngày.</p>
          </div>
        </div>
      </div>
      
      <div className={cx("faq-section")}>
        <h3>Câu hỏi thường gặp</h3>
        <div className={cx("faq-item")}>
          <h4>Tôi có thể hủy gói Pro bất cứ lúc nào không?</h4>
          <p>Có, bạn có thể hủy gói Pro bất cứ lúc nào. Sau khi hủy, bạn vẫn có thể sử dụng dịch vụ cho đến hết chu kỳ thanh toán hiện tại.</p>
        </div>
        <div className={cx("faq-item")}>
          <h4>Làm thế nào để nâng cấp từ gói Basic lên Pro?</h4>
          <p>Bạn có thể dễ dàng nâng cấp lên gói Pro bằng cách nhấp vào nút "Nâng cấp ngay" và hoàn thành quy trình thanh toán.</p>
        </div>
        <div className={cx("faq-item")}>
          <h4>Tôi hiện đang dùng gói Pro, tôi có thể gia hạn trước khi hết hạn không?</h4>
          <p>Có, bạn có thể gia hạn gói Pro bất cứ lúc nào bằng cách nhấp vào nút "Gia hạn gói Pro". Khi gia hạn, thời gian sẽ được cộng dồn vào thời hạn hiện tại mà không bị mất bất kỳ ngày nào.</p>
        </div>
        <div className={cx("faq-item")}>
          <h4>Chuyện gì sẽ xảy ra nếu tôi chuyển từ gói Pro lên ProMax?</h4>
          <p>Khi bạn nâng cấp từ gói Pro lên ProMax, bạn sẽ được cộng thêm 365 ngày vào thời hạn sử dụng hiện tại và nhận ngay các tính năng cao cấp của gói ProMax.</p>
        </div>
        <div className={cx("faq-item")}>
          <h4>Có cần thẻ tín dụng để đăng ký gói miễn phí không?</h4>
          <p>Không, bạn không cần cung cấp thông tin thẻ tín dụng để đăng ký và sử dụng gói Basic miễn phí.</p>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
