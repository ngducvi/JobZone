const { Op } = require('sequelize');
const Notifications = require('../models/Notifications');
const { getIO } = require('../../src/config/socket');
const Messages = require('../models/Messages');
const Conversation = require('../models/Conversation');
const NotificationController = require('./NotificationController');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const RecruiterCompanies = require('../models/RecruiterConpanies');
const Company = require('../models/Company');

class MessagesController {
    constructor() {
        this.generateMessageId = () => {
            return Math.floor(Math.random() * 1000000000);
        };
        this.generateConversationId = () => {
            return Math.floor(Math.random() * 1000000000);
        };
    }
    // get conversation by user21_id || user2_id
    async getConversationByUserId(req, res) {
        try {
            const { user_id } = req.params;
            const conversations = await Conversation.findAll({
                where: {
                    [Op.or]: [
                        { user1_id: user_id },
                        { user2_id: user_id }
                    ]
                },
                order: [['updated_at', 'DESC']]
            });

            // Get user type (candidate or recruiter)
            const user = await User.findByPk(user_id);
            const isRecruiter = user.role === 'recruiter';

            // Process each conversation to add candidate/company info
            const processedConversations = await Promise.all(conversations.map(async (conversation) => {
                const conversationData = conversation.toJSON();
                
                // Get the other user's ID in the conversation
                const otherUserId = conversation.user1_id === user_id ? conversation.user2_id : conversation.user1_id;

              
                
                if (isRecruiter) {
                    // Nếu người dùng là recruiter, lấy candidate theo user_id của đối phương  lấy candidate_id từ user_id
                    const candidate = await Candidate.findOne({
                        where: { user_id: otherUserId }
                    });
                    if (candidate) {
                        conversationData.candidate_info = candidate;
                    }
                    // từ candidate_id lấy thông tin candidate
                    const candidateDetail = await Candidate.findByPk(candidate.id);
                    conversationData.candidate_info = candidateDetail;
                   
                } else {
                    // If current user is candidate, get company info
                    const recruiterCompany = await RecruiterCompanies.findOne({
                        where: { user_id: otherUserId }
                    });
                    if (recruiterCompany) {
                        const company = await Company.findByPk(recruiterCompany.company_id);
                        if (company) {
                            conversationData.company_info = company;
                        }
                    }
                }

                return conversationData;
            }));

            return res.status(200).json({
                success: true,
                data: processedConversations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy cuộc hội thoại'
            });
        }
    }
    // get messages by conversation_id
    async getMessagesByConversationId(req, res) {
        try {
            const { conversation_id } = req.params;
            const messages = await Messages.findAll({ 
                where: { conversation_id },
                order: [['created_at', 'ASC']]
            });
            return res.status(200).json({
                success: true,
                data: messages
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy tin nhắn'
            });
        }
    }

