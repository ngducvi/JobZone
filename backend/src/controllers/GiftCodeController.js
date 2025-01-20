const GiftCode = require("../models/GiftCode");
const Wallet = require("../models/Wallet");
class GiftCodeController {
  async createGiftCode(req, res) {
    const { code, value } = req.body;
    const giftCode = await GiftCode.create({ code, value });
    return res.json(giftCode);
  }
  async getGiftCodes(req, res) {
    const giftCodes = await GiftCode.findAll();
    return res.json(giftCodes);
  }
  async checkGiftCode(req, res) {
    const { code } = req.body;
    const giftCode = await GiftCode.findOne({ where: { code } });
    if (!giftCode) {
      return res.status(400).json({ message: "Mã quà tặng không tồn tại." });
    }
    if (giftCode.expired_at < new Date()) {
      return res.status(400).json({ message: "Mã quà tặng đã hết hạn." });
    }
    if (giftCode.is_used) {
      return res.status(400).json({ message: "Mã quà tặng đã được sử dụng." });
    }
    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    if (!wallet) {
      return res.status(400).json({ message: "Ví không tồn tại." });
    }
    if(wallet.expired_at < new Date()) {
      wallet.balance = 0;
    }
    const date = new Date(wallet.expired_at);
    date.setDate(date.getDate() + 5);
    wallet.expired_at = date;
    wallet.balance += giftCode.amount;
    await wallet.save();
    giftCode.is_used = true;
    giftCode.user_id = req.user.id;
    giftCode.used_at = new Date();
    await giftCode.save();
    // hiển thị thêm amount khi nhập thành công
    return res.json({ message: "Nhập mã thành công", amount: giftCode.amount });
  }
}
module.exports = new GiftCodeController();
