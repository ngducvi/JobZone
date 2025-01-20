const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (requiredRoles = []) {
    return async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).send({ message: 'Truy cập bị từ chối, không có token', code: -1 });
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            if (requiredRoles.length && !requiredRoles.includes(req.user.role)) {
                return res.status(403).send({ message: 'Truy cập bị từ chối, quyền hạn không đủ', code: -1 });
            }
            next();
        } catch (error) {
            res.status(400).send({ message: 'Token không hợp lệ, vui lòng đăng nhập' });
        }
    };
};
