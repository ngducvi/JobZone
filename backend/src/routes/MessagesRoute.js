const express = require('express');
const messagesController = require("../controllers/MessagesController");
const jwtMiddleware = require('../middleware/JWTMiddleware');
const router = express.Router();

router.use(jwtMiddleware(["user", "admin","recruiter"]));

router.get('/conversations', messagesController.getAllConversations.bind(messagesController));
router.get('/conversations/:user_id', messagesController.getConversationByUserId.bind(messagesController));
router.get('/messages/:conversation_id', messagesController.getMessagesByConversationId.bind(messagesController));
router.post('/send-message', messagesController.sendMessage.bind(messagesController));
router.put('/edit-message', messagesController.editMessage.bind(messagesController));
router.delete('/delete-message', messagesController.deleteMessage.bind(messagesController));
router.post('/create-conversation', messagesController.createConversation.bind(messagesController));
router.put('/mark-messages-read', messagesController.markMessagesAsRead.bind(messagesController));
router.put('/reset-unread-count', messagesController.resetUnreadCount.bind(messagesController));
router.get('/total-unread/:user_id', messagesController.getTotalUnreadMessages.bind(messagesController));

module.exports = router;