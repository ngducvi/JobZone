import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import styles from "./PaymentReturn.module.scss";
import Logo from "~/components/Logo";
import { toast } from "react-hot-toast";
import { authAPI, userApis } from "~/utils/api";
import paymentServices from "~/services/paymentServices";

const cx = classNames.bind(styles);

function PaymentReturn() {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        // Thêm dòng để hiển thị URL đầy đủ để debug
        console.log("Full URL:", window.location.href);

  const searchParams = new URLSearchParams(location.search);
        const data = searchParams.get("data");
        const isValid = searchParams.get("is_valid");
        const errorParam = searchParams.get("error");
        
        console.log("Payment return params:", { data, isValid, errorParam });
        
        // Check for direct VNPay parameters (vnp_ResponseCode exists)
        if (searchParams.has('vnp_ResponseCode') && !data) {
          console.log("Direct VNPay parameters detected, processing...");
          
          // Extract parameters from VNPay redirect URL directly
          const responseCode = searchParams.get('vnp_ResponseCode');
          const transactionStatus = searchParams.get('vnp_TransactionStatus');
          const orderId = searchParams.get('vnp_TxnRef');
          const amount = searchParams.get('vnp_Amount');
          const bankCode = searchParams.get('vnp_BankCode');
          const bankTranNo = searchParams.get('vnp_BankTranNo');
          const cardType = searchParams.get('vnp_CardType');
          const payDate = searchParams.get('vnp_PayDate');
          const orderInfo = searchParams.get('vnp_OrderInfo');
          
          // Assume transaction is valid if responseCode is "00"
          const isValidTransaction = responseCode === "00" && transactionStatus === "00";
          
          // Process the VNPay data directly
          const vnpData = [
            responseCode,
            transactionStatus,
            orderId,
            amount,
            bankCode,
            bankTranNo,
            cardType,
            payDate,
            orderInfo
          ].join("|");
          
          processTransactionData(vnpData, isValidTransaction);
          
          // Update user plan data if payment was successful
          if (isValidTransaction) {
            try {
              try {
                const result = await paymentServices.checkAndUpdateTransaction(orderId);
                console.log("Transaction update result:", result);
              } catch (updateError) {
                console.error("Error updating transaction:", updateError);
                // Fallback: gọi trực tiếp API cập nhật gói người dùng nếu không thể cập nhật giao dịch
                console.log("Fallback: Updating user plan directly");
              }
              
              // Cập nhật kế hoạch người dùng - luôn thực hiện dù có lỗi ở trên hay không
              await paymentServices.updateUserPlan();
              console.log("User plan updated successfully");
            } catch (error) {
              console.error("Error updating user info:", error);
            }
          }
          
          setLoading(false);
          return;
        }
        
        // Nếu không có dữ liệu nào, có thể đang truy cập trực tiếp
        if (!data && !errorParam) {
          setError("Truy cập trực tiếp. Vui lòng thực hiện thanh toán từ trang giá cả.");
          setLoading(false);
          return;
        }
        
        // Handle error cases from backend
        if (errorParam) {
          let errorMessage = "Có lỗi xảy ra trong quá trình xử lý thanh toán.";
          
          switch(errorParam) {
            case 'invalid_data':
              errorMessage = "Dữ liệu thanh toán không hợp lệ.";
              break;
            case 'invalid_format':
              errorMessage = "Định dạng dữ liệu thanh toán không hợp lệ.";
              break;
            case 'transaction_not_found':
              errorMessage = "Không tìm thấy giao dịch thanh toán. Vui lòng liên hệ hỗ trợ.";
              break;
            case 'wallet_not_found':
              errorMessage = "Không tìm thấy ví người dùng.";
              break;
            case 'server_error':
              errorMessage = "Có lỗi xảy ra trên máy chủ. Vui lòng thử lại sau.";
              break;
            case 'empty_params':
              errorMessage = "Không nhận được dữ liệu từ cổng thanh toán. Vui lòng thử lại hoặc kiểm tra lịch sử giao dịch.";
              break;
            case 'missing_signature':
              errorMessage = "Thiếu chữ ký xác thực từ cổng thanh toán.";
              break;
            case 'missing_order_id':
              errorMessage = "Thiếu mã đơn hàng từ cổng thanh toán.";
              break;
            case 'direct_access':
              errorMessage = "Truy cập trực tiếp. Vui lòng thực hiện thanh toán từ trang giá cả.";
              break;
            default:
              errorMessage = "Có lỗi xảy ra trong quá trình xử lý thanh toán.";
          }
          
          setError(errorMessage);
          toast.error(errorMessage);
          
          // If we still have transaction data, try to display it
          if (data) {
            processTransactionData(data, false);
          } else {
            setLoading(false);
          }
          return;
        }
        
        // Normal flow - no error param
        if (!data) {
          setError("Dữ liệu thanh toán không hợp lệ hoặc không đầy đủ.");
          toast.error("Dữ liệu thanh toán không hợp lệ");
          setLoading(false);
          return;
        }
        
        // Process the transaction data
        processTransactionData(data, isValid === "true");
        
        // Fetch updated user data after successful payment
        if (isValid === "true") {
          try {
            await authAPI().get(userApis.checkUserPlan);
            console.log("User plan updated successfully");
          } catch (error) {
            console.error("Error fetching user plan:", error);
          }
        }
      } catch (error) {
        console.error("Error processing payment return:", error);
        setError("Có lỗi xảy ra khi xử lý kết quả thanh toán. Vui lòng liên hệ hỗ trợ.");
        toast.error("Có lỗi xảy ra khi xử lý kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };
    
    const processTransactionData = (data, isValid) => {
      try {
        const dataArray = data.split("|");
        
        // Kiểm tra mảng dữ liệu có đầy đủ không
        if (!dataArray || dataArray.length < 3) {
          throw new Error("Dữ liệu giao dịch không đầy đủ");
        }
        
        const responseCode = dataArray[0] || "";
        
        // In ra console để debug
        console.log("Transaction data array:", dataArray);
        
        // Xử lý số tiền
        let amount = "N/A";
        if (dataArray[3]) {
          try {
            // Chuyển thành số và kiểm tra
            const amountValue = Number(dataArray[3]);
            if (!isNaN(amountValue) && amountValue > 0) {
              // Divide by 100 if amount comes from VNPay directly 
              // (VNPay multiplies by 100 when sending to payment gateway)
              const adjustedAmount = dataArray[3].length > 8 ? amountValue / 100 : amountValue;
              amount = adjustedAmount.toLocaleString(
    "vi-VN",
    { style: "currency", currency: "VND" }
  );
            }
          } catch (e) {
            console.error("Error parsing amount:", e);
            amount = "N/A";
          }
        }
        
        // Xử lý thời gian để đảm bảo không bị lỗi
        const payDate = dataArray[7] || "";
        
        setTransactionData({
          status: isValid && responseCode === "00" ? "Thành công" : "Thất bại",
          amount: amount,
          bankCode: dataArray[4] || "N/A",
          transactionNo: dataArray[5] || "N/A",
          orderId: dataArray[2] || "N/A",
          payDate: payDate,
          responseMessage: getResponseMessage(responseCode)
        });
      } catch (err) {
        console.error("Error processing transaction data:", err);
        setError("Không thể xử lý dữ liệu giao dịch: " + err.message);
      }
    };
    
    processPaymentReturn();
  }, [location, navigate]);

  // Get human-readable response message based on VNPay response code
  const getResponseMessage = (responseCode) => {
    const messages = {
      "00": "Giao dịch thành công",
      "01": "Giao dịch đã tồn tại",
      "02": "Merchant không hợp lệ",
      "03": "Dữ liệu gửi sang không đúng định dạng",
      "04": "Khởi tạo GD không thành công do Website đang bị tạm khóa",
      "05": "Giao dịch không thành công do: Quý khách nhập sai mật khẩu quá số lần quy định",
      "06": "Giao dịch không thành công do Quý khách nhập sai mật khẩu",
      "07": "Giao dịch bị nghi ngờ gian lận",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày",
      "75": "Ngân hàng thanh toán đang bảo trì",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định",
      "99": "Các lỗi khác"
    };
    
    return messages[responseCode] || "Lỗi không xác định";
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.length < 14) return "N/A";
    
    try {
      // Handle the format directly from VNPay (yyyyMMddHHmmss)
    const date = new Date(
      dateString.slice(0, 4),
      dateString.slice(4, 6) - 1,
      dateString.slice(6, 8),
      dateString.slice(8, 10),
      dateString.slice(10, 12),
      dateString.slice(12, 14)
    );
    return date.toLocaleString("vi-VN");
    } catch (error) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className={cx("wrapper")}>
        <Logo />
        <div className={cx("loading")}>
          <div className={cx("spinner")}></div>
          <p>Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("wrapper")}>
      <Logo />

      <div className={cx("card")}>
        {error && (
          <div className={cx("error-message")}>
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
            {error.includes("Truy cập trực tiếp") && (
              <div className={cx("direct-access-info")}>
                <p>Bạn đang truy cập trực tiếp vào trang kết quả thanh toán mà không thông qua quá trình thanh toán.</p>
                <p>Để tiến hành thanh toán, vui lòng nhấn nút bên dưới để đi đến trang giá cả và chọn gói phù hợp.</p>
                <Link to="/pricing" className={cx("btn", "btn-primary", "mt-2")}>
                  Đi đến trang giá cả
                </Link>
              </div>
            )}
          </div>
        )}
        
        {transactionData && (
          <>
        <div className={cx("icon-container")}>
              {transactionData.status === "Thành công" ? (
            <div className={cx("icon", "success-icon")}>
                  <i className="fas fa-check"></i>
            </div>
          ) : (
            <div className={cx("icon", "failure-icon")}>
                  <i className="fas fa-times"></i>
            </div>
          )}
        </div>
        <h1
          className={cx(
            "status",
                transactionData.status === "Thành công" ? "success" : "failure"
          )}
        >
              {transactionData.status === "Thành công"
            ? "Thanh toán thành công!"
            : "Thanh toán thất bại"}
        </h1>
            {transactionData.responseMessage && transactionData.status !== "Thành công" && (
              <p className={cx("response-message")}>{transactionData.responseMessage}</p>
            )}
        <div className={cx("details")}>
          <div className={cx("info-item")}>
            <strong>Mã giao dịch:</strong>
                <span className={cx("value")}>{transactionData.transactionNo}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Mã đơn hàng:</strong>
                <span className={cx("value")}>{transactionData.orderId}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Ngân hàng:</strong>
                <span className={cx("value")}>{transactionData.bankCode}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Số tiền:</strong>
                <span className={cx("value")}>{transactionData.amount}</span>
          </div>
          <div className={cx("info-item")}>
            <strong>Thời gian:</strong>
                <span className={cx("value")}>{formatDate(transactionData.payDate)}</span>
          </div>
        </div>
          </>
        )}
        
        <div className={cx("actions")}>
          <Link to="/" className={cx("btn", "btn-primary")}>
            Quay về trang chủ
          </Link>
          <Link to="/pricing" className={cx("btn", "btn-secondary")}>
            Xem các gói dịch vụ
          </Link>
          {transactionData && transactionData.status === "Thành công" && (
            <Link to="/user/profile" className={cx("btn", "btn-success")}>
              Xem hồ sơ của tôi
            </Link>
          )}
        </div>

        <div className={cx("note")}>
          <small>*Một số thông báo lỗi có thể xuất hiện trong console trình duyệt do cấu hình của cổng thanh toán, điều này không ảnh hưởng đến giao dịch của bạn.</small>
        </div>
        
        <div className={cx("direct-access-guide")} style={{ display: error && error.includes("Truy cập trực tiếp") ? 'block' : 'none' }}>
          <h3>Hướng dẫn thanh toán</h3>
          <ol>
            <li>Truy cập vào <Link to="/pricing">trang giá cả</Link></li>
            <li>Đăng nhập vào tài khoản của bạn (nếu chưa đăng nhập)</li>
            <li>Chọn gói Pro phù hợp với nhu cầu của bạn</li>
            <li>Nhấn nút "Nâng cấp ngay" để bắt đầu quá trình thanh toán</li>
            <li>Làm theo hướng dẫn trên cổng thanh toán VNPay</li>
            <li>Sau khi thanh toán thành công, bạn sẽ được chuyển về trang kết quả</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default PaymentReturn;
