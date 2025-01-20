const Wallet = require("../models/Wallet");

module.exports = function () {
    return async (req, res, next) => {
        try {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            const minimumBalance = 1000;
            const isChatStream = req.url.includes('chat-stream') || req.url.includes('chat-stream-image');
            if (isChatStream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.flushHeaders();
            }
            if (wallet.balance <= minimumBalance) {
                const message = `Số dư không đủ. Cần tối thiểu ${minimumBalance} BTG.`;
                if (isChatStream) {
                    res.write(`data: ${JSON.stringify(message)}\n\n`);
                    res.end();
                } else {
                    res.status(400).json({ message: message });
                }
                return;
            }
            else if(new Date(wallet.expired_at).getTime() < new Date().getTime()) {
                const message = `Tài khoản của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.`;
                if (isChatStream) {
                    res.write(`data: ${JSON.stringify(message)}\n\n`);
                    res.end();
                } else {
                    res.status(400).json({ message: message });
                }
                return;
            }
            next();
        } catch (error) {
            console.log(error);
            const errorMessage = "Lỗi khi kiểm tra số dư";
            if (isChatStream) {
                res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
                res.end();
            } else {
                res.status(500).json({ message: errorMessage });
            }
            return;
        }
    };
};