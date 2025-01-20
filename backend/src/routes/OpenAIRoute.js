const express = require('express');
const openAIController = require("../controllers/OpenAIController");
const jwtMiddleware = require('../middleware/JWTMiddleware');
const checkBalanceMiddleware = require('../middleware/CheckBalanceMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();
router.use(jwtMiddleware(["user", "admin"]));
router.post(
    "/upload-file",
    upload.single('file'),
    (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: 'File is required.' });
        }
        next(); 
    },
    openAIController.uploadFile.bind(openAIController)
);
router.get("/count-conversations", openAIController.countConversations.bind(openAIController));
router.get("/get-balance", openAIController.getBalance.bind(openAIController));
router.use(checkBalanceMiddleware());
router.get("/chat-stream", openAIController.streamChat.bind(openAIController));
router.get("/chat-stream-image", openAIController.streamChatImage.bind(openAIController));
router.get("/text-to-image", openAIController.textToImage.bind(openAIController));
router.post("/save-image", openAIController.saveImage.bind(openAIController));
router.post("/text-to-speech", openAIController.textToVoice.bind(openAIController));
// router.get("/chat-completion", openAIController.chatCompletion.bind(openAIController));
// router.get("/create-conversation", openAIController.createConversation.bind(openAIController));
module.exports = router;