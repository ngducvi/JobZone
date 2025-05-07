// backend/src/controllers/NotificationController.js

const Notifications = require('../models/Notifications');
const { getIO } = require('../../src/config/socket');
const Message = require('../models/Messages');
const Conversation = require('../models/Conversation');

class NotificationController {
    constructor() {
        this.generateNotificationId = () => {
            return Math.floor(Math.random() * 1000000000);
        };
    }
    // Tạo thông báo chung
    async createNotification(data) {
        try {
            const notification = await Notifications.create({
                id: this.generateNotificationId(),
                user_id: data.user_id,
                sender_id: data.sender_id,
                type: data.type,
                title: data.title,
                content: data.content,
                data: data.data || null,
                is_read: false
            });

            // Gửi thông báo real-time qua Socket.IO
            const io = getIO();
            if (io) {
                // Emit to specific user's room
                io.to(`user_${data.user_id}`).emit('new_notification', notification);
                console.log('Notification sent to user:', data.user_id, 'Notification:', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error in createNotification:', error);
            throw error;
        }
    }

    // Tạo thông báo duyệt tài khoản
    async createAccountVerificationNotification(userId) {
        return this.createNotification({
            user_id: userId,
            type: 'account_verification',
            title: 'Tài khoản đã được duyệt',
            content: 'Chúc mừng! Tài khoản của bạn đã được duyệt thành công.',
            data: {
                status: 'approved',
                action: 'account_verification'
            }
        });
    }

    // Tạo thông báo ứng tuyển cho nhà tuyển dụng
    async createJobApplicationNotification(userId, candidateId, jobId) {
        try {
            const notification = await this.createNotification({
                user_id: userId,
                sender_id: candidateId,
                type: 'job_application',
                title: 'Có ứng viên mới ứng tuyển',
                content: 'Có ứng viên mới ứng tuyển vào vị trí của bạn.',
                data: {
                    job_id: jobId,
                    action: 'job_application'
                }
            });

            return notification;
        } catch (error) {
            console.error('Error in createJobApplicationNotification:', error);
            throw error;
        }
    }
    // tạo thông báo ứng viên đã rút đơn ứng tuyển
    async createWithdrawApplicationNotification(userId, candidateId, jobId) {
        try {
            const notification = await this.createNotification({
                user_id: userId,
                sender_id: candidateId,
                type: 'application_cancelled',
                title: 'Ứng viên đã rút đơn ứng tuyển',
                content: 'Ứng viên đã rút đơn ứng tuyển vào vị trí của bạn.',
                data: {
                    job_id: jobId,
                    action: 'application_cancelled'
                }
            });
            return notification;
        } catch (error) {
            console.error('Error in createWithdrawApplicationNotification:', error);
            throw error;
        }
    }

    // Tạo thông báo phản hồi cho ứng viên
    async createApplicationResponseNotification(userId, recruiterId, jobId, applicationId, status, companyName) {
        let notificationContent = '';

        switch (status) {
            case 'Đang xét duyệt':
                notificationContent = `Đơn ứng tuyển của bạn tại ${companyName} đang được xem xét.`;
                break;
            case 'Chờ phỏng vấn':
                notificationContent = `Chúc mừng! Bạn đã được ${companyName} chọn để phỏng vấn.`;
                break;
            case 'Đã phỏng vấn':
                notificationContent = `Cảm ơn bạn đã tham gia phỏng vấn tại ${companyName}. Chúng tôi sẽ sớm phản hồi.`;
                break;
            case 'Đạt phỏng vấn':
                notificationContent = `Chúc mừng! Bạn đã vượt qua vòng phỏng vấn tại ${companyName}.`;
                break;
            case 'Đã nhận':
                notificationContent = `Chúc mừng! Bạn đã được ${companyName} nhận vào vị trí này.`;
                break;
            case 'Đã từ chối':
                notificationContent = `Rất tiếc, đơn ứng tuyển của bạn tại ${companyName} đã bị từ chối.`;
                break;
            case 'Hết hạn':
                notificationContent = `Đơn ứng tuyển của bạn tại ${companyName} đã hết hạn.`;
                break;
            case 'Đã rút đơn':
                notificationContent = `Bạn đã rút đơn ứng tuyển tại ${companyName} thành công.`;
                break;
            default:
                notificationContent = `Trạng thái đơn ứng tuyển của bạn tại ${companyName} đã được cập nhật thành: ${status}`;
        }

        return this.createNotification({
            user_id: userId,
            sender_id: recruiterId,
            type: 'application_response',
            title: 'Phản hồi đơn ứng tuyển',
            content: notificationContent,
            data: {
                job_id: jobId,
                application_id: applicationId,
                status: status,
                action: 'application_response'
            }
        });
    }

    // Tạo thông báo ứng viên hủy đơn ứng tuyển
    async createApplicationCancelledNotification(recruiterId, candidateId, jobId, applicationId) {
        return this.createNotification({
            user_id: recruiterId,
            sender_id: candidateId,
            type: 'application_cancelled',
            title: 'Ứng viên đã hủy đơn ứng tuyển',
            content: 'Một ứng viên đã hủy đơn ứng tuyển vào vị trí của bạn.',
            data: {
                job_id: jobId,
                application_id: applicationId,
                action: 'application_cancelled'
            }
        });
    }

    // Tạo thông báo công việc  được duyệt được đóng hoặc hết hạn
    async createJobClosedNotification(jobId, userId, status, title) {
        // type: DataTypes.ENUM('Active', 'Closed','Pending'),
        let notificationContent = '';
        switch (status) {
            case 'Active':
                notificationContent = `Công việc ${title} đã được xét duyệt và đang được tuyển dụng.`;
                break;
            case 'Closed':
                notificationContent = `Công việc ${title} đã được xét duyệt và đã đóng.`;
                break;
            case 'Pending':
                notificationContent = `Công việc ${title} đang chờ xét duyệt.`;
                break;
        }

        return this.createNotification({
            user_id: userId,
            type: 'job_closed',
            title: 'Thông báo về công việc',
            content: notificationContent,
            data: {
                job_id: jobId,
                action: 'job_closed',
                status: status,
                title: title
            }
        });
    }

    // Tạo thông báo CV được duyệt/từ chối
    async createCVReviewedNotification(userId, status) {
        return this.createNotification({
            user_id: userId,
            type: 'cv_reviewed',
            title: `CV của bạn đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
            content: `CV của bạn đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}.`,
            data: {
                status: status,
                action: 'cv_reviewed'
            }
        });
    }

    // Tạo thông báo thanh toán thành công
    async createPaymentSuccessNotification(userId, amount, plan) {
        return this.createNotification({
            user_id: userId,
            type: 'payment_success',
            title: 'Thanh toán thành công',
            content: `Thanh toán ${amount} VNĐ cho gói ${plan} đã thành công.`,
            data: {
                amount: amount,
                plan: plan,
                action: 'payment_success'
            }
        });
    }

    // Tạo thông báo thanh toán thất bại
    async createPaymentFailedNotification(userId, amount, plan) {
        return this.createNotification({
            user_id: userId,
            type: 'payment_failed',
            title: 'Thanh toán thất bại',
            content: `Thanh toán ${amount} VNĐ cho gói ${plan} không thành công. Vui lòng thử lại.`,
            data: {
                amount: amount,
                plan: plan,
                action: 'payment_failed'
            }
        });
    }

    // Tạo thông báo gói dịch vụ sắp hết hạn
    async createSubscriptionExpiringNotification(userId, daysLeft) {
        return this.createNotification({
            user_id: userId,
            type: 'subscription_expiring',
            title: 'Gói dịch vụ sắp hết hạn',
            content: `Gói dịch vụ của bạn sẽ hết hạn sau ${daysLeft} ngày.`,
            data: {
                days_left: daysLeft,
                action: 'subscription_expiring'
            }
        });
    }

    // Tạo thông báo gói dịch vụ đã hết hạn
    async createSubscriptionExpiredNotification(userId) {
        return this.createNotification({
            user_id: userId,
            type: 'subscription_expired',
            title: 'Gói dịch vụ đã hết hạn',
            content: 'Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.',
            data: {
                action: 'subscription_expired'
            }
        });
    }

    // Tạo thông báo có đánh giá mới về công ty
    async createCompanyReviewNotification(userId, candidate_id,user_name, rating) {
        return this.createNotification({
            user_id: userId,
            sender_id: candidate_id,
            type: 'company_review',
            title: 'Có đánh giá mới về công ty của bạn',
            content: `Công ty của bạn vừa nhận được một đánh giá ${rating} sao từ ${user_name}.`,
            data: {
                // company_id: companyId,
                rating: rating,
                action: 'company_review'
            }
        });
    }

    // Tạo thông báo thay đổi trạng thái ứng viên
    async createCandidateStatusNotification(userId, status) {
        try {
            let title = '';
            let content = '';

            switch (status) {
                case 'Active':
                    title = 'Tài khoản đã được kích hoạt';
                    content = 'Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể sử dụng đầy đủ các tính năng của hệ thống.';
                    break;
                case 'Pending':
                    title = 'Tài khoản đang chờ duyệt';
                    content = 'Tài khoản của bạn đang trong trạng thái chờ duyệt. Vui lòng chờ quản trị viên xử lý.';
                    break;
                case 'Closed':
                    title = 'Tài khoản đã bị khóa';
                    content = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.';
                    break;
                default:
                    throw new Error('Invalid status');
            }

            const notification = await this.createNotification({
                user_id: userId,
                type: 'system',
                title: title,
                content: content,
                data: {
                    status: status,
                    action: 'candidate_status_change'
                }
            });

            return notification;
        } catch (error) {
            console.error('Error in createCandidateStatusNotification:', error);
            throw error;
        }
    }
    // Tạo thông báo thay đổi trạng thái công ty
    async createCompanyStatusNotification(userId, status) {
        try {
            let title = '';
            let content = '';

            switch (status) {
                case 'pending':
                    title = 'Hồ sơ công ty đang được xét duyệt';
                    content = 'Hồ sơ công ty của bạn đang được quản trị viên xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.';
                    break;
                case 'active':
                    title = 'Hồ sơ công ty đã được phê duyệt';
                    content = 'Chúc mừng! Hồ sơ công ty của bạn đã được phê duyệt. Bạn có thể bắt đầu sử dụng đầy đủ các tính năng của hệ thống.';
                    break;
                case 'rejected':
                    title = 'Hồ sơ công ty không được phê duyệt';
                    content = 'Rất tiếc, hồ sơ công ty của bạn chưa đáp ứng đủ yêu cầu. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.';
                    break;
                default:
                    throw new Error('Invalid status');
            }

            const notification = await Notifications.create({
                user_id: userId,
                title: title,
                content: content,
                type: 'system',
                is_read: false,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Emit socket event
            const io = getIO();
            io.to(`user_${userId}`).emit('new_notification', notification);

            return notification;
        } catch (error) {
            console.error('Error in createCompanyStatusNotification:', error);
            throw error;
        }
    }
    // tạo thông báo apply job cho nhà tuyển dụng
    async createApplyJobNotification(userId, candidateId, jobId) {
        try {
            const notification = await this.createNotification({
                user_id: userId,
                sender_id: candidateId,
                type: 'apply_job',
                title: 'Ứng viên đã ứng tuyển vào công việc của bạn',
                content: 'Ứng viên đã ứng tuyển vào công việc của bạn.',
                data: {
                    job_id: jobId,
                    action: 'apply_job'
                }
            });
            return notification;
        } catch (error) {
            console.error('Error in createApplyJobNotification:', error);
            throw error;
        }
    }
    // Lấy danh sách thông báo của user
    async getUserNotifications(userId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await Notifications.findAndCountAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']],
                limit: limit,
                offset: offset
            });

            return {
                count,
                rows,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('Error in getUserNotifications:', error);
            throw new Error('Lỗi khi lấy danh sách thông báo');
        }
    }

    // Đánh dấu một thông báo đã đọc
    async markAsRead(notificationId, userId) {
        try {
            const [updated] = await Notifications.update(
                { is_read: true },
                {
                    where: {
                        id: notificationId,
                        user_id: userId
                    }
                }
            );

            if (updated === 0) {
                throw new Error('Không tìm thấy thông báo');
            }

            return true;
        } catch (error) {
            console.error('Error in markAsRead:', error);
            throw new Error('Lỗi khi đánh dấu thông báo đã đọc');
        }
    }

    // Đánh dấu tất cả thông báo đã đọc
    async markAllAsRead(userId) {
        try {
            await Notifications.update(
                { is_read: true },
                {
                    where: {
                        user_id: userId,
                        is_read: false
                    }
                }
            );

            return true;
        } catch (error) {
            console.error('Error in markAllAsRead:', error);
            throw new Error('Lỗi khi đánh dấu tất cả thông báo đã đọc');
        }
    }

    // Đếm số thông báo chưa đọc
    async countUnreadNotifications(userId) {
        try {
            const count = await Notifications.count({
                where: {
                    user_id: userId,
                    is_read: false
                }
            });
            return count;
        } catch (error) {
            throw error;
        }
    }

    // Xóa một thông báo
    async deleteNotification(notificationId, userId) {
        try {
            const deleted = await Notifications.destroy({
                where: {
                    id: notificationId,
                    user_id: userId
                }
            });

            if (deleted === 0) {
                throw new Error('Không tìm thấy thông báo');
            }

            return true;
        } catch (error) {
            console.error('Error in deleteNotification:', error);
            throw new Error('Lỗi khi xóa thông báo');
        }
    }

    // Xóa tất cả thông báo đã đọc
    async deleteAllReadNotifications(userId) {
        try {
            const deleted = await Notifications.destroy({
                where: {
                    user_id: userId,
                    is_read: true
                }
            });

            return deleted;
        } catch (error) {
            console.error('Error in deleteAllReadNotifications:', error);
            throw new Error('Lỗi khi xóa tất cả thông báo đã đọc');
        }
    }
}

module.exports = new NotificationController();