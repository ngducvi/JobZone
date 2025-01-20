const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const PaymentTransaction = require('../models/PaymentTransaction');
const Wallet = require('../models/Wallet');
require('dotenv').config();

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

      // Create payment parameters
      const vnp_Params = this.getPaymentParams({
        amount,
        bankCode,
        createDate,
        ipAddr,
        language,
        orderId
      });
      if(amount < 120000) {
        return res.status(400).json({
          status: 'error',
          message: 'Số tiền nạp tối thiểu là 120.000 VND'
      });
    };
      // Save payment transaction to the database
      await PaymentTransaction.create({
        id: orderId,
        user_id: id,
        amount: amount,
        status: 'pending' // Set initial transaction status
      });

      // Generate the secure hash
      const signData = this.generateSecureHash(vnp_Params);

      // Add secure hash to the parameters
      vnp_Params['vnp_SecureHashType'] = 'MD5';
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

    const hashInput = this.secretKey + sortedParams; // Concatenate with secret key
    return crypto.createHash('md5').update(hashInput).digest('hex');
  }
  async verifyVnpayReturn(req, res) {
    const data = req.query.data;
    const dataArray = data.split("|");
    const receivedSign = req.query.sign;
    if ( !data || !receivedSign) {
      return false;
    }
    const md5Hash = crypto.createHash('md5');
    md5Hash.update(data + "|" + this.secretKey);
    const calculatedSign = md5Hash.digest('hex').toUpperCase();
    const valid =  calculatedSign === receivedSign;
    const orderId = dataArray[2];
    const paymentTransaction = await PaymentTransaction.findByPk(orderId);
    const wallet = await Wallet.findOne({ where: { user_id: paymentTransaction.user_id } });
    if(valid && dataArray[0]=="00") {
      if(wallet.expired_at < new Date()) {
        wallet.balance = 0;
      }
      let expried_at = new Date(wallet.expired_at);
      // save data to database
      if(paymentTransaction.amount <= 120000) {
        expried_at.setDate(expried_at.getDate() + 30);
        wallet.expried_at = expried_at;
      }
      else if(paymentTransaction.amount >= 1200000) {
        expried_at.setDate(expried_at.getDate() + 365);
        wallet.expried_at = expried_at;
      }
      paymentTransaction.status = 'success';
      await paymentTransaction.save();
      wallet.balance += paymentTransaction.amount;
      await wallet.save();
    }
    else {
      paymentTransaction.status = 'failed';
      await paymentTransaction.save();
    }
    res.redirect(`${this.feUrl}/payment/return?data=${encodeURIComponent(data)}&is_valid=${valid}`);
  }

  getPaymentParams({ amount, bankCode, createDate, ipAddr, language, orderId }) {
    return this.sortObject({
      "vnp_Amount": amount * 100,  // Amount should be in the smallest currency unit (e.g., VND)
      "vnp_Command": "pay",
      "vnp_CreateDate": createDate,
      "vnp_CurrCode": "VND",
      "vnp_IpAddr": ipAddr,
      "vnp_Locale": language || "vn",
      "vnp_OrderInfo": `Thanh toan goi BITGROUP AI gia: ${amount*100}, ma: ${orderId}`,
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
}

module.exports = new VnpayController();
