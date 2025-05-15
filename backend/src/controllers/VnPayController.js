const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const PaymentTransaction = require('../models/PaymentTransaction');
const User = require('../models/User');
require('dotenv').config();
const { Op } = require('sequelize');

class VnpayController {
  constructor() {
    this.tmnCode = process.env.VNP_TMN_CODE;
    this.secretKey = process.env.VNP_HASH_SECRET;
    this.vnpUrl = process.env.VNP_URL;
    this.returnUrl = process.env.VNP_RETURN_URL;
    this.vnpApi = process.env.VNP_API;
    this.feUrl = process.env.FE_URL;
  }

  async createPaymentUrl(req, res) {
    try {
      const id = req.user.id;
      process.env.TZ = 'Asia/Ho_Chi_Minh';
      const date = new Date();
      const createDate = moment(date).format('YYYYMMDDHHmmss');
      const ipAddr = this.getIpAddress(req);
      const orderId = moment(date).format('DDHHmmss');
      const { amount, bankCode, language } = req.body;

      // Log transaction details
      console.log(`Creating payment with: orderId=${orderId}, amount=${amount}, userId=${id}`);

      // Create payment parameters
      const vnp_Params = this.getPaymentParams({
        amount,
        bankCode,
        createDate,
        ipAddr,
        language,
        orderId
      });
      // if(amount < 120000) {
      //   return res.status(400).json({
      //     status: 'error',
      //     message: 'Số tiền nạp tối thiểu là 120.000 VND'
      //   });
      // }
      // Save payment transaction to the database
      const transaction = await PaymentTransaction.create({
        id: orderId,
        user_id: id,
        amount: amount,
        status: 'pending' // Set initial transaction status
      });

      console.log(`Created transaction in database: ${JSON.stringify(transaction.dataValues)}`);

      // Generate the secure hash
      const signData = this.generateSecureHash(vnp_Params);

      // Add secure hash to the parameters
      vnp_Params['vnp_SecureHashType'] = 'SHA512';
      vnp_Params['vnp_SecureHash'] = signData;

      // Build the payment URL
      const paymentUrl = `${this.vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;
      // Respond with the payment URL and status
      return res.status(200).json({
        status: 'success',
        paymentUrl: paymentUrl,
        orderId: orderId,
      });
    } catch (error) {
      console.error("Error in createPaymentUrl:", error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create payment URL',
      });
    }
  }

  generateSecureHash(vnp_Params) {
    // Sorting the params
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .map(key => `${key}=${vnp_Params[key]}`)
      .join('&'); // Concatenate as query string

    // Use HMAC-SHA512 instead of MD5
    const hmac = crypto.createHmac('sha512', this.secretKey);
    return hmac
      .update(Buffer.from(sortedParams, 'utf-8'))
      .digest('hex');
  }
  async verifyVnpayReturn(req, res) {
    try {
      // Kiểm tra truy cập trực tiếp (không có tham số)
      if (Object.keys(req.query).length === 0) {
        console.log("Direct access to payment return page detected");
        return res.redirect(`${this.feUrl}/payment/return?error=direct_access`);
      }

      // Lấy dữ liệu từ VNPay redirect
      const vnp_Params = req.query;

      console.log("VNPay return params:", JSON.stringify(vnp_Params));

      // Kiểm tra trường hợp không có tham số nào (URL trực tiếp)
      if (!vnp_Params || Object.keys(vnp_Params).length === 0) {
        console.error("Empty query parameters from VNPay");

        // Tạo dữ liệu mặc định để hiển thị trang lỗi
        const errorData = [
          "99", // Response code
          "99", // Transaction status
          "", // Order ID
          "", // Amount
          "", // Bank code
          "", // Bank transaction number
          "", // Card type
          "", // Payment date
          "Dữ liệu thanh toán không hợp lệ" // Order info
        ].join("|");

        return res.redirect(`${this.feUrl}/payment/return?data=${encodeURIComponent(errorData)}&is_valid=false&error=empty_params`);
      }

      // Lấy thông tin giao dịch từ VNPay
      const orderId = vnp_Params['vnp_TxnRef'];
      console.log("Checking transaction for orderId:", orderId);

      // Kiểm tra mã đơn hàng
      if (!orderId) {
        console.error("Missing order ID from VNPay");
        return res.redirect(`${this.feUrl}/payment/return?error=missing_order_id`);
      }

      // Tìm giao dịch trong database
      let paymentTransaction = await PaymentTransaction.findByPk(orderId);
      console.log("Found transaction:", paymentTransaction ? JSON.stringify(paymentTransaction.dataValues) : "null");

      if (!paymentTransaction) {
        console.error(`Transaction not found for orderId: ${orderId}`);

        // Tìm kiếm transaction với giá trị gần đúng
        // Kiểm tra transaction bằng cách substring
        const possibleTransactions = await PaymentTransaction.findAll({
          where: {
            id: {
              [Op.like]: `%${orderId.slice(-6)}%` // Tìm với 6 số cuối
            }
          },
          limit: 5,
          order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${possibleTransactions.length} possible transactions by substring match`);

        if (possibleTransactions.length > 0) {
          // Sử dụng transaction đầu tiên tìm được
          console.log(`Using possible transaction: ${JSON.stringify(possibleTransactions[0].dataValues)}`);
          paymentTransaction = possibleTransactions[0];
        } else {
          // Kiểm tra tất cả giao dịch gần đây
          const recentTransactions = await PaymentTransaction.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']]
          });

