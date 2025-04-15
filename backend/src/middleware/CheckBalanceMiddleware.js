const Wallet = require("../models/Wallet");
// const Pricing = require("../models/Pricing"); // Added missing import

module.exports = function () {
    return async (req, res, next) => {
        try {
            const minimumBalance = 0;
            const isChatStream = req.url.includes('chat-stream') || req.url.includes('chat-stream-image');
            const isTextToImage = req.url.includes('text-to-image');

            if (isChatStream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.flushHeaders();
            }

            // // Helper function to send responses
            // const sendResponse = (message, status = 400) => {
            //     if (isChatStream) {
            //         res.write(`data: ${JSON.stringify(message)}\n\n`);
            //         res.end();
            //     } else {
            //         res.status(status).json({ message });
            //     }
            // };
            // const pricing = await Pricing.findOne({ where: { type:req.user.plan } });
            // if (!pricing) return sendResponse("Gói cước không hợp lệ");
            // const model = req.body.model || req.query.model;
            // const featureList = pricing.features.split(", ").map(f => f.trim());
            // if (!featureList.includes(model) && !featureList.includes("all")&&!isTextToImage) {
            //     return sendResponse("Gói cước không hỗ trợ mô hình hiện tại");
            // }

            // // Fetch wallet and check balance
            // const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            // if (!wallet) return sendResponse("Không tìm thấy ví của người dùng.", 404);
            
            // if (wallet.balance <= minimumBalance) {
            //     return sendResponse(`Số dư không đủ. Cần tối thiểu ${minimumBalance} BTG.`);
            // }

            // if (new Date(wallet.expired_at).getTime() < Date.now()) {
            //     return sendResponse("Tài khoản của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.");
            // }
            next();
        } catch (error) {
            console.error("Middleware Error:", error);
            if (res.headersSent) return; // Prevent sending headers twice in case of async issues
            res.status(500).json({ message: "Lỗi khi kiểm tra số dư" });
        }
    };
};
