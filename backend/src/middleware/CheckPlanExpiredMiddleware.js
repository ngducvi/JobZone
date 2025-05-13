const User = require("../models/User");
const NotificationController = require("../controllers/NotificationController");
const Notifications = require("../models/Notifications");
const { Op } = require("sequelize");

module.exports = function () {
    return async (req, res, next) => {
        try {
            // Skip if no user or user is already on Basic plan
            if (!req.user || req.user.plan === 'Basic') {
                return next();
            }

            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            // Check if plan is expired
            if (user.plan_expired_at && new Date(user.plan_expired_at) < new Date()) {
                // Check if we already sent an expiration notification today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const existingNotification = await Notifications.findOne({
                    where: {
                        user_id: user.id,
                        type: 'subscription_expired',
                        created_at: {
                            [Op.gte]: today
                        }
                    }
                });

                // Update to Basic plan
                user.plan = 'Basic';
                user.plan_expired_at = null;
                await user.save();

                // Update the req.user object to reflect changes
                req.user.plan = 'Basic';
                req.user.plan_expired_at = null;

                // Only send notification if we haven't sent one today
                if (!existingNotification) {
                    await NotificationController.createSubscriptionExpiredNotification(user.id);
                }
            }

            next();
        } catch (error) {
            console.error("Plan Check Middleware Error:", error);
            next(error);
        }
    };
}; 