          console.log("Recent transactions:", JSON.stringify(recentTransactions.map(t => t.dataValues)));

          return res.redirect(`${this.feUrl}/payment/return?error=transaction_not_found`);
        }
      }

      // Từ đây tiếp tục xử lý signature và cập nhật ví như bình thường
      const secureHash = vnp_Params['vnp_SecureHash'];

      // Kiểm tra chữ ký
      if (!secureHash) {
        console.error("Missing secure hash from VNPay");
        return res.redirect(`${this.feUrl}/payment/return?error=missing_signature`);
      }

      // Xóa các tham số không cần thiết trước khi tạo chữ ký
      const vnpParams = { ...vnp_Params };
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];

      // Tạo URL redirect
      const redirectUrl = new URL(`${this.feUrl}/payment/return`);

      // Chuỗi dữ liệu để tạo chữ ký
      const signData = [];

      // Sắp xếp và xây dựng chuỗi để tạo chữ ký
      Object.keys(vnpParams)
        .sort()
        .forEach(key => {
          const value = vnpParams[key];
          // Skip empty value
          if (!value || value === "" || value === undefined || value === null) {
            return;
          }

          signData.push(`${key}=${value}`);
          redirectUrl.searchParams.append(key, value.toString());
        });

      const signString = signData.join('&');
      console.log("Sign string:", signString);

      // Tạo chữ ký HMAC-SHA512
      const hmac = crypto.createHmac('sha512', this.secretKey);
      const signed = hmac
        .update(Buffer.from(signString, 'utf-8'))
        .digest('hex');

      console.log("Calculated signature:", signed);
      console.log("Received signature:", secureHash);

      // So sánh chữ ký
      const valid = secureHash === signed;

      // Lấy thông tin phản hồi
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionStatus = vnp_Params['vnp_TransactionStatus'];

      // Tìm người dùng
      const user = await User.findByPk(paymentTransaction.user_id);
      console.log("Found user:", user ? JSON.stringify(user.dataValues) : "null");

      if (!user) {
        console.error(`User not found for user_id: ${paymentTransaction.user_id}`);
        return res.redirect(`${this.feUrl}/payment/return?error=user_not_found`);
      }

      // Xử lý thanh toán thành công
      if (valid && responseCode === "00" && transactionStatus === "00") {
        // Cập nhật trạng thái giao dịch
        try {
      paymentTransaction.status = 'success';
      await paymentTransaction.save();
          console.log("Đã cập nhật transaction thành công:", paymentTransaction.id);
        } catch (saveError) {
          console.error("Lỗi khi lưu trạng thái giao dịch:", saveError);
        }

        // Tính toán ngày hết hạn và gói dịch vụ dựa trên số tiền thanh toán
        let planExpiredAt;
        let plan = "Pro";

        // Xác định gói dịch vụ dựa trên số tiền
        if (paymentTransaction.amount >= 1200000) {
          plan = "ProMax";
        }

        // Kiểm tra người dùng đã có gói hay chưa và gói đó có còn hạn hay không
        const userCurrentlyHasActivePlan = user.plan !== 'Basic' && 
                                          user.plan_expired_at && 
                                          new Date(user.plan_expired_at) > new Date();

        if (userCurrentlyHasActivePlan) {
          // Nếu người dùng đã có gói và còn hạn, cộng thêm ngày vào ngày hết hạn hiện tại
          planExpiredAt = new Date(user.plan_expired_at);
          
          if (paymentTransaction.amount >= 1200000) {
            // Gói năm - cộng thêm 365 ngày
            planExpiredAt.setDate(planExpiredAt.getDate() + 365);
            console.log(`Gia hạn gói ProMax thêm 365 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
          } else {
            // Gói tháng - cộng thêm 30 ngày
            planExpiredAt.setDate(planExpiredAt.getDate() + 30);
            console.log(`Gia hạn gói Pro thêm 30 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
          }
        } else {
          // Nếu người dùng chưa có gói hoặc gói đã hết hạn, tạo ngày hết hạn mới từ ngày hiện tại
          planExpiredAt = new Date();
          
          if (paymentTransaction.amount >= 1200000) {
            // Gói năm
            planExpiredAt.setDate(planExpiredAt.getDate() + 365);
            console.log(`Đăng ký mới gói ProMax với thời hạn 365 ngày, hết hạn: ${planExpiredAt}`);
          } else {
            // Gói tháng
            planExpiredAt.setDate(planExpiredAt.getDate() + 30);
            console.log(`Đăng ký mới gói Pro với thời hạn 30 ngày, hết hạn: ${planExpiredAt}`);
          }
        }

        // Cập nhật thông tin gói dịch vụ cho người dùng
        user.plan = plan;
        user.plan_expired_at = planExpiredAt;
        await user.save();

        console.log(`Thanh toán thành công cho orderId: ${orderId}, user: ${paymentTransaction.user_id}, plan: ${plan}, expires: ${planExpiredAt}`);
      } else {
        // Đánh dấu giao dịch thất bại
      paymentTransaction.status = 'failed';
      await paymentTransaction.save();
        console.log(`Thanh toán thất bại cho orderId: ${orderId}, responseCode: ${responseCode}, valid: ${valid}`);
      }

      // Chuyển hướng tới trang kết quả thanh toán
      const data = [
        responseCode || "",
        transactionStatus || "",
        orderId || "",
        vnp_Params['vnp_Amount'] || "",
        vnp_Params['vnp_BankCode'] || "",
        vnp_Params['vnp_BankTranNo'] || "",
        vnp_Params['vnp_CardType'] || "",
        vnp_Params['vnp_PayDate'] || "",
        vnp_Params['vnp_OrderInfo'] || ""
      ].join("|");

      return res.redirect(`${this.feUrl}/payment/return?data=${encodeURIComponent(data)}&is_valid=${valid}`);
    } catch (error) {
      console.error("Error in verifyVnpayReturn:", error);
      return res.redirect(`${this.feUrl}/payment/return?error=server_error`);
    }
  }

  getPaymentParams({ amount, bankCode, createDate, ipAddr, language, orderId }) {
    return this.sortObject({
      "vnp_Amount": amount * 100,  // Amount should be in the smallest currency unit (e.g., VND)
      "vnp_Command": "pay",
      "vnp_CreateDate": createDate,
      "vnp_CurrCode": "VND",
      "vnp_IpAddr": ipAddr,
      "vnp_Locale": language || "vn",
      "vnp_OrderInfo": `Thanh toan goi JobZone gia: ${amount * 100}, ma: ${orderId}`,
      "vnp_OrderType": "oldmc",
      "vnp_ReturnUrl": this.returnUrl,
      "vnp_TmnCode": this.tmnCode,
      "vnp_TxnRef": orderId,
      "vnp_Version": "2.0.0"
    });
  }

  getIpAddress(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  }
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  async processIpnUrl(req, res) {
    try {
      // Lấy dữ liệu từ VNPay
      const vnp_Params = req.body;
      
      console.log("VNPay IPN params:", JSON.stringify(vnp_Params));
      
      // Kiểm tra tham số
      const orderId = vnp_Params['vnp_TxnRef'];
      if (!orderId) {
        return res.status(400).json({ RspCode: '01', Message: 'Order not found' });
      }
      
      // Xử lý chữ ký
      const secureHash = vnp_Params['vnp_SecureHash'];
      if (!secureHash) {
        return res.status(400).json({ RspCode: '02', Message: 'Invalid signature' });
      }
      
      // Tìm giao dịch
      const paymentTransaction = await PaymentTransaction.findByPk(orderId);
      if (!paymentTransaction) {
        return res.status(400).json({ RspCode: '01', Message: 'Order not found' });
      }
      
      // Xác minh chữ ký giống như trong verifyVnpayReturn
      const vnpParams = { ...vnp_Params };
      delete vnpParams['vnp_SecureHash'];
      delete vnpParams['vnp_SecureHashType'];
      
      const signData = [];
      Object.keys(vnpParams)
        .sort()
        .forEach(key => {
          const value = vnpParams[key];
          if (!value || value === "") return;
          signData.push(`${key}=${value}`);
        });
      
      const signString = signData.join('&');
      const hmac = crypto.createHmac('sha512', this.secretKey);
      const signed = hmac.update(Buffer.from(signString, 'utf-8')).digest("hex");
      
      // Kiểm tra chữ ký
      if (secureHash !== signed) {
        return res.status(400).json({ RspCode: '97', Message: 'Invalid signature' });
      }
      
      // Kiểm tra trạng thái
      const responseCode = vnp_Params['vnp_ResponseCode'];
      const transactionStatus = vnp_Params['vnp_TransactionStatus'];
      
      if (responseCode === "00" && transactionStatus === "00") {
        // Cập nhật trạng thái
        paymentTransaction.status = 'success';
        await paymentTransaction.save();
        
        // Tìm user và cập nhật plan
        const user = await User.findByPk(paymentTransaction.user_id);
        if (user) {
          let planExpiredAt;
          let plan = "Pro";
          
          // Xác định gói dịch vụ dựa trên số tiền
          if (paymentTransaction.amount >= 1200000) {
            plan = "ProMax";
          }
          
          // Kiểm tra người dùng đã có gói hay chưa và gói đó có còn hạn hay không
          const userCurrentlyHasActivePlan = user.plan !== 'Basic' && 
                                           user.plan_expired_at && 
                                           new Date(user.plan_expired_at) > new Date();
          
          if (userCurrentlyHasActivePlan) {
            // Nếu người dùng đã có gói và còn hạn, cộng thêm ngày vào ngày hết hạn hiện tại
            planExpiredAt = new Date(user.plan_expired_at);
            
            if (paymentTransaction.amount >= 1200000) {
              // Gói năm - cộng thêm 365 ngày
              planExpiredAt.setDate(planExpiredAt.getDate() + 365);
              console.log(`Gia hạn gói ProMax thêm 365 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
            } else {
              // Gói tháng - cộng thêm 30 ngày
              planExpiredAt.setDate(planExpiredAt.getDate() + 30);
              console.log(`Gia hạn gói Pro thêm 30 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
            }
          } else {
            // Nếu người dùng chưa có gói hoặc gói đã hết hạn, tạo ngày hết hạn mới từ ngày hiện tại
            planExpiredAt = new Date();
            
            if (paymentTransaction.amount >= 1200000) {
              // Gói năm
              planExpiredAt.setDate(planExpiredAt.getDate() + 365);
              console.log(`Đăng ký mới gói ProMax với thời hạn 365 ngày, hết hạn: ${planExpiredAt}`);
            } else {
              // Gói tháng
              planExpiredAt.setDate(planExpiredAt.getDate() + 30);
              console.log(`Đăng ký mới gói Pro với thời hạn 30 ngày, hết hạn: ${planExpiredAt}`);
            }
          }
          
          user.plan = plan;
          user.plan_expired_at = planExpiredAt;
          await user.save();
        }
        
        return res.status(200).json({ RspCode: '00', Message: 'Confirmed success' });
      } else {
        // Cập nhật trạng thái thất bại
        paymentTransaction.status = 'failed';
        await paymentTransaction.save();
        
        return res.status(200).json({ RspCode: '00', Message: 'Confirmed fail' });
      }
    } catch (error) {
      console.error("Error in processIpnUrl:", error);
      return res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
    }
  }

  async checkAndUpdateTransaction(req, res) {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ status: 'error', message: 'Order ID is required' });
      }
      
      // Tìm giao dịch
      const paymentTransaction = await PaymentTransaction.findByPk(orderId);
      if (!paymentTransaction) {
        return res.status(404).json({ status: 'error', message: 'Transaction not found' });
      }
      
      // Nếu giao dịch đã thành công, không cần làm gì
      if (paymentTransaction.status === 'success') {
        return res.status(200).json({ status: 'success', message: 'Transaction already successful' });
      }
      
      // Cập nhật trạng thái
      paymentTransaction.status = 'success';
      await paymentTransaction.save();
      
      // Tìm và cập nhật user
      const user = await User.findByPk(paymentTransaction.user_id);
      if (user) {
        let planExpiredAt;
        let plan = "Pro";
        
        // Xác định gói dịch vụ dựa trên số tiền
        if (paymentTransaction.amount >= 1200000) {
          plan = "ProMax";
        }
        
        // Kiểm tra người dùng đã có gói hay chưa và gói đó có còn hạn hay không
        const userCurrentlyHasActivePlan = user.plan !== 'Basic' && 
                                         user.plan_expired_at && 
                                         new Date(user.plan_expired_at) > new Date();
        
        if (userCurrentlyHasActivePlan) {
          // Nếu người dùng đã có gói và còn hạn, cộng thêm ngày vào ngày hết hạn hiện tại
          planExpiredAt = new Date(user.plan_expired_at);
          
          if (paymentTransaction.amount >= 1200000) {
            // Gói năm - cộng thêm 365 ngày
            planExpiredAt.setDate(planExpiredAt.getDate() + 365);
            console.log(`Gia hạn gói ProMax thêm 365 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
          } else {
            // Gói tháng - cộng thêm 30 ngày
            planExpiredAt.setDate(planExpiredAt.getDate() + 30);
            console.log(`Gia hạn gói Pro thêm 30 ngày từ ${user.plan_expired_at} đến ${planExpiredAt}`);
          }
        } else {
          // Nếu người dùng chưa có gói hoặc gói đã hết hạn, tạo ngày hết hạn mới từ ngày hiện tại
          planExpiredAt = new Date();
          
          if (paymentTransaction.amount >= 1200000) {
            // Gói năm
            planExpiredAt.setDate(planExpiredAt.getDate() + 365);
            console.log(`Đăng ký mới gói ProMax với thời hạn 365 ngày, hết hạn: ${planExpiredAt}`);
          } else {
            // Gói tháng
            planExpiredAt.setDate(planExpiredAt.getDate() + 30);
            console.log(`Đăng ký mới gói Pro với thời hạn 30 ngày, hết hạn: ${planExpiredAt}`);
          }
        }
        
        user.plan = plan;
        user.plan_expired_at = planExpiredAt;
        await user.save();
        
        return res.status(200).json({ 
          status: 'success', 
          message: 'Transaction updated successfully',
          plan: plan,
          expiry: planExpiredAt
        });
      } else {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
    } catch (error) {
      console.error("Error in checkAndUpdateTransaction:", error);
      return res.status(500).json({ status: 'error', message: 'Server error' });
    }
  }
}

module.exports = new VnpayController();