    // get all conversations
    async getAllConversations(req, res) {
        try {
            const conversations = await Conversation.findAll();
            return res.status(200).json({
                success: true,
                data: conversations
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi lấy danh sách cuộc hội thoại'
            });
        }
    }
    // gửi tin nhắn
    async sendMessage(req, res) {
        try {
            const { conversation_id, message } = req.body;
            const newMessage = await Messages.create({
                id: this.generateMessageId(),
                conversation_id,
                sender_id: req.user.id,
                content: message,
                created_at: new Date()
            });

            // Get conversation details
            const conversation = await Conversation.findByPk(conversation_id);
            if (!conversation) {
                throw new Error('Conversation not found');
            }

            // Emit new message to all users in the conversation
            const io = getIO();
            io.to(`conversation_${conversation_id}`).emit('new_message', newMessage);

            // Update conversation's last message
            await conversation.update({
                last_message: message,
                last_message_at: new Date()
            });

            // --- CREATE NOTIFICATION FOR RECIPIENT ---
            // Determine recipient (the other user in the conversation)
            let recipientId;
            if (conversation.user1_id == req.user.id) {
                recipientId = conversation.user2_id;
            } else {
                recipientId = conversation.user1_id;
            }
            // Avoid sending notification to self
            if (recipientId && recipientId != req.user.id) {
                await NotificationController.createNotification({
                    user_id: recipientId,
                    sender_id: req.user.id,
                    type: 'new_message',
                    title: `Bạn có tin nhắn mới từ ${conversation.user1_id == req.user.id ? conversation.user2_id : conversation.user1_id}`,
                    content: message,
                    data: {
                        conversation_id,
                        message_id: newMessage.id,
                        action: 'new_message'
                    }
                });
            }
            // --- END NOTIFICATION ---

            return res.status(200).json({
                success: true,
                message: 'Tin nhắn đã được gửi thành công',
                data: newMessage
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi gửi tin nhắn'
            });
        }
    }
    // xóa cuộc hội thoại và tất cả tin nhắn trong cuộc hội thoại
    async deleteConversation(req, res) {
        try {
            const { conversation_id } = req.params;
            await Conversation.destroy({
                where: { id: conversation_id }
            });
            await Messages.destroy({
                where: { conversation_id }
            });
            
            return res.status(200).json({
                success: true,
                message: 'Cuộc hội thoại đã được xóa thành công'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa cuộc hội thoại'
            });
        }
    }
    // Chỉnh sửa tin nhắn
    async editMessage(req, res) {
        try {
            const { message_id, message } = req.body;
            const [updatedCount, [updatedMessage]] = await Messages.update(
                { content: message },
                { 
                    where: { id: message_id },
                    returning: true
                }
            );

            if (updatedCount === 0) {
                throw new Error('Message not found');
            }

            // Emit edited message to all users in the conversation
            const io = getIO();
            io.to(`conversation_${updatedMessage.conversation_id}`).emit('message_updated', updatedMessage);

            return res.status(200).json({
                success: true,
                message: 'Tin nhắn đã được chỉnh sửa thành công',
                data: updatedMessage
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi chỉnh sửa tin nhắn'
            });
        }
    }
    // tạo conversation mới
    async createConversation(req, res) {
        try {
            const { user1_id, user2_id } = req.body;

            // Kiểm tra đã tồn tại conversation giữa 2 user chưa (không phân biệt thứ tự)
            let conversation = await Conversation.findOne({
                where: {
                    [Op.or]: [
                        { user1_id, user2_id },
                        { user1_id: user2_id, user2_id: user1_id }
                    ]
                }
            });

            if (conversation) {
                // Nếu đã tồn tại, trả về conversation cũ
                return res.status(200).json({
                    success: true,
                    message: 'Cuộc hội thoại đã tồn tại',
                    data: conversation
                });
            }

            // Nếu chưa tồn tại, tạo mới
            const newConversation = await Conversation.create({
                id: this.generateConversationId(),
                user1_id,
                user2_id,
                created_at: new Date()
            });

            // Emit new conversation to both users
            const io = getIO();
            io.to(`user_${user1_id}`).to(`user_${user2_id}`).emit('new_conversation', newConversation);

            return res.status(200).json({
                success: true,
                message: 'Cuộc hội thoại đã được tạo thành công',
                data: newConversation
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi tạo cuộc hội thoại'
            });
        }
    }
    // xóa tin nhắn
    async deleteMessage(req, res) {
        try {
            const { message_id } = req.body;
            const message = await Messages.findByPk(message_id);
            
            if (!message) {
                throw new Error('Message not found');
            }

            await message.destroy();

            // Emit deleted message to all users in the conversation
            const io = getIO();
            io.to(`conversation_${message.conversation_id}`).emit('message_deleted', message_id);

            return res.status(200).json({
                success: true,
                message: 'Tin nhắn đã được xóa thành công'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi khi xóa tin nhắn'
            });
        }
    }
}

module.exports = new MessagesController();
